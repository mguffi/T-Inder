// routes/profile.js
const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/auth');
const db = require('../config/db');

// Profil anzeigen - VEREINFACHT für Fehlersuche
router.get('/', async (req, res) => {
  console.log('[DEBUG FIXED] /profile route called, user:', req.user?.id);
  
  try {
    // Direktes Rendern des Templates, keine API-Logik mehr
    res.render('profile', { 
      title: 'Mein Profil',
      user: req.user,
      calculateAge: function(birthday) {
        const birthdayDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthdayDate.getFullYear();
        const m = today.getMonth() - birthdayDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthdayDate.getDate())) {
          age--;
        }
        return age;
      }
    });
  } catch (err) {
    console.error('[DEBUG FIXED] Error rendering profile:', err);
    res.status(500).send('Fehler beim Rendern der Profilseite');
  }
});

// Profil-Bearbeitungsansicht
router.get('/edit', authenticateJWT, (req, res) => {
  console.log('[DEBUG] /profile/edit: Profilbearbeitung für Benutzer', req.user.id);
  
  try {
    // Sicheres Kopieren des Benutzers und Format des Geburtstags sicherstellen
    const userForEdit = { ...req.user };
    delete userForEdit.password;
    delete userForEdit.password_hash;
    
    // Sicherstellen, dass das Geburtsdatum im korrekten Format ist
    if (userForEdit.birthday) {
      // Wenn es ein Datum-Objekt ist, formatieren wir es in YYYY-MM-DD
      if (userForEdit.birthday instanceof Date) {
        userForEdit.birthday = userForEdit.birthday.toISOString().substring(0, 10);
      } 
      // Wenn es ein String ist, stellen wir sicher, dass wir die ersten 10 Zeichen haben
      else if (typeof userForEdit.birthday === 'string') {
        userForEdit.birthday = userForEdit.birthday.substring(0, 10);
      }
    } else {
      // Fallback auf heutiges Datum
      userForEdit.birthday = new Date().toISOString().substring(0, 10);
    }
    
    res.render('profile-edit', { 
      title: 'Profil bearbeiten',
      user: userForEdit
    });
  } catch (err) {
    console.error('[DEBUG] /profile/edit: Fehler beim Rendern der Seite:', err);
    res.status(500).send('Ein Fehler ist aufgetreten.');
  }
});

// Profil aktualisieren
router.put('/', authenticateJWT, async (req, res) => {
  console.log('[DEBUG] /profile PUT: Profilaktualisierung für Benutzer', req.user.id);
  
  try {
    const { name, gender, birthday, image_url } = req.body;
    
    console.log('[DEBUG] /profile PUT: Erhaltene Daten:', { name, gender, birthday, image_url });
    
    // Überprüfen, ob der Name bereits vergeben ist (außer vom aktuellen Benutzer)
    const [existingUsers] = await db.query('SELECT * FROM user WHERE name = ? AND id != ?', [name, req.user.id]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Benutzername bereits vergeben' });
    }
    
    // Profil aktualisieren
    await db.query(
      'UPDATE user SET name = ?, gender = ?, birthday = ?, image_url = ? WHERE id = ?',
      [name, gender, birthday, image_url, req.user.id]
    );
    
    console.log('[DEBUG] /profile PUT: Profil erfolgreich aktualisiert');
    res.json({ success: true, message: 'Profil erfolgreich aktualisiert' });
    
  } catch (err) {
    console.error('[DEBUG] /profile PUT: Fehler:', err);
    res.status(500).json({ success: false, message: 'Serverfehler' });
  }
});

module.exports = router;
