# T-Inder
um zu starten
initialisiere 


sudo apt update
cd myapp
npm install express-session
npm install socket.io
npm install moment
sudo apt install -y mysql-server
sudo service mysql start
sudo mysql

CREATE USER 'myuser'@'localhost' IDENTIFIED BY 'meinPasswort';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, INDEX ON *.* TO 'myuser'@'localhost';
ALTER USER 'myuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'meinPasswort';
FLUSH PRIVILEGES;
EXIT;
sudo usermod -a -G mysql $USER
sudo chmod o+rx /var/run/mysqld/

node db/db_user.js

user myuser passwort meinPasswort

T-Inder: Dating App Dokumentation


Inhaltsverzeichnis

API-Endpunkte
Verzeichnisstruktur
Umsetzung und Architektur
ERM-Modell
Test-Dokumentation
Benutzerdokumentation

API-Endpunkte

Authentifizierung
Endpunkt	HTTP-Methode	Funktion	Erwartete Daten	Rückgabe
/login	GET	Login-Seite anzeigen	-	Login-Formular
/login	POST	Benutzeranmeldung	{ email, password }	{ success, token, user }
/register	GET	Registrierungsseite anzeigen	-	Registrierungsformular
/register	POST	Benutzer registrieren	{ name, gender, birthday, password }	{ success, token, user }
/logout	GET	Benutzer ausloggen	-	Logout-Seite
Profil
Endpunkt	HTTP-Methode	Funktion	Erwartete Daten	Rückgabe
/profile	GET	Profil anzeigen	-	Profilinformationen
/profile	PUT	Profil aktualisieren	{ name, gender, birthday, image_url }	{ success, message }
/profile	DELETE	Profil löschen	-	{ success, message }
/profile/edit	GET	Bearbeitungsseite anzeigen	-	Bearbeitungsformular
People (Matching)
Endpunkt	HTTP-Methode	Funktion	Erwartete Daten	Rückgabe
/people	GET	Zufälliges Profil anzeigen	-	Profilinformationen
/people/like/:id	POST	Profil liken	-	{ success, match, message }
/people/dislike/:id	POST	Profil disliken	-	{ success }
Matches
Endpunkt	HTTP-Methode	Funktion	Erwartete Daten	Rückgabe
/matches	GET	Liste der Matches anzeigen	-	Liste der gematchten Profile
Filter
Endpunkt	HTTP-Methode	Funktion	Erwartete Daten	Rückgabe
/filters	GET	Filter-Einstellungen anzeigen	-	Filter-Einstellungen
/filters	POST	Filter aktualisieren	{ min_age, max_age, gender_preference }	{ message }
Chat
Endpunkt	HTTP-Methode	Funktion	Erwartete Daten	Rückgabe
/chat/:userId	GET	Chat-Verlauf abrufen	-	{ messages, chatPartner }
/chat/:userId	POST	Nachricht senden	{ content }	{ id, sender_id, recipient_id, content, created_at, isMine }
WebSocket-Ereignisse
Ereignis	Richtung	Funktion	Daten
connect	Client → Server	Socket-Verbindung herstellen	-
authenticate	Client → Server	Socket-Verbindung authentifizieren	JWT-Token
send_message	Client → Server	Nachricht senden	{ recipientId, content }
message	Server → Client	Nachricht empfangen	{ id, senderId, recipientId, content, timestamp, isMine }
error	Server → Client	Fehler empfangen	{ message }


Verzeichnisstruktur

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






Umsetzung und Architektur
Technologie-Stack

Frontend:

HTML/EJS (Embedded JavaScript Templates)
CSS mit Bootstrap 5
JavaScript (Client-seitig)
Font Awesome für Icons

Backend:

Node.js
Express.js als Web-Framework
MySQL als Datenbank
Passport.js für Authentifizierung
JSON Web Tokens (JWT) für die Authentifizierung
Socket.io für Echtzeit-Chat-Funktionalität

Architektur
Die Anwendung folgt einer klassischen MVC-ähnlichen Architektur:

Models: Datenbankmodelle werden durch SQL-Abfragen direkt in den Routern implementiert
Views: EJS-Templates in der /views-Ordnerstruktur
Controllers: Express.js-Router in der /routes-Ordnerstruktur

Authentifizierung

JWT-basierte Authentifizierung (stateless)
Token-Speicherung im localStorage des Browsers
Authentifizierte API-Endpunkte durch authenticateJWT-Middleware geschützt
Automatische Token-Hinzufügung zu Anfragen durch fetch_auth.js

Datenspeicherung

MySQL-Datenbank mit folgenden Haupttabellen:
user: Benutzerdaten
matches: Benutzer-Likes
dislikes: Benutzer-Dislikes
user_filters: Benutzerfilter
messages: Chat-Nachrichten

Implementierte Features

Benutzerregistrierung und -anmeldung:

Registrierung mit Namen, Geschlecht, Geburtsdatum und Passwort
Sichere Passwort-Speicherung mit bcrypt
JWT-basierte Authentifizierung

Profilmanagement:

Anzeigen und Bearbeiten des eigenen Profils
Profilbild-URL-Änderung
Kontolöschung

Matching-System:

Zufällige Profile anzeigen, basierend auf Benutzerfiltern
Like/Dislike-Funktionalität
Match-Erkennung (gegenseitiges Liken)
Automatisches Zurücksetzen von Dislikes nach bestimmter Anzahl von Interaktionen

Filter-Einstellungen:

Altersbereich anpassen
Geschlechterpräferenzen einstellen

Matches-Anzeige:

Liste aller Matches anzeigen
Profil-Details der Matches einsehen

Echtzeit-Chat:

Chat-Funktionalität mit Socket.io
Nachrichtenverlauf für jede Match-Kombination
Ungelesene Nachrichten markieren
Echtzeit-Benachrichtigungen durch WebSockets
Entwicklungsprozess

Grundlegende Anwendungsstruktur:

Express.js-Anwendung initialisiert
Routing- und View-Struktur erstellt
Datenbankanbindung eingerichtet

Authentifizierung:

JWT-Authentifizierungssystem implementiert
Passport.js für API-Routen-Schutz integriert

Benutzerprofil:

Benutzerregistrierung und -anmeldung
Profilansicht und -bearbeitung

Matching-System:

Datenbankschema für Matches und Dislikes
Like/Dislike-Logik
Match-Erkennung

Filter:

Benutzerfilter für Alter und Geschlecht
Datenbankschema für Filter

Chat-System:

Socket.io für Echtzeit-Kommunikation
Chat-Verlauf und Nachrichtenspeicherung
Verbessertes UI für Chat-Funktionalität

Fehlerbehandlung und Debuggen:

Ausführliche Logging-Funktionalität hinzugefügt
Fehlerbehandlung für API-Endpunkte
Client-seitige Fehlerbehandlung

UI-Verbesserungen:

Responsives Design mit Bootstrap
Optimiertes Farbschema
Benutzerfreundliche Interaktionen

ERM-Modell

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





Beziehungen:

USER ↔ MATCHES:

Ein Benutzer kann mehrere andere Benutzer liken (1:n)
Ein Benutzer kann von mehreren anderen Benutzern geliked werden (n:1)
Ein Match entsteht, wenn Benutzer A Benutzer B liked und Benutzer B auch Benutzer A liked

USER ↔ DISLIKES:

Ein Benutzer kann mehrere andere Benutzer disliken (1:n)
Ein Benutzer kann von mehreren anderen Benutzern gedisliked werden (n:1)

USER ↔ USER_FILTERS:

Ein Benutzer hat genau einen Filter-Eintrag (1:1)

USER ↔ USER_INTERACTIONS:

Ein Benutzer hat genau einen Interactions-Eintrag (1:1)
Speichert die Anzahl der Benutzerinteraktionen (Likes/Dislikes)

USER ↔ MESSAGES:

Ein Benutzer kann mehrere Nachrichten senden (1:n)
Ein Benutzer kann mehrere Nachrichten empfangen (1:n)

Test-Dokumentation

Getestete Funktionen

Authentifizierung:

Registrierung mit gültigen Daten
Registrierung mit bereits existierendem Benutzernamen
Login mit gültigen Anmeldedaten
Login mit ungültigen Anmeldedaten
Logout-Funktion
Token-Persistenz über Seitenneuladen
Zugriff auf geschützte Routen mit/ohne gültiges Token

Profilmanagement:

Profilanzeige
Profilbearbeitung (Name, Geschlecht, Geburtsdatum, Profilbild)
Profilbild-Vorschau-Funktion
Profillöschung

Matching-System:

Anzeige zufälliger Profile basierend auf Filtern
Like-Funktion und Match-Erkennung
Dislike-Funktion und temporäre Ausblendung von Profilen
Automtatisches Zurücksetzen von Dislikes nach 10 Interaktionen
Anzeige von "Keine weiteren Profile" wenn alle Profile abgearbeitet sind

Filter:

Korrekte Anwendung von Altersfiltern
Korrekte Anwendung von Geschlechterfiltern
Speicherung der Filtereinstellungen

Matches-Anzeige:

Korrekte Anzeige der gematchten Profile
Navigation zum Chat mit einem Match

Chat-System:

Nachrichten senden und empfangen
Korrektes Laden des Chat-Verlaufs
Echtzeit-Updates bei neuen Nachrichten
Korrekte Anzeige von "Meine" und "Fremde" Nachrichten
Markierung gelesener/ungelesener Nachrichten

Testmethodik

Manuelle Tests:

Systematisches Durchspielen aller Funktionalitäten
Edge Cases und Fehlerszenarien getestet
Cross-Browser-Tests in Firefox und Chrome

Debugging mit Logging:

Umfangreiche Debug-Logs implementiert
Token-Überprüfung und -Validierung
Datenbankabfragen-Logging
Mögliche zukünftige Tests

Automatisierte Tests:

Unit-Tests für Backend-Logik
Integration-Tests für API-Endpunkte
End-to-End-Tests für Benutzerflows

Leistungstests:

Lasttests für Chat-Funktionalität
Datenbank-Performance bei vielen Benutzern

Sicherheitstests:

Penetrationstests
XSS-Tests
CSRF-Tests
Benutzerdokumentation
Erste Schritte
Registrierung
Öffnen Sie die Startseite der Anwendung
Klicken Sie auf "Registrieren"
Füllen Sie das Formular aus mit:
Name
Geschlecht (männlich/weiblich)
Geburtsdatum
Passwort
Klicken Sie auf "Registrieren"
Sie werden automatisch eingeloggt und zur "Entdecken"-Seite weitergeleitet
Anmeldung
Öffnen Sie die Startseite der Anwendung
Klicken Sie auf "Login"
Geben Sie Ihren Namen und Ihr Passwort ein
Klicken Sie auf "Login"
Navigation
Die Hauptnavigation enthält folgende Punkte:

Entdecken: Zeigt potenzielle Matches an
Matches: Zeigt Ihre erfolgreichen Matches an
Filter: Hier können Sie Ihre Sucheinstellungen anpassen
Profil: Zeigt Ihre Profilinformationen an
Logout: Meldet Sie ab
Profil verwalten
Profil anzeigen
Klicken Sie in der Navigation auf "Profil"
Sie sehen Ihre aktuellen Profilinformationen
Profil bearbeiten
Gehen Sie zu Ihrem Profil
Klicken Sie auf "Profil bearbeiten"
Ändern Sie die gewünschten Informationen:
Name
Geschlecht
Geburtsdatum
Profilbild-URL
Klicken Sie auf "Speichern"
Sie werden zum aktualisierten Profil weitergeleitet
Profil löschen
Gehen Sie zu Ihrem Profil
Klicken Sie auf "Account löschen"
Bestätigen Sie die Löschung im angezeigten Dialogfeld
Sie werden zur Startseite weitergeleitet und automatisch abgemeldet
Dating-Funktionen nutzen
Profile entdecken
Klicken Sie in der Navigation auf "Entdecken"
Ihnen wird ein zufälliges Profil angezeigt, das Ihren Filterkriterien entspricht
Sie können:
Nach links wischen oder auf das X-Symbol klicken, um das Profil zu disliken
Nach rechts wischen oder auf das Herzsymbol klicken, um das Profil zu liken
Bei gegenseitigem Like entsteht ein Match
Filter anpassen
Klicken Sie in der Navigation auf "Filter"
Stellen Sie ein:
Minimalalter
Maximalalter
Geschlechterpräferenz (männlich/weiblich/alle)
Klicken Sie auf "Filter speichern"
Die neuen Filter werden auf die "Entdecken"-Funktion angewendet
Matches und Chat
Matches anzeigen
Klicken Sie in der Navigation auf "Matches"
Sie sehen eine Liste aller Benutzer, mit denen Sie ein Match haben
Chatten
Gehen Sie zur Matches-Seite
Klicken Sie bei einem Match auf "Chat starten"
Ein Chat-Fenster öffnet sich mit dem bisherigen Chatverlauf
Geben Sie Ihre Nachricht in das Textfeld ein
Drücken Sie auf die Senden-Taste oder Enter
Die Nachricht wird in Echtzeit gesendet und angezeigt
Logout
Klicken Sie in der Navigation auf "Logout"
Sie werden abgemeldet und zur Login-Seite weitergeleitet
Wichtige Hinweise
Alle Likes und Matches sind permanent, bis Sie Ihr Profil löschen
Dislikes werden nach 10 Interaktionen zurückgesetzt, sodass Sie diese Profile erneut sehen können
Profilbilder werden über URLs eingebunden, daher müssen Sie eine gültige Bild-URL verwenden
Chatnachrichten werden in Echtzeit übermittelt, wenn beide Benutzer online sind