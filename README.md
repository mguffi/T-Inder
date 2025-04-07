
# T-Inder – Eine einfache Web-Dating-App

## 🚀 Projektstart

```bash
sudo apt update
cd myapp
npm install express-session
npm install socket.io
npm install moment
sudo apt install -y mysql-server
sudo service mysql start

node db/db_user.js
# Bei der Abfrage "2" auswählen
# Erstellt Benutzer mit allen Rechten & initialisiert die Datenbank

# Zugangsdaten:
# Benutzer: myuser
# Passwort: meinPasswort
```

---

## 📚 Inhaltsverzeichnis

- [API-Endpunkte](#api-endpunkte)
- [Verzeichnisstruktur](#verzeichnisstruktur)
- [Umsetzung & Architektur](#umsetzung--architektur)
- [ERM-Modell](#erm-modell)
- [Test-Dokumentation](#test-dokumentation)
- [Benutzerdokumentation](#benutzerdokumentation)

---

## 🌐 API-Endpunkte

### Authentifizierung

| Endpunkt   | Methode | Funktion                |
|------------|---------|-------------------------|
| `/login`   | GET     | Login-Seite anzeigen    |
| `/login`   | POST    | Anmeldung               |
| `/register`| GET     | Registrierungsseite     |
| `/register`| POST    | Registrierung           |
| `/logout`  | GET     | Abmelden                |

### Profil

| Endpunkt     | Methode | Funktion               |
|--------------|---------|------------------------|
| `/profile`   | GET     | Profil anzeigen        |
| `/profile`   | PUT     | Profil aktualisieren   |
| `/profile`   | DELETE  | Profil löschen         |
| `/profile/edit` | GET | Bearbeitungsseite      |

### People (Matching)

| Endpunkt             | Methode | Funktion     |
|----------------------|---------|--------------|
| `/people`            | GET     | Profil anzeigen |
| `/people/like/:id`   | POST    | Liken        |
| `/people/dislike/:id`| POST    | Disliken     |

### Matches

| Endpunkt     | Methode | Funktion             |
|--------------|---------|----------------------|
| `/matches`   | GET     | Matches anzeigen     |

### Filter

| Endpunkt     | Methode | Funktion             |
|--------------|---------|----------------------|
| `/filters`   | GET     | Filter anzeigen      |
| `/filters`   | POST    | Filter aktualisieren |

### Chat

| Endpunkt         | Methode | Funktion              |
|------------------|---------|------------------------|
| `/chat/:userId`  | GET     | Chat-Verlauf abrufen  |
| `/chat/:userId`  | POST    | Nachricht senden      |

### WebSocket-Ereignisse

| Ereignis        | Richtung      | Funktion                  |
|------------------|---------------|----------------------------|
| `connect`        | Client → Server | Verbindung herstellen   |
| `authenticate`   | Client → Server | Authentifizieren         |
| `send_message`   | Client → Server | Nachricht senden         |
| `message`        | Server → Client | Nachricht empfangen      |
| `error`          | Server → Client | Fehler                   |

---

## 📁 Verzeichnisstruktur

```plaintext
myapp/
├── app.js
├── package.json
├── bin/www
├── config/
│   ├── db.js
│   ├── keys.js
│   └── passport.js
├── db/
│   ├── chat-init.js
│   ├── dislike_init.js
│   └── init.js
├── middlewares/
│   └── auth.js
├── public/
│   ├── css/
│   ├── js/
│   └── stylesheets/
├── routes/
│   ├── auth.js
│   ├── chat.js
│   ├── filters.js
│   ├── index.js
│   ├── matches.js
│   ├── people.js
│   ├── profile.js
│   └── users.js
└── views/
    ├── error.ejs
    ├── filters.ejs
    ├── index.ejs
    ├── layout.ejs
    ├── login.ejs
    ├── matches.ejs
    ├── people.ejs
    ├── profile-edit.ejs
    ├── profile.ejs
    └── register.ejs
```

---

(Der komplette Text ist zu lang für eine Zelle – wird im nächsten Schritt fortgesetzt.)
