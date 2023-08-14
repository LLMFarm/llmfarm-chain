const router = require("koa-router")();

// 默认首页
router.get("/", async ({ response, request, redis }) => {
  response.body = "Hello, LLM Chain !";
  response.status = 200;
});

const modules = [
  'chainflow', // 
];

for (const module of modules) {
  try {
    // console.log('module', module);
    router.use(require(`./${module}/index.js`));
  } catch (error) {
    console.log(`load ${module} error`, error);
  }
}

try {
  router.use(require("@src/routers/dingtalk.js"));
} catch (error) { }

module.exports = exports = router.routes();
