const sequelize = require('./index.js');
const { Model, DataTypes } = require("sequelize");
require('dotenv').config();

const CHAIN_TABLE = process.env.CHAIN_TABLE;
console.log("CHAIN_TABLE", CHAIN_TABLE);

// 定义 ENUM 类型
const FlowTypeEnum = {
  TEMPLATE: 'template',
  INSTANCE: 'instance'
};

class PromptChain extends Model { }

const fields = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  createTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updateTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  deleteTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },

  nodes: {
    type: DataTypes.JSON,
    allowNull: true
  },
  edges: {
    type: DataTypes.JSON,
    allowNull: true
  },
};

if (CHAIN_TABLE === 'chain') {
  fields['chainName'] = {
    type: DataTypes.STRING(30),
    allowNull: false
  }
} else {
  fields['name'] = {
    type: DataTypes.STRING(30),
    allowNull: false
  }
}

PromptChain.init(fields, {
  sequelize,
  modelName: CHAIN_TABLE
});

module.exports = PromptChain;