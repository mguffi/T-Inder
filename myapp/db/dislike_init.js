const mysql = require('mysql2/promise');

async function initializeDislikesDatabase() {
  console.log('Starte die Dislikes-Datenbankinitialisierung...');
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'myuser',
    password: 'meinPasswort',
    database: 'dating_app'
  });

  try {
    console.log('Verbindung zur MySQL-Instanz hergestellt.');

    // Dislikes-Tabelle erstellen
    await connection.query(`
      CREATE TABLE IF NOT EXISTS dislikes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        disliked_user_id INT NOT NULL,
        dislike_count INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
        FOREIGN KEY (disliked_user_id) REFERENCES user(id) ON DELETE CASCADE,
        UNIQUE KEY unique_dislike (user_id, disliked_user_id)
      )
    `);
    console.log('Dislikes-Tabelle erstellt oder bereits vorhanden.');

    // User-Interactions-Tabelle erstellen für die Interaktionszählung
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_interactions (
        user_id INT PRIMARY KEY,
        interaction_count INT DEFAULT 0,
        last_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      )
    `);
    console.log('User-Interactions-Tabelle erstellt oder bereits vorhanden.');

  } catch (error) {
    console.error('Fehler bei der Dislikes-Datenbankinitialisierung:', error);
  } finally {
    await connection.end();
    console.log('Datenbankverbindung geschlossen.');
  }
}

// Führe die Initialisierung aus
initializeDislikesDatabase();

module.exports = initializeDislikesDatabase;
