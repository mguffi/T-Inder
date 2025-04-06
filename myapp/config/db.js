// config/db.js
const mysql = require('mysql2/promise');
console.log('[DEBUG] db.js: Importiere mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'myuser',
  password: 'meinPasswort',
  database: 'dating_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log('[DEBUG] db.js: Pool erstellt:', typeof pool, Object.keys(pool));
console.log('[DEBUG] db.js: Pool.query vorhanden?', typeof pool.query === 'function');

module.exports = pool;

