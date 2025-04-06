// config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'myuser',
  password: 'meinPasswort',
  database: 'dating_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Keine weiteren Module oder Funktionen hier!
module.exports = pool;

