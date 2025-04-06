// routes/profile.js
const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/auth');
const db = require('../config/db');

// Profil anzeigen
router.get('/', authenticateJWT, async (req, res) => {
  console.log('[DEBUG] /profile: Anfrage für Profil, Benutzer-ID:', req.user.id);
  console.log('[DEBUG] /profile: Accept Header:', req.headers.accept);
  
  try {
    const user = req.user;
    console.log('[DEBUG] /profile: Profildaten gefunden:', !!user);
    
    // Klarere Unterscheidung zwischen API und Browser
    const isApiRequest = req.xhr || 
                        (req.headers.accept && 
                         !req.headers.accept.includes('text/html') && 
                         req.headers.accept.includes('*/*') && 
                         req.headers.accept.length < 5);
    
    console.log('[DEBUG] /profile: Ist API-Anfrage?', isApiRequest);
    
    if (isApiRequest) {
      console.log('[DEBUG] /profile: Sende JSON-Antwort');
      return res.json(user);
    }
    
    // Für Browser-Anfragen: HTML rendern
    console.log('[DEBUG] /profile: Sende HTML-Antwort mit Template');
    
    res.render('profile', { 
      title: 'Mein Profil',
      user: user,
      // Füge die calculateAge-Funktion direkt hier ein, falls sie nicht global verfügbar ist
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
    console.error('[DEBUG] /profile: Fehler beim Laden des Profils:', err);
    res.status(500).send('Serverfehler beim Laden des Profils');
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
