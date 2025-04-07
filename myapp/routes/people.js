// routes/people.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateJWT } = require('../middlewares/auth');

// Konstante für die Anzahl der Interaktionen, bevor Dislikes zurückgesetzt werden
const INTERACTION_THRESHOLD = 10;

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
    
    // Bereits gelikte Benutzer ausschließen
    const [likes] = await pool.query(
      'SELECT liked_user_id FROM matches WHERE user_id = ?',
      [req.user.id]
    );
    
    // Disliked Benutzer ausschließen
    const [dislikes] = await pool.query(
      'SELECT disliked_user_id FROM dislikes WHERE user_id = ?',
      [req.user.id]
    );
    
    let excludeIds = likes.map(like => like.liked_user_id);
    excludeIds = excludeIds.concat(dislikes.map(dislike => dislike.disliked_user_id));
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
    
    // Wenn keine Profile mehr verfügbar sind, Dislikes zurücksetzen und neuen Versuch starten
    if (users.length === 0) {
      // Prüfen, ob es dislikes gibt, die zurückgesetzt werden können
      if (dislikes.length > 0) {
        console.log('Keine passenden Profile mehr - setze Dislikes zurück');
        await pool.query('DELETE FROM dislikes WHERE user_id = ?', [req.user.id]);
        
        // Nach dem Zurücksetzen der Dislikes erneut versuchen
        return router.handle(req, res);
      } else {
        return res.render('no-more-profiles', { title: 'Keine weiteren Profile' });
      }
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
    
    // Interaktionszähler erhöhen
    await incrementInteractionCount(req.user.id);
    
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

// Profil disliken - jetzt mit Speicherung
router.post('/dislike/:id', authenticateJWT, async (req, res) => {
  try {
    const dislikedUserId = req.params.id;
    
    // Dislike in die Datenbank eintragen
    await pool.query(
      'INSERT INTO dislikes (user_id, disliked_user_id) VALUES (?, ?) ' + 
      'ON DUPLICATE KEY UPDATE dislike_count = dislike_count + 1, created_at = CURRENT_TIMESTAMP',
      [req.user.id, dislikedUserId]
    );
    
    // Interaktionszähler erhöhen
    await incrementInteractionCount(req.user.id);
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Serverfehler' });
  }
});

// Hilfsfunktion zum Tracking der Interaktionen und automatischem Zurücksetzen alter Dislikes
async function incrementInteractionCount(userId) {
  try {
    // User-Interaction-Counter-Tabelle existiert noch nicht, also erstellen wir sie on-the-fly
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_interactions (
        user_id INT PRIMARY KEY,
        interaction_count INT DEFAULT 0,
        last_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      )
    `);
    
    // Interaktionszähler erhöhen
    await pool.query(`
      INSERT INTO user_interactions (user_id, interaction_count) 
      VALUES (?, 1) 
      ON DUPLICATE KEY UPDATE 
        interaction_count = interaction_count + 1
    `, [userId]);
    
    // Zähler auslesen
    const [result] = await pool.query(
      'SELECT interaction_count FROM user_interactions WHERE user_id = ?',
      [userId]
    );
    
    // Wenn Schwellenwert erreicht ist, alte Dislikes zurücksetzen
    if (result.length > 0 && result[0].interaction_count >= INTERACTION_THRESHOLD) {
      console.log(`Benutzer ${userId} hat ${INTERACTION_THRESHOLD} Interaktionen erreicht - setze alte Dislikes zurück`);
      
      // Die ältesten Dislikes löschen (ca. 20% der vorhandenen Dislikes)
      const [dislikes] = await pool.query(
        'SELECT COUNT(*) as count FROM dislikes WHERE user_id = ?',
        [userId]
      );
      
      if (dislikes.length > 0 && dislikes[0].count > 0) {
        const dislikeCount = dislikes[0].count;
        const resetCount = Math.max(1, Math.floor(dislikeCount * 0.2)); // Mindestens 1, maximal 20%
        
        // Die ältesten Einträge löschen (nach created_at sortiert)
        await pool.query(`
          DELETE FROM dislikes 
          WHERE user_id = ? 
          ORDER BY created_at ASC
          LIMIT ?
        `, [userId, resetCount]);
      }
      
      // Interaktionszähler zurücksetzen
      await pool.query(`
        UPDATE user_interactions 
        SET interaction_count = 0, last_reset_at = CURRENT_TIMESTAMP 
        WHERE user_id = ?
      `, [userId]);
    }
    
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Interaktionszählers:', err);
  }
}

module.exports = router;
