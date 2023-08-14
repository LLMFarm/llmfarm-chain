const { Sequelize } = require("sequelize");
const config = process.env;

const sequelize = new Sequelize(
  config.MYSQL_DB,
  config.MYSQL_USER,
  config.MYSQL_PWD,
  {
    logging: console.log,
    dialect: "mysql",
    host: config.MYSQL_HOST,
    define: {
      timestamps: false,
      freezeTableName: true,
    },
  }
);

module.exports = exports = sequelize;
