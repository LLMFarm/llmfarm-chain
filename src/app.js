require("module-alias/register");
require('dotenv').config()

const Koa = require("koa");
const app = new Koa();
const path = require('path');

const body = require("koa-better-body")({
  uploadDir: path.resolve(__dirname, '../uploads'),
  formLimit: "100mb",
  jsonLimit: "100mb",
  textLimit: "100mb",
});

const router = require("@src/routers/index");
const wrapContext = require("@src/middlewares/wrap.context");
app.use(wrapContext);

const userMiddleware = require("@src/middlewares/user");
app.use(userMiddleware);

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ctx.status} ${ms}ms`);
});

app.use(body);

// 加载路由
app.use(router);

const port = process.env.PORT;
app.listen(port, function () {
  console.log(`Listen on http://127.0.0.1:${port}`);
});
