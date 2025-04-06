// middlewares/auth.js
const jwt = require('jsonwebtoken');
const passport = require('passport');
const db = require('../config/db');

const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Nicht autorisiert' });
    }
    
    const [rows] = await db.query('SELECT * FROM user WHERE name = ?', [email]);
    
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = {
  authenticateJWT
};
