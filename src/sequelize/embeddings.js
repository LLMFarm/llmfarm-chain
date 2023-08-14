const sequelize = require('./index.js');

const { Model, DataTypes } = require("sequelize");

// 定义 Embeddings 模型
class Embeddings extends Model { }
Embeddings.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  document: {
    type: DataTypes.STRING(4000),
    allowNull: false,
  },
  embeddings: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  dimension: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  model: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: 'embeddings'
});

module.exports = Embeddings;
