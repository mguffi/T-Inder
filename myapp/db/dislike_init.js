const mysql = require('mysql2/promise');


async function initializeDatabase() {
  console.log('Starte die Datenbankinitialisierung...');
  const connection = await mysql.createConnection({
    host: '127.0.0.1', // Ändere localhost zu 127.0.0.1
    user: 'myuser',
    password: 'meinPasswort',
    database: 'dating_app'
  });
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

    }

    // Führe die Initialisierung aus
    initializeDatabase();
    
    module.exports = initializeDatabase;
    