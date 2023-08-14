const router = require("koa-router")();
const { PassThrough } = require("stream");
const PromptChain = require("@src/sequelize/promptChain");
const PromptChainLog = require("@src/sequelize/promptChainLog");
const { v4: uuidv4 } = require('uuid');
const { fetchMemory, updateMemory } = require('@src/utils/memory.js');
const { streaming } = require("@src/chainflow/common/stream");
const Chain = require("@src/chainflow/Chain.js");

const createPromptChainLog = async (options) => {
  const { chainId, uuid, tokenConsumed, executionTime, results, messageId } = options;
  const log = {};
  log.chainId = chainId;
  log.messageId = messageId;
  log.createTime = new Date();
  log.updateTime = new Date();
  log.uuid = uuid;
  log.results = results;
  log.tokenConsumed = tokenConsumed;
  log.executionTime = executionTime;
  const result = await PromptChainLog.create(log).catch((error) => {
    return error;
  });
  return result;
}

router.post("/run", async (ctx) => {
  // 获取 POST 请求的数据
  const { request, response } = ctx;
  const body = ctx.request.fields || {};
  // 记录请求 IP
  const headers = ctx.request.headers;
  console.log("headers", headers);
  body.IP_ADDRESS = headers["x-real-ip"] || headers["x-forwarded-for"] || request.ip;
  if (body.IP_ADDRESS == '::ffff:127.0.0.1') {
    body.IP_ADDRESS = '101.39.222.242'
  }
  console.log("body.userId", body.userId, "body.chainId", body.chainId);
  body.userId = body.userId || 1;

  const startTime = Date.now();
  const chainId = body.chainId;
  const messageId = body.messageId || 0;
  const promptChain = await PromptChain.findByPk(chainId).catch((error) => {
    return error;
  });

  const stream = new PassThrough();

  // 设置响应头
  ctx.set("Content-Type", "text/plain");
  ctx.set("Transfer-Encoding", "chunked");

  // UUID
  const uuid = uuidv4();
  ctx.set("Chain-Execution-UUID", uuid);

  const onTokenStream = (token) => {
    stream.write(token);
  };

  // MEMORY 处理
  const chatId = body.chatId;
  if (chatId) {
    const memory = await fetchMemory(chatId, chainId);
    body.memory = memory;
    body.MEMORY = memory.value || {}
  }

  if (promptChain && promptChain.id) {
    const chain = new Chain(promptChain, body, onTokenStream);
    chain.start().then((result) => {
      console.log("最终结果:", result, body['TOKEN_CONSUMED']);
      const TOKEN_CONSUMED = body['TOKEN_CONSUMED'];
      console.log("Token-Consumed", JSON.stringify(TOKEN_CONSUMED));
      // stream.write(`<CHAIN-STREAM-END>${JSON.stringify(TOKEN_CONSUMED)}`)
      const results = body['__RECORDS'] || [];
      const executionTime = Date.now() - startTime;
      let resCount = 0
      for (let res of results) {
        if (res.title == "根据向量从向量数据库中查询相关向量") {
          res.matches = body['__MATCHES'][resCount]
          resCount++
        }
      }
      createPromptChainLog({ chainId, uuid, tokenConsumed: TOKEN_CONSUMED, executionTime, results, messageId }).then(res => {
        if (chatId && body.memory) {
          updateMemory(body.memory, body.MEMORY).then(() => {
            stream.end();
          })
        } else {
          stream.end();
        }
      });
    });
  } else {
    console.log("promptChain", promptChain)
    streaming("chain not found", onTokenStream, 20).then(res => {
      stream.end();
    })
  }

  ctx.body = stream;
  ctx.status = 200;
});

module.exports = exports = router.routes();
