const Sequelize = require("sequelize");
const dotenv = require('dotenv')

dotenv.config();

const db = new Sequelize(process.env.DATABASE_URL, {
  logging: false
});

module.exports = db;
