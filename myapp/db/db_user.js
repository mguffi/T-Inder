const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Funktion zur Auswahl der Setup-Methode
async function selectSetupMethod() {
  return new Promise((resolve) => {
    console.log('\n--- MySQL-Zugriffsmethode wählen ---');
    console.log('1: Root-Benutzer (benötigt Root-Passwort)');
    console.log('2: Sudo-Zugriff (benötigt sudo-Rechte auf dem System)');
    
    rl.question('Wähle eine Option [1/2]: ', (answer) => {
      if (answer === '2') {
        resolve('sudo');
      } else {
        resolve('root');
      }
    });
  });
}

// MySQL Root-Zugangsdaten abfragen
async function getMySQLRootCredentials() {
  return new Promise((resolve) => {
    console.log('\n--- MySQL-Root-Zugangsdaten erforderlich ---');
    console.log('Diese Angaben werden nur für die Installation benötigt und nicht gespeichert.');
    
    rl.question('MySQL Root-Benutzername [root]: ', (rootUser) => {
      rootUser = rootUser || 'root';
      
      rl.question('MySQL Root-Passwort: ', async (rootPassword) => {
        resolve({ rootUser, rootPassword });
      });
    });
  });
}

// Funktion zum Erstellen der Datenbank mit Root-Benutzer
async function setupDatabaseWithRoot(rootUser, rootPassword) {
  console.log('\nVerbinde mit MySQL-Server als Root...');
  
  try {
    // MySQL-Verbindung als Root herstellen
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: rootUser,
      password: rootPassword
    });
    
    console.log('Verbindung hergestellt! Erstelle Datenbank und Benutzer...');
    
    // Datenbank erstellen
    await connection.query('CREATE DATABASE IF NOT EXISTS dating_app');
    
    // Prüfen, ob Benutzer existiert und löschen falls ja
    try {
      await connection.query("DROP USER IF EXISTS 'myuser'@'localhost'");
    } catch (e) {
      console.log('Benutzer existiert nicht oder konnte nicht gelöscht werden, wird neu erstellt...');
    }
    
    // Benutzer erstellen mit korrekten Berechtigungen
    await connection.query("CREATE USER 'myuser'@'localhost' IDENTIFIED BY 'meinPasswort'");
    await connection.query("GRANT ALL PRIVILEGES ON dating_app.* TO 'myuser'@'localhost'");
    await connection.query("GRANT REFERENCES ON dating_app.* TO 'myuser'@'localhost'");
    
    // Native Passwort-Authentifizierung aktivieren
    await connection.query("ALTER USER 'myuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'meinPasswort'");
    await connection.query("FLUSH PRIVILEGES");
    
    console.log('Datenbank und Benutzer erfolgreich erstellt!');
    await connection.end();
    
    return true;
  } catch (error) {
    console.error('Fehler beim Einrichten der Datenbank:', error);
    return false;
  }
}

// Funktion zum Erstellen der Datenbank mit sudo
async function setupDatabaseWithSudo() {
  console.log('\nVerwende sudo, um MySQL-Befehle auszuführen...');
  
  try {
    // SQL-Skript erstellen
    const sqlScript = `
      CREATE DATABASE IF NOT EXISTS dating_app;
      DROP USER IF EXISTS 'myuser'@'localhost';
      CREATE USER 'myuser'@'localhost' IDENTIFIED BY 'meinPasswort';
      GRANT ALL PRIVILEGES ON dating_app.* TO 'myuser'@'localhost';
      GRANT REFERENCES ON dating_app.* TO 'myuser'@'localhost';
      ALTER USER 'myuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'meinPasswort';
      FLUSH PRIVILEGES;
    `;
    
    // Temporäre SQL-Datei erstellen
    fs.writeFileSync('temp_setup.sql', sqlScript);
    
    // Mit sudo ausführen
    console.log('Führe MySQL-Befehle mit sudo aus...');
    execSync('sudo mysql < temp_setup.sql', { stdio: 'inherit' });
    
    // Temporäre Datei löschen
    fs.unlinkSync('temp_setup.sql');
    
    console.log('Datenbank und Benutzer erfolgreich mit sudo erstellt!');
    return true;
  } catch (error) {
    console.error('Fehler beim Einrichten der Datenbank mit sudo:', error);
    return false;
  }
}

// Hauptfunktion
async function main() {
  console.log('===== T-Inder Setup-Skript =====');
  console.log('Dieses Skript richtet die T-Inder-App ein und initialisiert die Datenbank.');
  
  // Setuo-Methode wählen
  const setupMethod = await selectSetupMethod();
  
  // Datenbank und Benutzer einrichten
  let dbSetupSuccess = false;
  
  if (setupMethod === 'root') {
    // MySQL-Zugangsdaten abfragen
    const { rootUser, rootPassword } = await getMySQLRootCredentials();
    dbSetupSuccess = await setupDatabaseWithRoot(rootUser, rootPassword);
  } else {
    dbSetupSuccess = await setupDatabaseWithSudo();
  }
  
  if (!dbSetupSuccess) {
    console.error('Die Datenbankeinrichtung ist fehlgeschlagen.');
    rl.close();
    process.exit(1);
  }
  
  console.log('\nInitialisiere Datenbank-Tabellen...');
  
  // Initialisiere die Datenbanktabellen
  try {
    console.log('1. Erstelle Benutzer- und Matches-Tabellen...');
    await new Promise((resolve, reject) => {
      exec('node db/init.js', (error, stdout, stderr) => {
        console.log(stdout);
        if (error) {
          console.error(stderr);
          reject(error);
        } else {
          resolve();
        }
      });
    });
    
    console.log('2. Erstelle Chat-Tabellen...');
    await new Promise((resolve, reject) => {
      exec('node db/chat-init.js', (error, stdout, stderr) => {
        console.log(stdout);
        if (error) {
          console.error(stderr);
          reject(error);
        } else {
          resolve();
        }
      });
    });
    
    console.log('3. Erstelle Dislike-Tabellen...');
    // Hier direkt ausführen wie bei den anderen Skripten, ohne unnötige Prüfung
    await new Promise((resolve, reject) => {
      exec('node db/dislike_init.js', (error, stdout, stderr) => {
        console.log(stdout);
        if (error) {
          console.error(stderr);
          reject(error);
        } else {
          resolve();
        }
      });
    });
    
    console.log('\n===== Installation erfolgreich abgeschlossen! =====');
    console.log('\nDu kannst dich jetzt mit einem der folgenden Testbenutzer anmelden:');
    console.log('Benutzername: John, Paul, Mary, Jennifer, etc.');
    console.log('Passwort für alle Benutzer: password123');
    console.log('\nStarte die App mit: npm start');
    
  } catch (error) {
    console.error('\nFehler bei der Datenbankinitialisierung:', error);
    console.log('\nMögliche Lösungen:');
    console.log('1. Überprüfe, ob MySQL korrekt installiert ist und läuft');
    console.log('2. Führe manuell folgende Befehle aus:');
    console.log('   sudo mysql');
    console.log('   GRANT REFERENCES ON dating_app.* TO \'myuser\'@\'localhost\';');
    console.log('   FLUSH PRIVILEGES;');
    console.log('   EXIT;');
  }
  
  rl.close();
}

main();