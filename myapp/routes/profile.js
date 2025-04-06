// routes/profile.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateJWT } = require('../middlewares/auth');

// Profilseite anzeigen
router.get('/', authenticateJWT, async (req, res) => {
  try {
    // Benutzerdaten abrufen
    const [user] = await pool.query('SELECT id, name, gender, birthday, image_url FROM user WHERE id = ?', [req.user.id]);
    
    if (user.length === 0) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
    
    // Benutzerfilter abrufen
    const [filters] = await pool.query('SELECT * FROM user_filters WHERE user_id = ?', [req.user.id]);
    
    // Alter des Benutzers berechnen
    const birthday = new Date(user[0].birthday);
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    
    res.render('profile', { 
      title: 'Mein Profil',
      user: {
        ...user[0],
        age
      },
      filters: filters[0] || { min_age: 18, max_age: 99, gender_preference: 'all' }
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Serverfehler' });
  }
});

// Profil aktualisieren
router.put('/', authenticateJWT, async (req, res) => {
  try {
    const { name, gender, birthday } = req.body;
    
    // Überprüfen, ob der Name bereits vergeben ist (außer vom aktuellen Benutzer)
    const [existingUsers] = await pool.query('SELECT * FROM user WHERE name = ? AND id != ?', [name, req.user.id]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Benutzername bereits vergeben' });
    }
    
    // Profil aktualisieren
    await pool.query(
      'UPDATE user SET name = ?, gender = ?, birthday = ? WHERE id = ?',
      [name, gender, birthday, req.user.id]
    );
    
    res.json({ message: 'Profil erfolgreich aktualisiert' });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Serverfehler' });
  }
});

module.exports = router;
