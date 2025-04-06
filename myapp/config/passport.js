const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require('./db');
const { JWT_SECRET } = require('./keys');

module.exports = function(passport) {
  console.log('[DEBUG] passport.js: Konfiguriere Passport');
  
  const opts = {
    // Custom extractor that checks both header and cookies
    jwtFromRequest: (req) => {
      let token = null;
      
      // Check Authorization header first
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.substring(7);
      }
      
      // If no token found, check cookies
      if (!token && req.cookies && req.cookies.auth_token) {
        const cookieToken = req.cookies.auth_token;
        if (cookieToken.startsWith('Bearer ')) {
          token = cookieToken.substring(7);
        }
      }
      
      return token;
    },
    secretOrKey: JWT_SECRET
  };
  
  console.log('[DEBUG] passport.js: JWT-Optionen:', JSON.stringify({secretOrKey: opts.secretOrKey}));
  
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
