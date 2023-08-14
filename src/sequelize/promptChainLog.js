const sequelize = require('./index.js');
const { Model, DataTypes } = require("sequelize");

class PromptChainLog extends Model { }
PromptChainLog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  createTime: {
    type: DataTypes.DATE,
  },
  updateTime: {
    type: DataTypes.DATE,
  },
  uuid: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  traceId: {
    type: DataTypes.STRING(255)
  },
  executionTime: {
    type: DataTypes.INTEGER
  },
  tokenConsumed: {
    type: DataTypes.JSON
  },
  results: {
    type: DataTypes.JSON
  },
  chainId: {
    type: DataTypes.INTEGER
  },
  messageId: {
    type: DataTypes.INTEGER
  }
}, {
  sequelize,
  modelName: 'promptChainLog'
});

// 使用模型创建表
module.exports = exports = PromptChainLog;