// routes/profile.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateJWT } = require('../middlewares/auth');

// Profilseite anzeigen
router.get('/', authenticateJWT, (req, res) => {
  console.log('[DEBUG] /profile: Profilanfrage für Benutzer', req.user.id);
  
  // Prüfe den Accept-Header, um zu bestimmen, ob es eine API-Anfrage ist
  const isApiRequest = req.headers.accept && req.headers.accept.includes('application/json');
  
  if (isApiRequest) {
    // Für API-Anfragen JSON zurückgeben
    return res.json(req.user);
  }
  
  // Für Browser-Anfragen HTML mit EJS rendern
  // Sensitive Daten wie das Passwort entfernen
  const userForTemplate = { ...req.user };
  delete userForTemplate.password;
  delete userForTemplate.password_hash;
  
  res.render('profile', { 
    title: 'Mein Profil',
    user: userForTemplate
  });
});

// Profil-Bearbeitungsansicht
router.get('/edit', authenticateJWT, (req, res) => {
  console.log('[DEBUG] /profile/edit: Profilbearbeitung für Benutzer', req.user.id);
  
  const userForEdit = { ...req.user };
  delete userForEdit.password;
  delete userForEdit.password_hash;
  
  res.render('profile-edit', { 
    title: 'Profil bearbeiten',
    user: userForEdit
  });
});

// Profil aktualisieren
router.put('/', authenticateJWT, async (req, res) => {
  console.log('[DEBUG] /profile PUT: Profilaktualisierung für Benutzer', req.user.id);
  
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
