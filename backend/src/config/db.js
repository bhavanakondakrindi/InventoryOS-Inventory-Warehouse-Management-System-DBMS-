const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const poolConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3307', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'inventory_warehouse_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

if (process.env.DB_SOCKET) {
  poolConfig.socketPath = process.env.DB_SOCKET;
}

const pool = mysql.createPool(poolConfig);

pool.getConnection()
  .then(conn => {
    console.log(`[Database] Connected successfully to MySQL DB '${process.env.DB_NAME}' on port ${process.env.DB_PORT}`);
    conn.release();
  })
  .catch(err => {
    console.error('[Database] MySQL Connection Error:', err.message);
  });

module.exports = pool;
