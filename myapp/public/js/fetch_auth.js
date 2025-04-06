// Dieses Skript fügt das Token automatisch zu Anfragen hinzu

// Warte, bis das Dokument geladen ist
document.addEventListener('DOMContentLoaded', function() {
  console.log('Authentifizierungs-Handler geladen');
  
  // Interceptor für fetch-Requests, um automatisch den Token hinzuzufügen

  console.log('fetch_auth.js: Lade Interceptor für fetch-Anfragen');

  // Die originale fetch-Funktion speichern
  const originalFetch = window.fetch;

  // Die fetch-Funktion überschreiben
  window.fetch = function(url, options = {}) {
    // Nur für relative URLs (eigene API-Endpunkte)
    if (url.startsWith('/') && !url.startsWith('//')) {
      const token = localStorage.getItem('token');
      
      if (token) {
        console.log('fetch_auth.js: Token gefunden, füge Authorization-Header hinzu');
        options = options || {};
        options.headers = options.headers || {};
        
        // Wichtig: Der Header muss 'Authorization' (genau so geschrieben) heißen
        options.headers['Authorization'] = token;
        
        console.log('fetch_auth.js: Anfrage an', url, 'mit Authorization-Header');
      } else {
        console.log('fetch_auth.js: Kein Token gefunden für Anfrage an', url);
      }
    }
    
    // Die originale fetch-Funktion mit den aktualisierten Optionen aufrufen
    return originalFetch(url, options);
  };

  console.log('fetch_auth.js: Interceptor geladen');
});