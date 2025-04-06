// routes/people.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateJWT } = require('../middlewares/auth');

// Zufälliges Profil anzeigen
router.get('/', authenticateJWT, async (req, res) => {
  try {
    // Benutzerfilter abrufen
    const [filters] = await pool.query('SELECT * FROM user_filters WHERE user_id = ?', [req.user.id]);
    
    let filter = filters[0] || { min_age: 18, max_age: 99, gender_preference: 'all' };
    
    // SQL-Bedingung für das Geschlecht
    let genderCondition = '';
    if (filter.gender_preference !== 'all') {
      genderCondition = `AND gender = '${filter.gender_preference}'`;
    }
    
    // SQL für Altersfilter
    const minYear = new Date().getFullYear() - filter.max_age;
    const maxYear = new Date().getFullYear() - filter.min_age;
    
    // Bereits gelikte/dislikte Benutzer ausschließen
    const [likes] = await pool.query(
      'SELECT liked_user_id FROM matches WHERE user_id = ?',
      [req.user.id]
    );
    
    let excludeIds = likes.map(like => like.liked_user_id);
    excludeIds.push(req.user.id); // Eigenes Profil ausschließen
    
    const excludeCondition = excludeIds.length > 0 
      ? `AND id NOT IN (${excludeIds.join(',')})` 
      : '';
    
    // Zufälliges Profil abfragen, das den Filterkriterien entspricht
    const [users] = await pool.query(`
      SELECT id, name, gender, birthday, image_url,
      TIMESTAMPDIFF(YEAR, birthday, CURDATE()) as age
      FROM user
      WHERE YEAR(birthday) >= ${minYear} 
      AND YEAR(birthday) <= ${maxYear}
      ${genderCondition}
      ${excludeCondition}
      ORDER BY RAND()
      LIMIT 1
    `);
    
    if (users.length === 0) {
      return res.render('no-more-profiles', { title: 'Keine weiteren Profile' });
    }
    
    res.render('people', { 
      title: 'Dating',
      profile: users[0]
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Serverfehler' });
  }
});

// Profil liken
router.post('/like/:id', authenticateJWT, async (req, res) => {
  try {
    const likedUserId = req.params.id;
    
    // Like in die Datenbank eintragen
    await pool.query(
      'INSERT INTO matches (user_id, liked_user_id) VALUES (?, ?)',
      [req.user.id, likedUserId]
    );
    
    // Überprüfen, ob ein Match entsteht
    const [matchResult] = await pool.query(
      'SELECT * FROM matches WHERE user_id = ? AND liked_user_id = ?',
      [likedUserId, req.user.id]
    );
    
    const isMatch = matchResult.length > 0;
    
    res.json({ 
      success: true, 
      match: isMatch,
      message: isMatch ? 'Match!' : 'Like gespeichert'
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Serverfehler' });
  }
});

// Profil disliken (einfach zum nächsten Profil gehen)
router.post('/dislike/:id', authenticateJWT, async (req, res) => {
  // Optional: Dislikes könnten in einer separaten Tabelle gespeichert werden
  res.json({ success: true });
});

module.exports = router;
