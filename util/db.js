const Sequelize = require("sequelize");

const sequelize = new Sequelize("use", "root", "pass123", {
  dialect: "mysql",
  host: "localhost",
  logging: true, // Enable logging
});

module.exports = sequelize;
