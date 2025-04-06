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
    const [existingUsers] = await db.query('SELECT * FROM user WHERE name = ? AND id != ?', [name, req.user.id]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Benutzername bereits vergeben' });
    }
    
    // Profil aktualisieren
    await db.query(
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
