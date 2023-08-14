const executor = require('./executor/index');
// 服务
const serviceExecutorHash = require("@src/executor/index");

const NodeExecutor = {
  async run(node, inputs, context, onTokenStream) {
    const type = node.data.type;
    const fn = executor[type];

    if (fn) {
      const result = await fn(inputs, node.data.value, context, onTokenStream, node.__IS_ENDING);
      return result;
    }
    // console.log("node", node, inputs);
    // 统一服务处理
    const serviceType = node.data.service;
    if (serviceExecutorHash[serviceType]) {
      const Executor = serviceExecutorHash[serviceType];

      // 初始化
      const executor = new Executor({}, node.data.value, context, onTokenStream, node.__IS_ENDING);
      await executor.init();

      // 执行
      const result = await executor.execute(type, inputs);
      return result;
    }

    return `${type} fn. Not Implemented`;
  }
}

module.exports = exports = NodeExecutor;