const sequelize = require('./index.js');
const { Model, DataTypes } = require("sequelize");
require('dotenv').config();

class Memory extends Model { }

const fields = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chatId: {
    type: DataTypes.CHAR(50),
    allowNull: false
  },
  chainId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  value: {
    type: DataTypes.JSON,
    allowNull: true
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
};

Memory.init(fields, {
  sequelize,
  modelName: 'memory'
});

module.exports = Memory;