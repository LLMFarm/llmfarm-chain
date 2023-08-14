const router = require("koa-router")();
const { PassThrough } = require("stream");
const PromptChain = require("@src/sequelize/promptChain");
const PromptChainLog = require("@src/sequelize/promptChainLog");
const { v4: uuidv4 } = require('uuid');
const { fetchMemory, updateMemory } = require('@src/utils/memory.js');

const Chain = require("@src/chainflow/Chain.js");

const createPromptChainLog = async (chainId, uuid, tokenConsumed, executionTime, results = {}) => {
  const log = {};
  log.chainId = chainId;
  log.createTime = new Date();
  log.updateTime = new Date();
  log.uuid = uuid;
  log.tokenConsumed = tokenConsumed;
  log.executionTime = executionTime;
  log.results = results;
  const result = await PromptChainLog.create(log).catch((error) => {
    return error;
  });
  return result;
}

router.post("/run-sse", async (ctx) => {
  // 获取 POST 请求的数据
  const { request, response } = ctx;
  const body = request.fields || {};
  // 记录请求 IP
  const headers = request.headers;
  body.IP_ADDRESS = headers["x-real-ip"] || headers["x-forwarded-for"] || request.ip;
  body.userId = body.userId || 1;

  const startTime = Date.now();
  const chainId = body.chainId;
  const promptChain = await PromptChain.findByPk(chainId).catch((error) => {
    return error;
  });

  // UUID
  const uuid = uuidv4();
  response.set("Chain-Execution-UUID", uuid);

  const stream = new PassThrough();
  // 设置响应头 response
  response.type = "text/event-stream";
  response.set("Cache-Control", "no-cache");
  response.set("Connection", "keep-alive");

  const onTokenStream = (token) => {
    // stream.write(token)
    // base64 编码
    const encoded = Buffer.from(token).toString("base64");
    stream.write("event: message\n");
    stream.write(`data: ${encoded}\n\n`);
  };

  // MEMORY 处理
  const chatId = body.chatId || 100;
  if (chatId) {
    const memory = await fetchMemory(chatId, chainId);
    body.memory = memory;
    body.MEMORY = memory.value || {}
    console.log('body.MEMORY', body.MEMORY);
  }

  const chain = new Chain(promptChain, body, onTokenStream);
  chain.start().then((result) => {
    console.log("最终结果:", result);
    const TOKEN_CONSUMED = body['TOKEN_CONSUMED'];
    // const results = body['__RESULTS'];
    const results = body['__RECORDS'] || [];
    const executionTime = Date.now() - startTime;
    createPromptChainLog(chainId, uuid, TOKEN_CONSUMED, executionTime, results).then(res => {
      if (chatId && body.memory) {
        updateMemory(body.memory, body.MEMORY).then(() => {
          stream.end();
        })
      } else {
        stream.end();
      }
    })
  });

  ctx.body = stream;
  ctx.status = 200;
});

module.exports = exports = router.routes();
