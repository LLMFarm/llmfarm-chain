const router = require("koa-router")();
const { PassThrough } = require("stream");
const PromptChain = require("@src/sequelize/promptChain");
const { streaming } = require("@src/chainflow/common/stream");

const Chain = require("@src/chainflow/Chain.js");

router.post("/debug-sse", async (ctx) => {
  // 获取 POST 请求的数据
  const { request, response } = ctx;
  const body = request.fields || {};
  // 记录请求 IP
  const headers = request.headers;
  body.IP_ADDRESS = headers["x-real-ip"] || headers["x-forwarded-for"] || request.ip;
  if (body.IP_ADDRESS == '::ffff:127.0.0.1') {
    body.IP_ADDRESS = '101.39.222.242'
  }
  console.log('IP', body.IP_ADDRESS);

  const chainId = body.chainId;
  const promptChain = await PromptChain.findByPk(chainId).catch((error) => {
    return error;
  });

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

  if (promptChain && promptChain.id) {
    const chain = new Chain(promptChain, body, onTokenStream, body.nodeId || null);
    chain.debug().then((result) => {
      console.log("最终结果:", result);
      stream.end();
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
