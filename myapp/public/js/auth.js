// JavaScript für die Token-Verwaltung und authentifizierte Anfragen

// Token aus dem localStorage holen
function getAuthToken() {
    return localStorage.getItem('token');
}

// Prüfen, ob der Benutzer angemeldet ist
function isAuthenticated() {
    return !!getAuthToken();
}

// Hilfsfunktion für authentifizierte API-Anfragen
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
        console.error('Kein Token vorhanden, Weiterleitung zum Login');
        window.location.href = '/login';
        return;
    }
    
    // Standardoptionen mit Authorization-Header
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token // Token sollte bereits "Bearer " enthalten
        }
    };
    
    // Optionen zusammenführen
    const mergedOptions = { ...defaultOptions, ...options };
    
    if (options.headers) {
        mergedOptions.headers = { ...defaultOptions.headers, ...options.headers };
    }
    
    console.log('Sende authentifizierte Anfrage an', url);
    
    return fetch(url, mergedOptions);
}

// Ausloggen
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// Benutzernavigation aktualisieren nach Login/Logout
document.addEventListener('DOMContentLoaded', function() {
    // Navigation basierend auf Authentifizierungsstatus aktualisieren
    const token = localStorage.getItem('token');
    const navbarNav = document.getElementById('navbarNav');
    
    if (navbarNav) {
        // Neue Navigation basierend auf Authentifizierungsstatus erstellen
        const navHtml = token ? 
            `<ul class="navbar-nav ms-auto">
                <li class="nav-item">
                    <a class="nav-link" href="/people"><i class="fas fa-users"></i> Entdecken</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/matches"><i class="fas fa-heart"></i> Matches</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/filters"><i class="fas fa-filter"></i> Filter</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/profile"><i class="fas fa-user"></i> Profil</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="javascript:logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </li>
            </ul>` :
            `<ul class="navbar-nav ms-auto">
                <li class="nav-item">
                    <a class="nav-link" href="/login"><i class="fas fa-sign-in-alt"></i> Login</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/register"><i class="fas fa-user-plus"></i> Registrieren</a>
                </li>
            </ul>`;
        
        navbarNav.innerHTML = navHtml;
    }
});