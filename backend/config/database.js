require("dotenv").config();
const logger = require('./logger');
const { Sequelize } = require('sequelize');


logger.info(`🔍 DB ENV CONFIG: ${JSON.stringify({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
  dialect: process.env.DB_DIALECT
})}`);


const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false//(query) => logger.log('db', query), 
  }
);

module.exports = sequelize;