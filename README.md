
# ❤T-Inder: Umfassende Dating-App Dokumentation

## Inhaltsverzeichnis
1. Einführung
2. Installation
3. API-Endpunkte
4. Verzeichnisstruktur
5. Architektur und technische Umsetzung
6. ERM-Modell
7. Test-Dokumentation
8. Benutzerdokumentation
9. Entwicklungsdokumentation
10. Sicherheitsaspekte
11. Leistungsoptimierungen
12. Zukünftige Erweiterungen

## Einführung

T-Inder ist eine moderne Dating-Plattform, die es Benutzern ermöglicht, potenzielle Partner anhand von Profilbildern und grundlegenden Informationen zu entdecken. Die Anwendung ist inspiriert von bekannten Dating-Apps wie Tinder, bietet jedoch einige einzigartige Funktionen wie ein optimiertes Matching-System mit intelligentem Dislike-Management und Echtzeit-Chat.

Die Plattform wurde mit Node.js, Express.js und MySQL entwickelt und verwendet moderne Webtechnologien wie Socket.io für Echtzeit-Kommunikation und JWT (JSON Web Tokens) für sichere Authentifizierung.

## 🚀Installation

### Systemvoraussetzungen

- **Node.js** (v14.0.0 oder höher)
- **npm** (v6.0.0 oder höher)
- **MySQL** (v5.7 oder höher)
- Moderner Webbrowser (Chrome, Firefox, Edge, Safari)
- Terminal/Kommandozeile

### 🏃‍♀️Schritt-für-Schritt-Anleitung

1. **Repository herunterladen und Abhängigkeiten installieren:**
   ```bash
   git clone https://github.com/username/T-Inder.git
   cd T-Inder/myapp
   npm install
   npm install express-session socket.io moment
   ```

2. **MySQL einrichten:**
   ```bash
   sudo apt update
   sudo apt install -y mysql-server
   sudo service mysql start
   ```

3. **Datenbank und Tabellen initialisieren:**
   ```bash
   node db/db_user.js
   ```
   Bei der Abfrage wähle Option 2 (sudo-basierte MySQL-Konfiguration).

4. **Anwendung starten:**
   ```bash
   npm start
   ```

5. **Die Anwendung ist nun verfügbar unter:**  
   http://localhost:3000

### Datenbank-Konfiguration

Das Setup-Skript (`db_user.js`) erstellt automatisch:
- Eine Datenbank `dating_app`
- Einen Datenbankbenutzer `myuser` mit dem Passwort `meinPasswort`
- Alle notwendigen Tabellen zur Speicherung von Benutzerdaten, Matches, Nachrichten usw.
- Beispielbenutzer zum Testen der Anwendung

Die Skripts `init.js`, `chat-init.js` und `dislike_init.js` werden nacheinander ausgeführt, um die vollständige Datenbankstruktur zu erstellen.

### Fehlerbehebung bei der Installation

#### Problem: REFERENCES command denied

**Symptom:** `Error: REFERENCES command denied to user 'myuser'@'localhost' for table 'dating_app.user'`

**Lösung:**
```bash
sudo mysql
GRANT ALL PRIVILEGES ON dating_app.* TO 'myuser'@'localhost';
GRANT REFERENCES ON dating_app.* TO 'myuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Problem: Tabelle 'dating_app.dislikes' existiert nicht

**Symptom:** `Error: Table 'dating_app.dislikes' doesn't exist`

**Lösung:**
```bash
# Stelle sicher, dass die dislike_init.js im db-Verzeichnis existiert
node db/dislike_init.js
```

#### Problem: Verbindung zur MySQL-Datenbank fehlgeschlagen

**Symptom:** `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Lösung:**
```bash
sudo service mysql restart
# Prüfe, ob der MySQL-Server läuft:
sudo systemctl status mysql
```

## API-Endpunkte

### Authentifizierung

| Endpunkt | HTTP-Methode | Funktion | Erwartete Daten | Rückgabe |
|----------|--------------|----------|----------------|----------|
| `/login` | GET | Login-Seite anzeigen | - | Login-Formular |
| `/login` | POST | Benutzeranmeldung | `{ email, password }` | `{ success, token, user }` |
| `/register` | GET | Registrierungsseite anzeigen | - | Registrierungsformular |
| `/register` | POST | Benutzer registrieren | `{ name, gender, birthday, password }` | `{ success, token, user }` |
| `/logout` | GET | Benutzer ausloggen | - | Logout-Seite |
| `/auth/status` | GET | JWT-Token prüfen | - | `{ isAuthenticated, user }` |

### Profilverwaltung

| Endpunkt | HTTP-Methode | Funktion | Erwartete Daten | Rückgabe |
|----------|--------------|----------|----------------|----------|
| `/profile` | GET | Profil anzeigen | - | Profilinformationen |
| `/profile` | PUT | Profil aktualisieren | `{ name, gender, birthday, image_url }` | `{ success, message }` |
| `/profile` | DELETE | Profil löschen | - | `{ success, message }` |
| `/profile/edit` | GET | Bearbeitungsseite anzeigen | - | Bearbeitungsformular |

### Matching-System

| Endpunkt | HTTP-Methode | Funktion | Erwartete Daten | Rückgabe |
|----------|--------------|----------|----------------|----------|
| `/people` | GET | Zufälliges Profil anzeigen | - | Profilinformationen |
| `/people/like/:id` | POST | Profil liken | - | `{ success, match, message }` |
| `/people/dislike/:id` | POST | Profil disliken | - | `{ success }` |

### Matches

| Endpunkt | HTTP-Methode | Funktion | Erwartete Daten | Rückgabe |
|----------|--------------|----------|----------------|----------|
| `/matches` | GET | Liste der Matches anzeigen | - | Liste der gematchten Profile |

### Filter

| Endpunkt | HTTP-Methode | Funktion | Erwartete Daten | Rückgabe |
|----------|--------------|----------|----------------|----------|
| `/filters` | GET | Filter-Einstellungen anzeigen | - | Filter-Einstellungen |
| `/filters` | POST | Filter aktualisieren | `{ min_age, max_age, gender_preference }` | `{ message }` |

### Chat-Funktionen

| Endpunkt | HTTP-Methode | Funktion | Erwartete Daten | Rückgabe |
|----------|--------------|----------|----------------|----------|
| `/chat/:userId` | GET | Chat-Verlauf abrufen | - | `{ messages, chatPartner }` |
| `/chat/:userId` | POST | Nachricht senden | `{ content }` | `{ id, sender_id, recipient_id, content, created_at, isMine }` |

### WebSocket-Ereignisse

| Ereignis | Richtung | Funktion | Daten |
|----------|----------|----------|-------|
| `connect` | Client → Server | Socket-Verbindung herstellen | - |
| `authenticate` | Client → Server | Socket-Verbindung authentifizieren | JWT-Token |
| `send_message` | Client → Server | Nachricht senden | `{ recipientId, content }` |
| `message` | Server → Client | Nachricht empfangen | `{ id, senderId, recipientId, content, timestamp, isMine }` |
| `error` | Server → Client | Fehler empfangen | `{ message }` |

## Verzeichnisstruktur

Die T-Inder-Anwendung ist folgendermaßen strukturiert:

```
myapp/
├── app.js                  # Hauptanwendungsdatei
├── package.json            # Node.js-Abhängigkeiten
├── test-pool.js            # Testdatei für Datenbankverbindung
├── bin/
│   └── www                 # Server-Startpunkt
├── config/
│   ├── db.js               # Datenbankverbindung
│   ├── keys.js             # Anwendungsschlüssel (JWT, Session)
│   └── passport.js         # Passport-Konfiguration
├── db/
│   ├── chat-init.js        # Chat-Datenbanktabellen erstellen
│   ├── db_user.js          # Datenbankbenutzer erstellen
│   ├── dislike_init.js     # Dislike-Datenbanktabellen erstellen
│   └── init.js             # Hauptdatenbank initialisieren
├── middlewares/
│   └── auth.js             # Authentifizierungs-Middleware
├── public/
│   ├── css/
│   │   └── style.css       # Hauptstil-Datei
│   ├── js/
│   │   ├── auth.js         # Authentifizierungs-Skript
│   │   ├── fetch_auth.js   # Authentifizierte Fetch-Anfragen
│   │   ├── login.js        # Login-Funktionalität
│   │   ├── main.js         # Hauptanwendungs-Skript
│   │   ├── matches.js      # Matches-Funktionalität
│   │   ├── people.js       # People-Funktionalität
│   │   ├── profile.js      # Profil-Funktionalität
│   │   └── test-auth.js    # Authentifizierungstests
│   └── stylesheets/
│       └── ...             # Weitere Stilblätter
├── routes/
│   ├── auth.js             # Authentifizierungsrouten
│   ├── chat.js             # Chat-Routen
│   ├── filters.js          # Filter-Routen
│   ├── index.js            # Index-Routen
│   ├── matches.js          # Matches-Routen
│   ├── people.js           # People-Routen
│   ├── profile.js          # Profil-Routen
│   └── users.js            # Benutzerrouten
└── views/
    ├── error.ejs           # Fehlerseite
    ├── filters.ejs         # Filter-Seite
    ├── index.ejs           # Startseite
    ├── layout.ejs          # Layout-Template
    ├── login.ejs           # Login-Seite
    ├── matches.ejs         # Matches-Seite
    ├── people.ejs          # People-Seite
    ├── profile-edit.ejs    # Profilbearbeitung
    ├── profile.ejs         # Profilseite
    └── register.ejs        # Registrierungsseite
```

## Architektur und technische Umsetzung

### Technologie-Stack

#### Frontend
- **HTML/EJS** (Embedded JavaScript Templates)
- **CSS mit Bootstrap 5**
- **JavaScript** (Client-seitig)
- **Font Awesome** für Icons

#### Backend
- **Node.js**
- **Express.js** als Web-Framework
- **MySQL** als Datenbank
- **Passport.js** für Authentifizierung
- **JSON Web Tokens (JWT)** für die Authentifizierung
- **Socket.io** für Echtzeit-Chat-Funktionalität

### Architektur
Die Anwendung folgt einer klassischen MVC-ähnlichen Architektur:

- **Models**: Datenbankmodelle werden durch SQL-Abfragen direkt in den Routern implementiert
- **Views**: EJS-Templates in der /views-Ordnerstruktur
- **Controllers**: Express.js-Router in der /routes-Ordnerstruktur

### Authentifizierungssystem

- JWT-basierte Authentifizierung (stateless)
- Token-Speicherung im localStorage des Browsers
- Authentifizierte API-Endpunkte durch authenticateJWT-Middleware geschützt
- Automatische Token-Hinzufügung zu Anfragen durch fetch_auth.js

### Datenbankmodell

Die Daten werden in einer MySQL-Datenbank gespeichert, die folgende Haupttabellen umfasst:

1. **user**: Speichert Benutzerinformationen (Profile)
2. **matches**: Speichert Benutzer-Likes und -Matches
3. **dislikes**: Speichert temporär abgelehnte Profile
4. **user_filters**: Speichert Benutzereinstellungen für die Profil-Filterung
5. **messages**: Speichert Chat-Nachrichten zwischen Benutzern
6. **user_interactions**: Speichert Interaktionszähler für die Dislike-Zurücksetzung

### Matching-Algorithmus

Der Matching-Algorithmus in der `/people`-Route basiert auf folgenden Prinzipien:

1. **Filterung**: Profile werden basierend auf Benutzereinstellungen (Alter, Geschlecht) gefiltert
2. **Ausschluss**: Bereits gelikte/gedislikte Profile werden ausgeschlossen
3. **Zufälligkeit**: Ein zufälliges Profil wird aus den verbleibenden angezeigt
4. **Dislike-Management**: Nach 10 Interaktionen werden die ältesten 20% der Dislikes automatisch zurückgesetzt
5. **Leere-Ergebnismenge-Behandlung**: Wenn keine passenden Profile mehr gefunden werden, werden alle Dislikes zurückgesetzt

### Chat-System

Das Chat-System basiert auf Socket.io und umfasst:

1. **Chat-Verlauf**: Persistente Speicherung von Nachrichten in der Datenbank
2. **Echtzeit-Kommunikation**: Bidirektionale Nachrichtenübermittlung zwischen Benutzern
3. **Authentifizierung**: Socket-Verbindungen werden durch JWT-Token authentifiziert
4. **Benutzer-Räume**: Jeder Benutzer hat einen eigenen Socket.io-Raum für gezielte Nachrichtenübermittlung
5. **Gelesen-Status**: Nachverfolgung, ob Nachrichten gelesen wurden

## ERM-Modell

```
+----------------+       +-----------------+       +----------------+
|      USER      |       |     MATCHES     |       |     DISLIKES   |
+----------------+       +-----------------+       +----------------+
| id (PK)        |<----->| user_id (FK)    |       | id (PK)        |
| name           |       | liked_user_id (FK)       | user_id (FK)   |
| gender         |       +-----------------+       | disliked_user_id (FK)
| birthday       |                                 | dislike_count   |
| image_url      |                                 | created_at      |
| password_hash  |                                 +----------------+
| password       |                                         ^
+----------------+                                         |
        ^                                                  |
        |                                                  |
        v                                                  |
+------------------+                                       |
| USER_FILTERS     |                                       |
+------------------+                                       |
| user_id (FK,PK)  |<--------------------------------------+
| min_age          |
| max_age          |
| gender_preference|
+------------------+
        ^
        |
        v
+------------------+       +----------------+
| USER_INTERACTIONS|       |    MESSAGES    |
+------------------+       +----------------+
| user_id (FK,PK)  |       | id (PK)        |
| interaction_count|       | sender_id (FK) |
| last_reset_at    |       | recipient_id (FK)
+------------------+       | content        |
                           | is_read        |
                           | created_at     |
                           +----------------+
```

### Beziehungen

1. **USER ↔ MATCHES**:
   - Ein Benutzer kann mehrere andere Benutzer liken (1:n)
   - Ein Benutzer kann von mehreren anderen Benutzern geliked werden (n:1)
   - Ein Match entsteht, wenn Benutzer A Benutzer B liked und Benutzer B auch Benutzer A liked

2. **USER ↔ DISLIKES**:
   - Ein Benutzer kann mehrere andere Benutzer disliken (1:n)
   - Ein Benutzer kann von mehreren anderen Benutzern gedisliked werden (n:1)
   - Dislikes sind temporär und werden nach einer bestimmten Anzahl von Interaktionen zurückgesetzt

3. **USER ↔ USER_FILTERS**:
   - Ein Benutzer hat genau einen Filter-Eintrag (1:1)
   - Filter bestimmen, welche Profile dem Benutzer angezeigt werden

4. **USER ↔ USER_INTERACTIONS**:
   - Ein Benutzer hat genau einen Interactions-Eintrag (1:1)
   - Speichert die Anzahl der Benutzerinteraktionen (Likes/Dislikes)
   - Wird verwendet, um zu bestimmen, wann Dislikes zurückgesetzt werden sollen

5. **USER ↔ MESSAGES**:
   - Ein Benutzer kann mehrere Nachrichten senden (1:n)
   - Ein Benutzer kann mehrere Nachrichten empfangen (1:n)
   - Nachrichten haben einen Lese-Status und einen Zeitstempel

## Test-Dokumentation

### Getestete Funktionen

#### Authentifizierung und Benutzerverwaltung

1. **Registrierung**:
   - Erfolgreiche Registrierung mit vollständigen Daten
   - Validierung von Pflichtfeldern
   - Behandlung von Duplikaten (gleicher Benutzername)
   - Überprüfung der Passwort-Hashing-Funktionalität

2. **Login**:
   - Erfolgreicher Login mit korrekten Anmeldedaten
   - Fehlerbehandlung bei falschen Anmeldedaten
   - Generierung und Übermittlung des JWT-Tokens
   - Token-Speicherung im localStorage

3. **Token-Authentifizierung**:
   - Zugriff auf geschützte Routen mit gültigem Token
   - Verweigerung des Zugriffs auf geschützte Routen ohne Token
   - Verweigerung des Zugriffs mit abgelaufenem Token
   - Token-Persistenz über Seitenneuladen hinweg

4. **Profil-Management**:
   - Abrufen der Profilinformationen
   - Aktualisieren von Profilinformationen
   - Hochladen/Ändern des Profilbilds
   - Löschen des Benutzerkontos

#### Matching-System

1. **Profile Entdecken**:
   - Zufällige Auswahl von Profilen innerhalb der Filterkriterien
   - Korrekte Anwendung von Alters- und Geschlechterfiltern
   - Ausschluss bereits gelikter/gedislikter Profile
   - Automatische Zurücksetzung von Dislikes nach bestimmten Interaktionen

2. **Like/Dislike Funktionalität**:
   - Speicherung von Likes in der Datenbank
   - Speicherung von Dislikes in der Datenbank
   - Match-Erkennung bei gegenseitigem Like
   - Match-Benachrichtigung
   - Aktualisierung des Interaktionszählers

3. **Matches-Anzeige**:
   - Korrekte Anzeige aller Matches
   - Anzeige von Profildetails der Matches
   - Navigation zum Chat mit einem Match

#### Chat-System

1. **Chat-Funktionalität**:
   - Authentifizierte Socket.io-Verbindungen
   - Senden von Nachrichten
   - Empfangen von Nachrichten in Echtzeit
   - Speicherung von Nachrichten in der Datenbank
   - Laden des Chat-Verlaufs
   - Markierung ungelesener Nachrichten

2. **Benutzer-zu-Benutzer-Kommunikation**:
   - Nachrichten werden nur an den richtigen Empfänger gesendet
   - Benutzer können nur mit Matches chatten
   - Chat-Verlauf ist für beide Benutzer identisch

### Testmethodik

Die Tests wurden mit folgenden Methoden durchgeführt:

1. **Manuelle Tests**:
   - Systematisches Durchspielen aller Funktionalitäten
   - End-to-End-Tests der Benutzer-Flows
   - Edge-Case-Tests (leere Eingaben, ungewöhnliche Datenwerte)
   - Fehler-Szenarien (falsche Anmeldedaten, ungültige Tokens usw.)

2. **Cross-Browser-Tests**:
   - Chrome (neueste Version)
   - Firefox (neueste Version)
   - Überprüfung der Responsivität auf verschiedenen Bildschirmgrößen

3. **Debug-Logging**:
   - Ausführliche Debug-Logs in der Authentifizierungs-Middleware
   - Überprüfung der Socket.io-Event-Übertragung
   - Kontrolle der SQL-Abfragen und -Ergebnisse

### Zukünftige Tests

Für zukünftige Versionen sind folgende Tests geplant:

1. **Automatisierte Tests**:
   - Unit-Tests für Backend-Logik
   - Integration-Tests für API-Endpunkte
   - End-to-End-Tests für Benutzerflows

2. **Leistungstests**:
   - Lasttests für Chat-Funktionalität
   - Datenbank-Performance bei vielen Benutzern

3. **Sicherheitstests**:
   - Penetrationstests
   - XSS-Tests
   - CSRF-Tests

## Benutzerdokumentation

### Erste Schritte

#### Registrierung
1. Öffnen Sie die Startseite der T-Inder-App
2. Klicken Sie auf die Schaltfläche "Registrieren"
3. Füllen Sie das Formular mit folgenden Informationen aus:
   - Name (wird anderen Benutzern angezeigt)
   - Geschlecht (männlich/weiblich)
   - Geburtsdatum (Sie müssen mindestens 18 Jahre alt sein)
   - Passwort (mindestens 8 Zeichen)
4. Klicken Sie auf "Registrieren"
5. Nach erfolgreicher Registrierung werden Sie automatisch eingeloggt und zur Profilbearbeitung weitergeleitet

#### Anmeldung
1. Öffnen Sie die Startseite der T-Inder-App
2. Klicken Sie auf "Login"
3. Geben Sie Ihren Namen und Ihr Passwort ein
4. Klicken Sie auf "Login"
5. Nach erfolgreicher Anmeldung gelangen Sie zur "Entdecken"-Seite

### Profilverwaltung

#### Profil anzeigen
1. Klicken Sie in der Navigationsleiste auf "Profil"
2. Sie sehen nun Ihre aktuellen Profilinformationen:
   - Profilbild
   - Name
   - Alter (berechnet aus dem Geburtsdatum)
   - Geschlecht
   - Geburtsdatum

#### Profil bearbeiten
1. Gehen Sie zu Ihrem Profil
2. Klicken Sie auf die Schaltfläche "Profil bearbeiten"
3. Sie können folgende Informationen ändern:
   - Name (wird anderen Benutzern angezeigt)
   - Geschlecht (männlich/weiblich)
   - Geburtsdatum
   - Profilbild-URL (geben Sie die URL zu einem Bild ein, das Sie im Internet finden)
4. Klicken Sie auf "Speichern", um Ihre Änderungen zu übernehmen
5. Die Änderungen werden sofort wirksam und in Ihrem Profil angezeigt

#### Profil löschen
1. Gehen Sie zu Ihrem Profil
2. Scrollen Sie nach unten bis zum Abschnitt "Gefährliche Zone"
3. Klicken Sie auf die Schaltfläche "Account löschen"
4. Bestätigen Sie die Löschung im angezeigten Dialog
5. Nach der Bestätigung wird Ihr Account mit allen Daten unwiderruflich gelöscht
6. Sie werden zur Startseite weitergeleitet und automatisch abgemeldet

### Matching-Funktionen

#### Profile entdecken
1. Klicken Sie in der Navigation auf "Entdecken"
2. Ihnen wird ein zufälliges Profil angezeigt, das Ihren Filterkriterien entspricht
3. Das Profil enthält:
   - Profilbild
   - Name und Alter
   - Geschlecht-Symbol (♂/♀)
4. Sie haben zwei Optionen:
   - **Dislike**: Wischen Sie nach links oder klicken Sie auf das X-Symbol
   - **Like**: Wischen Sie nach rechts oder klicken Sie auf das Herz-Symbol
5. Nach Ihrer Entscheidung wird das nächste Profil angezeigt

#### Was passiert nach einem Like?
- Wenn die andere Person Sie ebenfalls geliked hat, entsteht ein **Match**
- Bei einem Match erscheint eine Benachrichtigung
- Matches erscheinen in Ihrer Match-Liste
- Sie können mit Matches chatten

#### Was passiert nach einem Dislike?
- Das Profil wird Ihnen vorerst nicht mehr angezeigt
- Nach 10 Interaktionen (Likes oder Dislikes) werden automatisch die ältesten 20% Ihrer Dislikes zurückgesetzt
- Diese Profile können Ihnen dann wieder angezeigt werden

### Filter anpassen
1. Klicken Sie in der Navigation auf "Filter"
2. Sie können folgende Einstellungen anpassen:
   - **Altersbereich**: Minimales und maximales Alter der angezeigten Profile (18-99 Jahre)
   - **Geschlechterpräferenz**: Wählen Sie "männlich", "weiblich" oder "alle"
3. Klicken Sie auf "Filter speichern"
4. Die neuen Filtereinstellungen werden sofort angewendet

### Kommunikation mit Matches

#### Matches anzeigen
1. Klicken Sie in der Navigation auf "Matches"
2. Sie sehen eine Liste aller Benutzer, mit denen Sie ein Match haben
3. Für jedes Match werden angezeigt:
   - Profilbild
   - Name
   - Alter
   - Schaltfläche zum Starten eines Chats

#### Chat starten
1. Gehen Sie zur Matches-Seite
2. Klicken Sie bei einem Match auf "Chat starten"
3. Ein Chat-Fenster öffnet sich mit dem bisherigen Chatverlauf
4. Im oberen Bereich sehen Sie Informationen zum Chat-Partner
5. Im mittleren Bereich werden die Nachrichten angezeigt
6. Im unteren Bereich befindet sich das Eingabefeld

#### Nachrichten senden und empfangen
1. Geben Sie Ihre Nachricht in das Textfeld ein
2. Drücken Sie auf die Senden-Taste oder die Enter-Taste
3. Die Nachricht wird sofort gesendet und erscheint im Chat-Verlauf
4. Eingehende Nachrichten erscheinen automatisch im Chat-Fenster, wenn Sie online sind
5. Ungelesene Nachrichten werden besonders hervorgehoben

### Tipps und Tricks

1. **Optimales Profilbild**: Wählen Sie ein Bild, das Ihr Gesicht deutlich zeigt und zu Ihrem Charakter passt
2. **Profilbeschreibung**: Nutzen Sie die Möglichkeit, sich durch einen guten Namen zu präsentieren
3. **Interaktion**: Je mehr Sie mit der App interagieren, desto mehr potenzielle Matches werden Sie entdecken
4. **Gespräche initiieren**: Seien Sie proaktiv und starten Sie Gespräche mit Ihren Matches
5. **Filter anpassen**: Passen Sie Ihre Filter regelmäßig an, um neue potenzielle Matches zu entdecken

### Wichtige Hinweise
- Alle Likes und Matches sind permanent, bis Sie Ihr Profil löschen
- Dislikes werden nach 10 Interaktionen zurückgesetzt, sodass Sie diese Profile erneut sehen können
- Profilbilder werden über URLs eingebunden, daher müssen Sie eine gültige Bild-URL verwenden
- Chatnachrichten werden in Echtzeit übermittelt, wenn beide Benutzer online sind

## Entwicklungsdokumentation

### Entwicklungsprozess

Der Entwicklungsprozess von T-Inder folgte einem agilen, iterativen Ansatz:

1. **Phase 1: Grundlegende Anwendungsstruktur**
   - Express.js-Anwendung erstellt
   - Routing- und View-Struktur entwickelt
   - Datenbankschema entworfen
   - MySQL-Verbindung eingerichtet

2. **Phase 2: Authentifizierung**
   - JWT-basiertes Authentifizierungssystem implementiert
   - Registrierungs- und Login-Funktionen entwickelt
   - Passwort-Hashing mit bcrypt integriert
   - Zugriffsschutz für geschützte Routen eingerichtet

3. **Phase 3: Profilverwaltung**
   - Profilanzeige und -bearbeitung implementiert
   - Profilbild-Funktionalität hinzugefügt
   - Profillöschung mit Kaskadierung implementiert
   - Filter-Einstellungen für Benutzer integriert

4. **Phase 4: Matching-System**
   - Like/Dislike-Funktionalität entwickelt
   - Match-Erkennungssystem programmiert
   - Algorithmus für zufällige Profilauswahl implementiert
   - Dislike-Zurücksetzungsmechanismus entwickelt

5. **Phase 5: Chat-System**
   - Socket.io für Echtzeit-Kommunikation integriert
   - Chat-Datenbankmodell entwickelt
   - Nachrichtenspeicherung und -abruf implementiert
   - Ungelesene Nachrichten-Funktionalität hinzugefügt

6. **Phase 6: UI/UX-Verbesserungen**
   - Responsives Design mit Bootstrap entwickelt
   - Benutzerfreundlichkeit optimiert
   - Visuelle Rückmeldungen implementiert
   - Cross-Browser-Kompatibilität sichergestellt

7. **Phase 7: Testen und Optimieren**
   - Umfangreiche manuelle Tests durchgeführt
   - Debugging und Fehlerbehandlung verbessert
   - Leistungsoptimierungen vorgenommen
   - Dokumentation erstellt

### Erweiterbarkeit

T-Inder wurde mit Erweiterbarkeit im Sinn entwickelt:

1. **Modularer Aufbau**:
   - Klare Trennung von Routen, Views und Middleware
   - Wiederverwendbare Hilfsfunktionen in separaten Modulen

2. **Konfigurierbarkeit**:
   - Zentrale Konfigurationsdateien (keys.js, db.js)
   - Umgebungsvariablen für sensitive Daten

3. **API-Design**:
   - RESTful API-Design für zukünftige Mobile-Apps
   - Socket.io für Echtzeit-Funktionen

## Sicherheitsaspekte

T-Inder implementiert folgende Sicherheitsmaßnahmen:

1. **Authentifizierung und Autorisierung**:
   - JWT-basierte Authentifizierung
   - Sichere Token-Speicherung und -Übertragung
   - Zugriffskontrollen für alle geschützten Ressourcen

2. **Datenschutz**:
   - Sichere Passwort-Speicherung mit bcrypt
   - Keine Speicherung sensibler Daten im Client
   - Minimale Datenerfassung

3. **Datenbankschutz**:
   - Prepared Statements für alle SQL-Abfragen
   - Datenvalidierung vor dem Speichern
   - Eingeschränkte Datenbankbenutzerrechte

## Leistungsoptimierungen

Folgende Optimierungen wurden implementiert:

1. **Datenbankoptimierungen**:
   - Indizes auf häufig abgefragten Spalten
   - Effiziente JOIN-Abfragen
   - Verbindungspooling mit `mysql2`

2. **Front-End-Optimierungen**:
   - Minimierte CSS- und JavaScript-Dateien
   - Lazy-Loading von Bildern
   - Caching von statischen Ressourcen

## Zukünftige Erweiterungen

Für zukünftige Versionen sind folgende Erweiterungen geplant:

1. **Erweiterte Matching-Funktionen**:
   - Interessen-basiertes Matching
   - Standortbasierte Filterung
   - Persönlichkeitstests

2. **Verbesserte Chat-Funktionen**:
   - Bild- und Dateifreigabe
   - Voice- und Video-Chat
   - Gruppenchats

3. **Verbesserte Profilfunktionen**:
   - Mehrere Profilbilder
   - Ausführlichere Benutzerprofile
   - Social Media-Integration

4. **Admin-Panel**:
   - Benutzerverwaltung
   - Inhaltsmoderation
   - Statistiken und Analysen

5. **Mobile Apps**:
   - Native iOS- und Android-Apps
   - Push-Benachrichtigungen
   - Offline-Funktionalität

---

© 2024 T-Inder-Entwicklungsteam. Alle Rechte vorbehalten.
