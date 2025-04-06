const pool = require('./config/db');

async function testPool() {
  console.log('Pool-Typ:', typeof pool);
  console.log('Pool hat query?', typeof pool.query === 'function');
  console.log('Pool Methoden:', Object.keys(pool));
  
  try {
    console.log('Versuche eine Testabfrage...');
    const [rows] = await pool.query('SELECT 1+1 AS result');
    console.log('Abfrage erfolgreich:', rows);
  } catch (error) {
    console.error('Fehler bei der Abfrage:', error);
  }
}

testPool().catch(console.error);