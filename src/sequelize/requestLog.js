const sequelize = require('./index.js');
const { Model, DataTypes } = require("sequelize");

class RequestLog extends Model { }

RequestLog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  requestType: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  uniqueValue: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  response: {
    type: DataTypes.JSON
  },
  requestTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.FLOAT
  }
}, {
  sequelize,
  modelName: 'requestLog'
});

module.exports = exports = RequestLog;