# T-Inder Dating App

A Node.js-based dating application with matching functionality, real-time chat, and user profile management.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Database Model](#database-model)
- [API Endpoints](#api-endpoints)
- [Technology Stack](#technology-stack)
- [Testing](#testing)
- [User Guide](#user-guide)

## Installation

```bash
# Update packages
sudo apt update

# Navigate to project directory
cd myapp

# Install required Node.js packages
npm install express-session
npm install socket.io
npm install moment

# Install and start MySQL
sudo apt install -y mysql-server
sudo service mysql start

# Initialize database
node db/db_user.js
# Choose option 2 when prompted
# This will create a user with all necessary privileges and run other initialization files

# Start the application
npm start
```

### Database Credentials
- User: myuser
- Password: meinPasswort

## Features

- **User Authentication**: Registration, login, and JWT-based session management
- **Profile Management**: Edit personal information and profile picture
- **Matching System**: Like/dislike other users based on preferences
- **Filtering**: Set age range and gender preferences for potential matches
- **Real-time Chat**: Communicate with matches via WebSocket-based chat
- **Match Management**: View and interact with your matches

## Project Structure

```
myapp/
├── app.js                  # Main application file
├── package.json            # Node.js dependencies
├── test-pool.js            # Database connection test
├── bin/
│   └── www                 # Server entry point
├── config/
│   ├── db.js               # Database connection
│   ├── keys.js             # Application keys (JWT, Session)
│   └── passport.js         # Passport configuration
├── db/
│   ├── chat-init.js        # Chat database tables setup
│   ├── dislike_init.js     # Dislike database tables setup
│   └── init.js             # Main database initialization
├── middlewares/
│   └── auth.js             # Authentication middleware
├── public/
│   ├── css/
│   │   └── style.css       # Main style file
│   ├── js/
│   │   ├── auth.js         # Authentication script
│   │   ├── fetch_auth.js   # Authenticated fetch requests
│   │   ├── login.js        # Login functionality
│   │   ├── main.js         # Main application script
│   │   ├── matches.js      # Matches functionality
│   │   ├── people.js       # People functionality
│   │   ├── profile.js      # Profile functionality
│   │   └── test-auth.js    # Authentication tests
│   └── stylesheets/
│       └── ...             # Additional stylesheets
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── chat.js             # Chat routes
│   ├── filters.js          # Filter routes
│   ├── index.js            # Index routes
│   ├── matches.js          # Matches routes
│   ├── people.js           # People routes
│   ├── profile.js          # Profile routes
│   └── users.js            # User routes
└── views/
    ├── error.ejs           # Error page
    ├── filters.ejs         # Filter page
    ├── index.ejs           # Home page
    ├── layout.ejs          # Layout template
    ├── login.ejs           # Login page
    ├── matches.ejs         # Matches page
    ├── people.ejs          # People page
    ├── profile-edit.ejs    # Profile editing
    ├── profile.ejs         # Profile page
    └── register.ejs        # Registration page
```

## Architecture

The application follows a MVC-like architecture:

- **Models**: Database models implemented through SQL queries directly in the routers
- **Views**: EJS templates in the `/views` directory structure
- **Controllers**: Express.js routers in the `/routes` directory structure

### Authentication

- JWT-based authentication (stateless)
- Token storage in the browser's localStorage
- Protected API endpoints via authenticateJWT middleware
- Automatic token addition to requests through fetch_auth.js

## Database Model

```
+----------------+       +-----------------+       +----------------+
|      USER      |       |     MATCHES     |       |     DISLIKES   |
+----------------+       +-----------------+       +----------------+
| id (PK)        |<----->| user_id (FK)    |       | id (PK)        |
| name           |       | liked_user_id (FK)      | user_id (FK)   |
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

### Entity Relationships

- **USER ↔ MATCHES**:
  - A user can like multiple other users (1:n)
  - A user can be liked by multiple other users (n:1)
  - A match occurs when User A likes User B and User B also likes User A

- **USER ↔ DISLIKES**:
  - A user can dislike multiple other users (1:n)
  - A user can be disliked by multiple other users (n:1)

- **USER ↔ USER_FILTERS**:
  - A user has exactly one filter entry (1:1)

- **USER ↔ USER_INTERACTIONS**:
  - A user has exactly one interactions entry (1:1)
  - Stores the number of user interactions (likes/dislikes)

- **USER ↔ MESSAGES**:
  - A user can send multiple messages (1:n)
  - A user can receive multiple messages (1:n)

## API Endpoints

### Authentication

| Endpoint    | HTTP Method | Function              | Expected Data             | Response              |
|-------------|-------------|----------------------|---------------------------|----------------------|
| /login      | GET         | Show login page      | -                         | Login form           |
| /login      | POST        | User login           | { email, password }       | { success, token, user } |
| /register   | GET         | Show registration page | -                       | Registration form    |
| /register   | POST        | Register user        | { name, gender, birthday, password } | { success, token, user } |
| /logout     | GET         | Logout user          | -                         | Logout page          |

### Profile

| Endpoint      | HTTP Method | Function            | Expected Data             | Response              |
|---------------|-------------|---------------------|---------------------------|----------------------|
| /profile      | GET         | Show profile        | -                         | Profile information  |
| /profile      | PUT         | Update profile      | { name, gender, birthday, image_url } | { success, message } |
| /profile      | DELETE      | Delete profile      | -                         | { success, message } |
| /profile/edit | GET         | Show edit page      | -                         | Edit form            |

### People (Matching)

| Endpoint         | HTTP Method | Function            | Expected Data | Response                    |
|------------------|-------------|---------------------|---------------|----------------------------|
| /people          | GET         | Show random profile | -             | Profile information        |
| /people/like/:id | POST        | Like profile        | -             | { success, match, message } |
| /people/dislike/:id | POST     | Dislike profile     | -             | { success }                |

### Matches

| Endpoint  | HTTP Method | Function            | Expected Data | Response                 |
|-----------|-------------|---------------------|---------------|-------------------------|
| /matches  | GET         | Show matches list   | -             | List of matched profiles |

### Filters

| Endpoint  | HTTP Method | Function            | Expected Data                          | Response     |
|-----------|-------------|---------------------|----------------------------------------|-------------|
| /filters  | GET         | Show filter settings | -                                     | Filter settings |
| /filters  | POST        | Update filters      | { min_age, max_age, gender_preference } | { message } |

### Chat

| Endpoint     | HTTP Method | Function            | Expected Data | Response                    |
|--------------|-------------|---------------------|---------------|----------------------------|
| /chat/:userId | GET        | Get chat history    | -             | { messages, chatPartner }   |
| /chat/:userId | POST       | Send message        | { content }   | { id, sender_id, recipient_id, content, created_at, isMine } |

### WebSocket Events

| Event        | Direction      | Function                  | Data                            |
|--------------|----------------|---------------------------|--------------------------------|
| connect      | Client → Server | Establish socket connection | -                            |
| authenticate | Client → Server | Authenticate socket connection | JWT Token                 |
| send_message | Client → Server | Send message             | { recipientId, content }       |
| message      | Server → Client | Receive message          | { id, senderId, recipientId, content, timestamp, isMine } |
| error        | Server → Client | Receive error            | { message }                    |

## Technology Stack

### Frontend
- HTML/EJS (Embedded JavaScript Templates)
- CSS with Bootstrap 5
- JavaScript (Client-side)
- Font Awesome for icons

### Backend
- Node.js
- Express.js as web framework
- MySQL as database
- Passport.js for authentication
- JSON Web Tokens (JWT) for authentication
- Socket.io for real-time chat functionality

## Testing

### Tested Functionality
- Authentication (Registration, Login, Token persistence)
- Profile management
- Matching system
- Filter application
- Matches display
- Real-time chat system

### Testing Methodology
- Manual testing of all features
- Edge cases and error scenarios
- Cross-browser testing in Firefox and Chrome
- Debugging with extensive logging

## User Guide

### Getting Started

#### Registration
1. Open the application homepage
2. Click "Register"
3. Fill out the form with:
   - Name
   - Gender (male/female)
   - Date of birth
   - Password
4. Click "Register"
5. You will be automatically logged in and redirected to the "Discover" page

#### Login
1. Open the application homepage
2. Click "Login"
3. Enter your name and password
4. Click "Login"

### Navigation
The main navigation includes:
- **Discover**: Shows potential matches
- **Matches**: Shows your successful matches
- **Filters**: Adjust your search settings
- **Profile**: Shows your profile information
- **Logout**: Signs you out

### Important Notes
- All likes and matches are permanent until you delete your profile
- Dislikes are reset after 10 interactions, so you can see these profiles again
- Profile pictures are embedded via URLs, so you need to use a valid image URL
- Chat messages are transmitted in real-time when both users are online
