const router = require("koa-router")();
const schema = require("@src/chainflow/schema");

router.get("/schema", async ({ request, response }) => {
  // console.log("schema", schema);
  return response.success(schema);
});

module.exports = exports = router.routes();