// db/init.js
const mysql = require('mysql2/promise');

async function initializeDatabase() {
  // Verbindung zur MySQL-Instanz herstellen
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
  });

  try {
    // Datenbank erstellen, falls nicht vorhanden
    await connection.query('CREATE DATABASE IF NOT EXISTS dating_app');
    console.log('Datenbank erstellt oder bereits vorhanden');

    // Datenbank auswählen
    await connection.query('USE dating_app');

    // User-Tabelle erstellen
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        gender VARCHAR(10) NOT NULL,
        birthday DATE NOT NULL,
        image_url TEXT,
        password_hash VARCHAR(255) NOT NULL,
        password VARCHAR(100) NOT NULL
      )
    `);
    console.log('User-Tabelle erstellt oder bereits vorhanden');

    // Matches-Tabelle erstellen
    await connection.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        liked_user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
        FOREIGN KEY (liked_user_id) REFERENCES user(id) ON DELETE CASCADE
      )
    `);
    console.log('Matches-Tabelle erstellt oder bereits vorhanden');

    // Filter-Tabelle erstellen
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_filters (
        user_id INT PRIMARY KEY,
        min_age INT DEFAULT 18,
        max_age INT DEFAULT 99,
        gender_preference VARCHAR(10) DEFAULT 'all',
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      )
    `);
    console.log('Filter-Tabelle erstellt oder bereits vorhanden');

    console.log('Datenbankinitialisierung abgeschlossen');
    
  } catch (error) {
    console.error('Fehler bei der Datenbankinitialisierung:', error);
  } finally {
    await connection.end();
  }
}

// Führe die Initialisierung aus
initializeDatabase();

module.exports = initializeDatabase;
