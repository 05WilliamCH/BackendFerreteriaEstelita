const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.USER,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  port: process.env.PORT_DB,
  database: process.env.DATABASE,
});

module.exports = pool;
