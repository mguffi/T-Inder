// routes/filters.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateJWT } = require('../middlewares/auth');

// Filter-Einstellungen anzeigen
router.get('/', authenticateJWT, async (req, res) => {
  try {
    // Benutzerfilter abrufen
    const [filters] = await pool.query('SELECT * FROM user_filters WHERE user_id = ?', [req.user.id]);
    
    const userFilters = filters.length > 0 ? filters[0] : {
      min_age: 18,
      max_age: 99,
      gender_preference: 'all'
    };
    
    res.render('filters', { 
      title: 'Filter',
      filters: userFilters
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Serverfehler' });
  }
});

// Filter-Einstellungen aktualisieren
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { min_age, max_age, gender_preference } = req.body;
    
    // Überprüfen, ob bereits Filter existieren
    const [existingFilters] = await pool.query('SELECT * FROM user_filters WHERE user_id = ?', [req.user.id]);
    
    if (existingFilters.length > 0) {
      // Filter aktualisieren
      await pool.query(
        'UPDATE user_filters SET min_age = ?, max_age = ?, gender_preference = ? WHERE user_id = ?',
        [min_age, max_age, gender_preference, req.user.id]
      );
    } else {
      // Filter erstellen
      await pool.query(
        'INSERT INTO user_filters (user_id, min_age, max_age, gender_preference) VALUES (?, ?, ?, ?)',
        [req.user.id, min_age, max_age, gender_preference]
      );
    }
    
    res.json({ message: 'Filter erfolgreich aktualisiert' });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Serverfehler' });
  }
});

module.exports = router;
