// routes/matches.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateJWT } = require('../middlewares/auth');

// Liste der Matches anzeigen
router.get('/', authenticateJWT, async (req, res) => {
  try {
    // Alle Benutzer finden, die der aktuelle Benutzer geliked hat und die auch den aktuellen Benutzer geliked haben
    const [matches] = await pool.query(`
      SELECT u.id, u.name, u.gender, u.birthday, u.image_url,
      TIMESTAMPDIFF(YEAR, u.birthday, CURDATE()) as age
      FROM user u
      JOIN matches m1 ON u.id = m1.liked_user_id
      JOIN matches m2 ON u.id = m2.user_id AND m2.liked_user_id = ?
      WHERE m1.user_id = ?
    `, [req.user.id, req.user.id]);
    
    res.render('matches', { 
      title: 'Meine Matches',
      matches
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Serverfehler' });
  }
});

module.exports = router;
