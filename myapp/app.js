const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const cors = require('cors');
const expressLayouts = require('express-ejs-layouts');

console.log('[DEBUG] app.js: App-Initialisierung gestartet');

// Importieren der Routen
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const peopleRouter = require('./routes/people');
const filtersRouter = require('./routes/filters');
const matchesRouter = require('./routes/matches');

console.log('[DEBUG] app.js: Auth-Router importiert');

const app = express();

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout'); // Set layout.ejs as the default layout

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Session Setup
app.use(session({
  secret: 'dating-app-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Alternative Middleware ohne Passport-Abhängigkeit
const db = require('../config/db');

const SECRET_KEY = 'dating-app-secret-key';

const authenticateJWT = (req, res, next) => {
  console.log('[DEBUG] middlewares/auth.js: authenticateJWT aufgerufen');
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[DEBUG] middlewares/auth.js: Kein gültiger Auth-Header');
    return res.status(401).json({ message: 'Nicht autorisiert' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('[DEBUG] middlewares/auth.js: Token verifiziert, ID:', decoded.id);
    
    db.query('SELECT * FROM user WHERE id = ?', [decoded.id])
      .then(([rows]) => {
        if (rows.length === 0) {
          console.log('[DEBUG] middlewares/auth.js: Benutzer nicht gefunden');
          return res.status(401).json({ message: 'Benutzer nicht gefunden' });
        }
        
        req.user = rows[0];
        next();
      })
      .catch(err => {
        console.error('[DEBUG] middlewares/auth.js: Datenbankfehler:', err);
        return res.status(500).json({ message: 'Datenbankfehler' });
      });
  } catch (err) {
    console.error('[DEBUG] middlewares/auth.js: Token-Validierungsfehler:', err);
    return res.status(401).json({ message: 'Ungültiges Token' });
  }
};

// Passport Middleware
app.use(passport.initialize());
console.log('[DEBUG] app.js: Passport initialisiert');
require('./config/passport')(passport);
console.log('[DEBUG] app.js: Passport-Konfiguration geladen');

// Routen
app.use('/', authRouter);
console.log('[DEBUG] app.js: Auth-Router eingerichtet');
app.use('/profile', profileRouter);
app.use('/people', peopleRouter);
app.use('/filters', filtersRouter);
app.use('/matches', matchesRouter);

// Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

module.exports = app;