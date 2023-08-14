const router = require("koa-router")();

router.prefix("/api/chainflow");

const modules = [
  "run", // stream 格式返回
  "run-sse", // sse 格式返回
  'log', // 日志查询
  'schema', // 节点定义
  'debug-sse', // 节点调试
];

for (const module of modules) {
  try {
    router.use(require(`./${module}.js`));
  } catch (error) {
    console.log(`load ${module} error`, error);
  }
}

module.exports = router.routes();
