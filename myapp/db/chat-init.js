const mysql = require('mysql2/promise');

async function initializeChatDatabase() {
  console.log('Starte die Chat-Datenbankinitialisierung...');
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'myuser',
    password: 'meinPasswort',
    database: 'dating_app'
  });

  try {
    console.log('Verbindung zur MySQL-Instanz hergestellt.');

    // Chat-Nachrichten-Tabelle erstellen
    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sender_id INT NOT NULL,
        recipient_id INT NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES user(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES user(id) ON DELETE CASCADE
      )
    `);
    console.log('Messages-Tabelle erstellt oder bereits vorhanden.');

    // Testdaten einfügen
    await connection.query(`
      INSERT INTO messages (sender_id, recipient_id, content, is_read)
      VALUES
        (1, 2, 'Hallo, wie geht es dir?', true),
        (2, 1, 'Mir geht es gut! Und dir?', true),
        (1, 2, 'Auch gut! Was machst du so?', false)
    `);
    console.log('Testnachrichten eingefügt.');

  } catch (error) {
    console.error('Fehler bei der Chat-Datenbankinitialisierung:', error);
  } finally {
    await connection.end();
    console.log('Datenbankverbindung geschlossen.');
  }
}

// Führe die Initialisierung aus
initializeChatDatabase();