const schema = require('@src/chainflow/schema/index');
const { streaming } = require('@src/chainflow/common/stream');
const jsonuri = require('jsonuri');
const RequestLog = require('@src/sequelize/requestLog');

class Executor {

  /**
   * 
   * @param {*} setting 服务配置信息, 一般存储 HOST, Token, Username, Password 等信息
   * @param {*} value 节点配置数据
   * @param {*} context 上下文信息
   * @param {*} onTokenStream 令牌流, 用于 stream 模式下的数据传输
   */
  constructor(setting = {}, value = {}, context = {}, onTokenStream, isEnding = false) {
    // console.log('super constructor', setting, value, context, onTokenStream, isEnding)
    this.setting = setting;
    this.value = value;
    this.context = context;
    this.onTokenStream = onTokenStream;
    this.isEnding = isEnding;
  }

  async init() {
    throw new Error('Not implemented');
  }

  async streaming(content, ms = 10) {
    return streaming(content, this.onTokenStream, ms);
  }

  async execute(type, inputs) {
    console.log('execute:', type, inputs);
    if (this.errorMessage && this.onTokenStream) {
      return streaming('\n' + this.errorMessage + '\n', this.onTokenStream, 10);
    }
    const fn = this.resolveFn(type);
    if (!fn) {
      const result = `${type} fn. Not Implemented`;
      return streaming('\n' + result + '\n', this.onTokenStream, 10);
    }
    // console.log('fn', fn);
    const result = await fn(inputs);

    // 添加判断是否使用 streaming 返回
    if (this.isEnding || type == 'SQLRun') {
      return streaming(result, this.onTokenStream, 10);
    }

    return result;
  }

  resolveFn(nodeType) {
    const node = schema[nodeType];
    if (!this[node.fn]) {
      return null;
    }
    const fn = this[node.fn].bind(this)
    return fn;
  }

  // 日志记录
  async setLogCache(requestType, uniqueValue, response, duration) {

    const log = {}
    log.requestType = requestType;
    log.uniqueValue = uniqueValue;
    log.response = response;
    log.duration = duration;
    log.requestTime = new Date();

    const result = await RequestLog.create(log)
    return result;
  }

  // 读取日志缓存值
  async getLogCache(requestType, uniqueValue) {
    const result = await RequestLog.findOne({
      where: {
        requestType,
        uniqueValue
      }
    })
    return result && result.response || null;
  }

  getValue(value, dataType) {
    if (dataType == 'array' && !Array.isArray(value)) {
      return [value];
    }
    return value;
  }

  // 读取参数值
  async resolveValue(valueDef = {}, dataType) {
    const results = this.context.__RESULTS;
    const { type, value } = valueDef;
    let result = value;
    if (type == 'node') {
      const [nodeId, key] = value.split('.');
      const nodeValue = results[nodeId] || {}
      result = nodeValue;
      if (key) {
        result = nodeValue[key];
      }
    }

    return this.getValue(result, dataType);
  }

  resolveConfigValue(config = {}, dataType = 'string') {
    const results = this.context.__RESULTS || {};
    const { type, nodeId, value } = config;
    let result = value;
    if (type === 'node') {
      const nodeValue = results[nodeId] || {}
      result = nodeValue;
      if (value) {
        const resolverUri = value.replace(/\./g, '/');
        // result = nodeValue[value];
        result = jsonuri.get(result, resolverUri) || '';
        console.log('result', result, 'resolverUri', resolverUri)
      }
    }
    if (type === 'request') {
      const body = this.context || {};
      return body[value] || '';
    }

    return this.getValue(result, dataType);
  }
}

module.exports = exports = Executor