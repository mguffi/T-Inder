// middlewares/auth.js
const jwt = require('jsonwebtoken');
const passport = require('passport'); // Direkt passport importieren
const db = require('../config/db');

// Passport konfigurieren
require('../config/passport')(passport);

const authenticateJWT = (req, res, next) => {
  console.log('[DEBUG] middlewares/auth.js: authenticateJWT aufgerufen');
  
  passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    console.log('[DEBUG] middlewares/auth.js: JWT-Authentifizierung durchgeführt');
    
    if (err) {
      console.error('[DEBUG] middlewares/auth.js: Fehler bei der Authentifizierung:', err);
      return next(err);
    }
    
    if (!user) {
      console.log('[DEBUG] middlewares/auth.js: Kein Benutzer gefunden');
      return res.status(401).json({ message: 'Nicht autorisiert' });
    }
    
    console.log('[DEBUG] middlewares/auth.js: Benutzer gefunden, ID:', user.id);
    
    try {
      // Aktualisiere den Benutzer mit den neuesten Daten aus der Datenbank
      console.log('[DEBUG] middlewares/auth.js: Hole aktuelle Benutzerdaten, ID:', user.id);
      const [rows] = await db.query('SELECT * FROM user WHERE id = ?', [user.id]);
      
      if (rows.length === 0) {
        console.log('[DEBUG] middlewares/auth.js: Benutzer nicht in der Datenbank gefunden');
        return res.status(401).json({ message: 'Benutzer nicht gefunden' });
      }
      
      console.log('[DEBUG] middlewares/auth.js: Benutzerdaten aktualisiert');
      req.user = rows[0]; // Aktualisierte Benutzerdaten
      next();
    } catch (dbError) {
      console.error('[DEBUG] middlewares/auth.js: Datenbankfehler:', dbError);
      return res.status(500).json({ message: 'Datenbankfehler' });
    }
  })(req, res, next);
};

module.exports = {
  authenticateJWT
};
