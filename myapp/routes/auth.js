// routes/auth.js
const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Import the pool once

console.log('[DEBUG] auth.js: Pool importiert:', typeof pool);
console.log('[DEBUG] auth.js: Pool hat query?', typeof pool.query === 'function');
console.log('[DEBUG] auth.js: Pool Methoden:', Object.keys(pool));

const router = express.Router();

// Login-Seite rendern
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Registrierungsseite rendern
router.get('/register', (req, res) => {
  res.render('register', { title: 'Registrierung' });
});

// Login-Verarbeitung
router.post('/login', async (req, res) => {
  try {
    console.log('[DEBUG] /login: Anfrage erhalten:', req.body);
    const { email, password } = req.body;
    console.log('[DEBUG] /login: E-Mail:', email, 'Passwort vorhanden:', !!password);
    
    console.log('[DEBUG] /login: Pool-Typ:', typeof pool);
    console.log('[DEBUG] /login: Pool Methoden:', Object.keys(pool));
    console.log('[DEBUG] /login: Pool.query vorhanden?', typeof pool.query === 'function');
    
    // Benutzer in der Datenbank suchen
    console.log('[DEBUG] /login: Versuche Datenbankabfrage mit name =', email);
    const [rows] = await pool.query('SELECT * FROM user WHERE name = ?', [email]);
    console.log('[DEBUG] /login: Datenbankabfrage erfolgreich, gefundene Einträge:', rows.length);
    
    if (rows.length === 0) {
      console.log('[DEBUG] /login: Kein Benutzer gefunden');
      return res.status(401).json({ message: 'E-Mail oder Passwort falsch' });
    }
    
    const user = rows[0];
    console.log('[DEBUG] /login: Benutzer gefunden:', user.id, user.name);
    
    // Passwort überprüfen
    console.log('[DEBUG] /login: Überprüfe Passwort. Hash vorhanden:', !!user.password_hash);
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('[DEBUG] /login: Passwortvergleich Ergebnis:', isMatch);
    
    if (!isMatch) {
      console.log('[DEBUG] /login: Passwort stimmt nicht überein');
      return res.status(401).json({ message: 'E-Mail oder Passwort falsch' });
    }
    
    // JWT Token erstellen
    console.log('[DEBUG] /login: Erstelle JWT Token');
    const token = jwt.sign({ id: user.id }, 'dating-app-secret-key', { expiresIn: '1d' });
    
    console.log('[DEBUG] /login: Login erfolgreich, sende Antwort');
    res.json({
      success: true,
      token: `Bearer ${token}`,
      user: {
        id: user.id,
        name: user.name,
        gender: user.gender
      }
    });
    
  } catch (err) {
    console.error('[DEBUG] /login: Fehler:', err);
    res.status(500).json({ message: 'Serverfehler' });
  }
});

// Registrierungsverarbeitung
router.post('/register', async (req, res) => {
  try {
    const { name, gender, birthday, password } = req.body;
    
    // Prüfen, ob Benutzer bereits existiert
    const [existingUsers] = await pool.query('SELECT * FROM user WHERE name = ?', [name]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Benutzername bereits vergeben' });
    }
    
    // Passwort hashen
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Standardprofilbild basierend auf Geschlecht
    const imageUrl = gender === 'male' 
      ? 'https://xsgames.co/randomusers/assets/avatars/male/1.jpg'
      : 'https://xsgames.co/randomusers/assets/avatars/female/1.jpg';
      
    // Benutzer in Datenbank einfügen
    const [result] = await pool.query(
      'INSERT INTO user (name, gender, birthday, image_url, password_hash, password) VALUES (?, ?, ?, ?, ?, ?)',
      [name, gender, birthday, imageUrl, passwordHash, password]
    );
    
    // Standardfilter für den neuen Benutzer erstellen
    await pool.query(
      'INSERT INTO user_filters (user_id, min_age, max_age, gender_preference) VALUES (?, ?, ?, ?)',
      [result.insertId, 18, 99, 'all']
    );
    
    // JWT Token erstellen
    const token = jwt.sign({ id: result.insertId }, 'dating-app-secret-key', { expiresIn: '1d' });
    
    res.status(201).json({
      success: true,
      token: `Bearer ${token}`,
      user: {
        id: result.insertId,
        name,
        gender
      }
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Serverfehler' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  // Da wir JWT verwenden, müssen wir auf Client-Seite das Token löschen
  res.render('logout', { title: 'Logout' });
});

// Example route
router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM user WHERE id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/', (req, res) => {
  res.render('index', { title: 'T-Inder - Deine Dating-Plattform' });
});

module.exports = router;
