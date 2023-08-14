const router = require("koa-router")();
const PromptChainLog = require("@src/sequelize/promptChainLog");

router.get("/log", async ({ request, response }) => {
  // 记录请求 IP
  const headers = request.headers;
  const IP_ADDRESS = headers["x-real-ip"] || headers["x-forwarded-for"] || request.ip;
  console.log(request.ip, headers, IP_ADDRESS);
  const uuid = request.query.uuid;
  const chainLog = await PromptChainLog.findOne({ where: { uuid } });
  return response.success(chainLog);
});

module.exports = exports = router.routes();