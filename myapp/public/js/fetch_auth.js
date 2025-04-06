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
        
        // Wichtig: Der Header muss 'Authorization' heißen
        options.headers['Authorization'] = token;
        
        console.log('fetch_auth.js: Anfrage an', url, 'mit Authorization-Header');
      } else {
        console.log('fetch_auth.js: Kein Token gefunden für Anfrage an', url);
      }
    }
    
    // Die originale fetch-Funktion mit den aktualisierten Optionen aufrufen
    return originalFetch(url, options);
  };

  // Im DOMContentLoaded Event einen Event-Listener für alle Links hinzufügen
  // Für geschützte Routen
  const protectedRoutes = ['/people', '/profile', '/matches', '/filters'];
  
  // Jedes Link-Klick-Event abfangen
  document.body.addEventListener('click', function(e) {
    // Prüfen, ob ein Link geklickt wurde
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      const link = e.target.tagName === 'A' ? e.target : e.target.closest('a');
      const href = link.getAttribute('href');
      
      // Nur für interne Links zu geschützten Routen
      if (href && href.startsWith('/') && !href.startsWith('//') && 
          protectedRoutes.some(route => href.startsWith(route))) {
        
        // Token aus localStorage holen
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('Keine Authentifizierung für geschützte Route');
          // Optional: Zur Login-Seite umleiten
          e.preventDefault();
          window.location.href = '/login';
          return;
        }
        
        // Link-Klick abfangen
        e.preventDefault();
        
        // Authentifizierte Anfrage senden
        fetch(href, {
          headers: {
            'Authorization': token
          }
        })
        .then(response => {
          if (response.ok) {
            // Erfolgreiche Antwort, zur Seite navigieren
            window.location.href = href;
          } else if (response.status === 401) {
            // Nicht autorisiert, zum Login umleiten
            alert('Nicht autorisiert. Bitte melden Sie sich erneut an.');
            localStorage.removeItem('token');
            window.location.href = '/login';
          } else {
            // Andere Fehler
            alert('Fehler: ' + response.status);
          }
        })
        .catch(error => {
          console.error('Fehler bei der Anfrage:', error);
          // Trotzdem zur Seite navigieren als Fallback
          window.location.href = href;
        });
      }
    }
  });

  console.log('fetch_auth.js: Interceptor und Click-Handler geladen');
});