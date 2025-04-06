const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require('./db');
const { JWT_SECRET } = require('./keys');

module.exports = function(passport) {
  console.log('[DEBUG] passport.js: Konfiguriere Passport');
  
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
  };
  
  console.log('[DEBUG] passport.js: JWT-Optionen:', JSON.stringify(opts));
  
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      console.log('[DEBUG] passport.js: Validiere Token mit Payload:', jwt_payload);
      try {
        const [rows] = await db.query('SELECT * FROM user WHERE id = ?', [jwt_payload.id]);
        console.log('[DEBUG] passport.js: Benutzerabfrage Ergebnis:', rows.length > 0 ? 'Gefunden' : 'Nicht gefunden');
        
        if (rows.length > 0) {
          return done(null, rows[0]);
        } else {
          return done(null, false);
        }
      } catch (err) {
        console.error('[DEBUG] passport.js: Datenbankfehler:', err);
        return done(err, false);
      }
    })
  );
  
  console.log('[DEBUG] passport.js: Passport konfiguriert');
};
