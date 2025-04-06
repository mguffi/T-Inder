// config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'myuser',
  password: 'meinPasswort',
  database: 'dating_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;

// config/passport.js
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;


module.exports = function(passport) {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = 'dating-app-secret-key';

  passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const [rows] = await pool.query('SELECT * FROM user WHERE id = ?', [jwt_payload.id]);
      if (rows.length > 0) {
        return done(null, rows[0]);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  }));
};
