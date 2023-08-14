const NodeExecutor = require('./NodeExecutor')

const ModeEnum = {
  RUN: 'RUNNING',
  DEBUG: 'DEBUG',
}
const LINKED_KEY = 'linked';

const delay = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

/**
 * 流程调用链执行
 * Implemented by the GPT4 model. The prompt is referenced from the file "chain.prompt.md". 
 */
class Chain {
  constructor(data, context, onTokenStream, nodeId) {
    this.nodes = data.nodes;
    this.edges = data.edges;
    this.nodeMap = new Map();
    this.preprocess();
    this.context = context;
    this.context["__MATCHES"] = []
    this.onTokenStream = onTokenStream;
    this.nodeId = nodeId;

    this.mode = ModeEnum.RUN;

    this.HAS_ERROR = false;

    this.records = [];
  }

  preprocess() {
    const edges = this.edges || [];
    for (const edge of edges) {
      const sourceNodeId = edge.source.cell;
      const targetNodeId = edge.target.cell;
      const sourcePort = edge.source.port;
      const targetPort = edge.target.port;

      if (!this.nodeMap.has(targetNodeId)) {
        this.nodeMap.set(targetNodeId, { inputs: new Map(), outputs: new Map() });
      }

      if (!this.nodeMap.has(sourceNodeId)) {
        this.nodeMap.set(sourceNodeId, { inputs: new Map(), outputs: new Map() });
      }

      this.nodeMap.get(targetNodeId).inputs.set(targetPort, { node: sourceNodeId, outputPort: sourcePort });

      // 输出节点
      const map = this.nodeMap.get(sourceNodeId).outputs;
      const sourceNode = this.nodes.find((node) => node.id === sourceNodeId);
      if (sourceNode.data.type === 'LogicSwitch') {
        if (!map.has(sourcePort)) {
          map.set(sourcePort, [{ node: targetNodeId, inputPort: targetPort }]);
        } else {
          map.get(sourcePort).push({ node: targetNodeId, inputPort: targetPort });
        }
        continue;
      }
      map.set(sourcePort, { node: targetNodeId, inputPort: targetPort });
      // this.nodeMap.get(sourceNodeId).outputs.set(sourcePort, { node: targetNodeId, inputPort: targetPort });
    }

    try {
      this.startNode = this.nodes.find((node) => !this.nodeMap.get(node.id).inputs.size);
      this.endNode = this.nodes.find((node) => !this.nodeMap.get(node.id).outputs.size);
      this.endNode.__IS_ENDING = true;
      // 分支条件下, 多个结束节点
      for (const node of this.nodes) {
        const map = this.nodeMap.get(node.id);
        if (!map) continue;
        const outputs = this.nodeMap.get(node.id).outputs
        if (!outputs || !outputs.size) {
          node.__IS_ENDING = true;
        }
      }
    } catch (error) {
      this.HAS_ERROR = true;
      console.log("error", error);
    }
  }

  async executeNode(node, results) {
    // 实现外部接口调用，根据 node.data.type 调用相应函数
    // 这里只是一个示例，您需要根据实际情况编写逻辑
    const inputs = this.nodeMap.get(node.id).inputs;
    const inputValues = {};
    const nodeValue = node.data.value || {}

    const isDebug = this.mode === ModeEnum.DEBUG;

    // 遍历依赖关系，并递归地处理每个依赖节点
    for (const [key, value] of inputs.entries()) {
      // console.log("key", key, 'value', value);
      if (key === LINKED_KEY) { continue; }

      if (!results[value.node]) {
        const dependencyNode = this.nodes.find((n) => n.id === value.node);
        if (isDebug && nodeValue[key]) {
          console.log("调试模式，使用节点配置参数", nodeValue[key]);
          inputValues[key] = nodeValue[key];
          continue;
        }
        await this.visitNode(dependencyNode, results);
      }
      inputValues[key] = results[value.node];
    }

    /**
     * 假设有一个名为 'NodeExecutor' 的函数，接受 node 和 inputValues 作为参数
     * inputs 节点输入参数
     * inputValues 节点配置参数
     * context 请求上下文数据
     * onTokenStream 流式响应回调函数
     */
    const result = await NodeExecutor.run(node, inputValues, this.context, this.onTokenStream);
    return result;
  }

  async visitNode(node, results) {
    // console.log("visitNode", node.id, node.data.type);
    if (!results[node.id]) {
      results[node.id] = await this.executeNode(node, results);
      await this.record(node, results[node.id]);
    }
    return results[node.id];
  }

  async run() {
    const results = {};
    this.context.__RESULTS = results;
    // this.endNode.__IS_ENDING = true;
    await this.visitNode(this.endNode, results);
    return results[this.endNode.id];
  }

  // 流程调试
  async debug() {
    this.mode = ModeEnum.DEBUG;
    const results = {};
    if (this.HAS_ERROR) {
      for (const ch of "无法回答") {
        this.onTokenStream(ch);
        await delay(30);
      }
      return results;
    }
    const debugEndNode = this.nodes.find((node) => node.id == this.nodeId);
    debugEndNode.__IS_ENDING = true;
    console.log("debugEndNode", debugEndNode);
    await this.visitNode(debugEndNode, results);
    return results[debugEndNode.id];
  }

  async executeNodeNext(node, results) {
    const inputs = this.nodeMap.get(node.id).inputs;
    const inputValues = {};
    const nodeValue = node.data.value || {}
    const isDebug = this.mode === ModeEnum.DEBUG;
    // 遍历依赖关系，并递归地处理每个依赖节点
    for (const [key, value] of inputs.entries()) {
      if (!results[value.node]) {
        const dependencyNode = this.nodes.find((n) => n.id === value.node);
        if (isDebug && nodeValue[key]) {
          inputValues[key] = nodeValue[key];
          continue;
        }
        await this.visitNode(dependencyNode, results);
      }
      inputValues[key] = results[value.node];
    }
    const result = await NodeExecutor.run(node, inputValues, this.context, this.onTokenStream);
    return result;
  }

  async switchNode(nodeValue, results) {
    let matchNodeId = '';
    for (const key in nodeValue) {
      if (nodeValue[key] == true) { matchNodeId = key; break; }
    }
    const dependencyNode = this.nodes.find((n) => n.id === matchNodeId);
    // console.log("switch.node", matchNodeId, dependencyNode);
    const result = await this.visitNodeNext(dependencyNode, results);
    return result;
  }

  // 日志记录
  async record(node, result) {
    const time = Date.now();
    const record = {
      title: node.data.desc,
      time,
      result: result
    }
    this.records.push(record);
  }

  async visitNodeNext(node, results) {
    if (!node || !results) {
      return { msg: '未找到节点' };
    }
    if (!results[node.id]) {
      results[node.id] = await this.executeNodeNext(node, results);
      await this.record(node, results[node.id]);
    }
    const outputs = this.nodeMap.get(node.id).outputs;
    // console.log("node", node);
    const isBranchNode = node.data.type === 'LogicIF';
    const isSwitchNode = node.data.type === 'LogicSwitch';
    const isTrigger = node.data.type === 'Trigger';
    const nodeValue = results[node.id];
    if (isTrigger && !nodeValue) {
      return { msg: '触发器类型不匹配' };
    }

    if (isSwitchNode) {
      return await this.switchNode(nodeValue, results);
    }

    for (const [key, value] of outputs.entries()) {
      if (isBranchNode && !nodeValue[key]) {
        console.log("分支节点 forbid", key);
        continue;
      }
      const dependencyNode = this.nodes.find((n) => n.id === value.node);
      const result = await this.visitNodeNext(dependencyNode, results);
      return result
    }
    return results[node.id];
  }

  // 从开始节点进行执行
  async start() {
    const results = {};
    this.context.__RESULTS = results;
    const r = await this.visitNodeNext(this.startNode, results);
    this.context.__RECORDS = this.records;
    return r;
  }
}

module.exports = exports = Chain;