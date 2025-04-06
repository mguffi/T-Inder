const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const cors = require('cors');
const expressLayouts = require('express-ejs-layouts');
const http = require('http');
const socketIo = require('socket.io');

console.log('[DEBUG] app.js: App-Initialisierung gestartet');

// Importieren der Routen
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const peopleRouter = require('./routes/people');
const filtersRouter = require('./routes/filters');
const matchesRouter = require('./routes/matches');

// Zusätzlichen Router importieren
const chatRouter = require('./routes/chat');

// Füge nach den Router-Importen hinzu:
const { authenticateJWT } = require('./middlewares/auth');

console.log('[DEBUG] app.js: Auth-Router importiert');

const app = express();

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout'); // Set layout.ejs as the default layout

// Füge Helper-Funktionen für EJS-Templates hinzu
app.locals.calculateAge = function(birthday) {
  const birthdayDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthdayDate.getFullYear();
  const m = today.getMonth() - birthdayDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthdayDate.getDate())) {
    age--;
  }
  return age;
};

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Session Setup
const { SESSION_SECRET } = require('./config/keys');
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Alternative Middleware ohne Passport-Abhängigkeit
const db = require('./config/db');

// Passport Middleware
app.use(passport.initialize());
console.log('[DEBUG] app.js: Passport initialisiert');
require('./config/passport')(passport);
console.log('[DEBUG] app.js: Passport-Konfiguration geladen');

// Vor dem ersten Router-Einsatz einfügen:

// Debug-Middleware für alle Anfragen
app.use((req, res, next) => {
  console.log('[DEBUG] Neue Anfrage:', req.method, req.url);
  console.log('[DEBUG] Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Routen
// Geschützte Routen mit Middleware
app.use('/profile', authenticateJWT, profileRouter);
app.use('/people', authenticateJWT, peopleRouter);
app.use('/filters', authenticateJWT, filtersRouter);
app.use('/matches', authenticateJWT, matchesRouter);
app.use('/chat', authenticateJWT, chatRouter);

// DANACH erst die allgemeine auth-Route
app.use('/', authRouter);
console.log('[DEBUG] app.js: Auth-Router eingerichtet');

// Debug-Route für Profil
app.get('/profile-test', (req, res) => {
  res.render('profile', { 
    title: 'Test Profil', 
    user: {
      name: 'Test User',
      gender: 'male',
      birthday: '1990-01-01',
      image_url: 'https://xsgames.co/randomusers/assets/avatars/male/1.jpg'
    },
    calculateAge: function(birthday) {
      const birthdayDate = new Date(birthday);
      const today = new Date();
      let age = today.getFullYear() - birthdayDate.getFullYear();
      const m = today.getMonth() - birthdayDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthdayDate.getDate())) {
        age--;
      }
      return age;
    }
  });
});

// Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

// Erstelle HTTP-Server
const server = http.createServer(app);

// Socket.io initialisieren
const io = socketIo(server);

// Socket.io Verbindung verarbeiten
io.on('connection', (socket) => {
  console.log('Neue Socket-Verbindung:', socket.id);
  
  // Benutzer-ID aus Token extrahieren (über Authentication-Middleware)
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
      const userId = decoded.id;
      socket.userId = userId;
      console.log(`Socket ${socket.id} authentifiziert als Benutzer ${userId}`);
      
      // Benutzer in einem eigenen Raum anmelden
      socket.join(`user-${userId}`);
    } catch (error) {
      console.error('Socket-Authentifizierung fehlgeschlagen:', error);
    }
  });
  
  // Nachricht empfangen
  socket.on('send_message', async (data) => {
    try {
      const { recipientId, content } = data;
      const senderId = socket.userId;
      
      if (!senderId) {
        socket.emit('error', { message: 'Nicht authentifiziert' });
        return;
      }
      
      // Nachricht in Datenbank speichern
      const [result] = await db.query(
        'INSERT INTO messages (sender_id, recipient_id, content) VALUES (?, ?, ?)',
        [senderId, recipientId, content]
      );
      
      const messageId = result.insertId;
      const timestamp = new Date().toISOString();
      
      // Nachricht an Sender zurücksenden
      socket.emit('message', { 
        id: messageId,
        senderId,
        recipientId,
        content,
        timestamp,
        isMine: true
      });
      
      // Nachricht an Empfänger senden
      io.to(`user-${recipientId}`).emit('message', {
        id: messageId,
        senderId,
        recipientId,
        content,
        timestamp,
        isMine: false
      });
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
      socket.emit('error', { message: 'Fehler beim Senden der Nachricht' });
    }
  });
});

module.exports = { app, server };