
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


## Umsetzung und Architektur

### Technologie-Stack

**Frontend**
- HTML/EJS (Embedded JavaScript Templates)
- CSS mit Bootstrap 5
- JavaScript (Client-seitig)
- Font Awesome für Icons

**Backend**
- Node.js
- Express.js
- MySQL
- Passport.js für Authentifizierung
- JSON Web Tokens (JWT)
- Socket.io für Echtzeit-Chat

### Architektur
- **Models:** SQL-Abfragen direkt in den Routern
- **Views:** EJS-Templates im `/views`-Ordner
- **Controllers:** Express.js-Router im `/routes`-Ordner

## ERM-Modell

```
+----------------+       +-----------------+       +----------------+
|      USER      |       |     MATCHES     |       |     DISLIKES   |
+----------------+       +-----------------+       +----------------+
| id (PK)        |<----->| user_id (FK)    |       | id (PK)        |
| name           |       | liked_user_id   |       | user_id (FK)   |
| gender         |       +-----------------+       | disliked_user_id |
| birthday       |                                 | dislike_count   |
| image_url      |                                 | created_at      |
| password_hash  |                                 +----------------+
+----------------+

        ^
        |
        v

+------------------+        +----------------+
| USER_FILTERS     |        |    MESSAGES    |
+------------------+        +----------------+
| user_id (FK,PK)  |        | id (PK)        |
| min_age          |        | sender_id (FK) |
| max_age          |        | recipient_id   |
| gender_preference|        | content        |
+------------------+        | is_read        |
                            | created_at     |
                            +----------------+
```

## Test-Dokumentation

### Getestete Funktionen
- Registrierung & Login (inkl. Fehlerfälle)
- JWT-Token-Verwaltung
- Profilerstellung & Bearbeitung
- Like/Dislike, Matches
- Filterlogik
- Echtzeit-Chat mit Socket.io

### Testmethodik
- Manuelle Tests aller Funktionen
- Edge Cases und Fehlerszenarien
- Debugging mit Logging
- Cross-Browser-Tests

## Benutzerdokumentation

### Erste Schritte

**Registrierung**
1. Öffne Startseite
2. Registrieren mit Name, Geschlecht, Geburtstag, Passwort

**Login**
1. Login-Seite öffnen
2. Mit Anmeldedaten einloggen

**Navigation**
- Entdecken
- Matches
- Filter
- Profil
- Logout

### Profil verwalten

- Profil anzeigen, bearbeiten, löschen

### Dating-Funktionen

- Zufällige Profile liken/disliken
- Filter nach Alter und Geschlecht
- Matches einsehen und chatten

### Echtzeit-Chat

- Mit Matches chatten
- Nachrichten werden live angezeigt
- Gelesen/Ungelesen-Status

### Logout

- Abmelden über Menüpunkt "Logout"

### Hinweise

- Dislikes werden nach 10 Interaktionen zurückgesetzt
- Profilbilder über gültige Bild-URLs
- Chats nur aktiv bei Online-Status

