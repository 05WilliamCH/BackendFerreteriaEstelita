// const {config} = require('dotenv')
// config()

// module.exports = {
//     db: {
//         user: process.env.USER,
//         password: process.env.PASSWORD,
//         host: process.env.HOST,
//         port: process.env.PORT_DB,
//         database: process.env.DATABASE
//     }
// } //config.js
// const { Pool } = require("pg");
// require("dotenv").config();

// const pool = new Pool({
//   user: process.env.USER,
//   password: process.env.PASSWORD,
//   host: process.env.HOST,
//   port: process.env.PORT_DB,
//   database: process.env.DATABASE,
// });

// module.exports = pool;

const { Pool } = require("pg");
require("dotenv").config();

let pool;

if (process.env.DATABASE_PUBLIC_URL) {
  // 🔹 Entorno de producción (Railway)
  pool = new Pool({
    connectionString: process.env.DATABASE_PUBLIC_URL,
    ssl: { rejectUnauthorized: false }, // Railway requiere SSL
  });
  console.log("✅ Conectando a la base de datos Railway...");
} else {
  // 🔹 Entorno local
  pool = new Pool({
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.PORT_DB,
    database: process.env.DATABASE,
  });
  console.log("✅ Conectando a la base de datos local...");
}

module.exports = pool;
