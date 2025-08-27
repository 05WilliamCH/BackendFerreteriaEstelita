// Conexión a PostgreSQL (Pool)
const { Pool } = require('pg');
require('dotenv').config();


const pool = new Pool({
host: process.env.DB_HOST,
port: process.env.DB_PORT,
user: process.env.DB_USER,
password: process.env.DB_PASS,
database: process.env.DB_NAME,
max: 10,
idleTimeoutMillis: 30000
});


pool.on('error', (err) => {
console.error('Error inesperado en el pool', err);
process.exit(-1);
});


module.exports = { pool };