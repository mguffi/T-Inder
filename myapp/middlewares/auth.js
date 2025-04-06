// middlewares/auth.js
const jwt = require('jsonwebtoken');
const passport = require('passport'); // Direkt passport importieren
const db = require('../config/db');
const { JWT_SECRET } = require('../config/keys');

// Passport konfigurieren
require('../config/passport')(passport);

const authenticateJWT = (req, res, next) => {
  console.log('[DEBUG] middlewares/auth.js: authenticateJWT aufgerufen');
  
  // Token aus Header oder Cookie extrahieren
  let token = req.headers.authorization;
  
  // Falls kein Token im Header, versuche es aus dem Cookie
  if (!token && req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
    // Wichtig: Auch für Cookie-Token in den Header setzen, damit Passport es findet
    req.headers.authorization = token;
    console.log('[DEBUG] middlewares/auth.js: Token aus Cookie geladen und in Header gesetzt');
  }
  
  console.log('[DEBUG] middlewares/auth.js: Authorization Header/Cookie:', token);
  
  // Token manuell prüfen als Debug
  if (token && token.startsWith('Bearer ')) {
    const tokenValue = token.substring(7);
    try {
      const decoded = jwt.decode(tokenValue, { complete: true });
      console.log('[DEBUG] middlewares/auth.js: Token-Header:', decoded.header);
      console.log('[DEBUG] middlewares/auth.js: Token-Payload:', decoded.payload);
      
      // Token manuell verifizieren
      jwt.verify(tokenValue, JWT_SECRET, (err, decoded) => {
        if (err) {
          console.error('[DEBUG] middlewares/auth.js: Token Verifizierungsfehler:', err.message);
        } else {
          console.log('[DEBUG] middlewares/auth.js: Token erfolgreich verifiziert');
        }
      });
    } catch (e) {
      console.error('[DEBUG] middlewares/auth.js: Token-Dekodierung fehlgeschlagen:', e);
    }
  }
  
  passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    console.log('[DEBUG] middlewares/auth.js: JWT-Authentifizierung durchgeführt');
    // Info-Objekt zum Debug anzeigen
    console.log('[DEBUG] middlewares/auth.js: Auth-Info:', info);
    
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
