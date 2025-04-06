const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const cors = require('cors');
const expressLayouts = require('express-ejs-layouts');

// Importieren der Routen
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const peopleRouter = require('./routes/people');
const filtersRouter = require('./routes/filters');
const matchesRouter = require('./routes/matches');

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

// Passport Middleware
app.use(passport.initialize());
require('./config/passport')(passport);

// Routen
app.use('/', authRouter);
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