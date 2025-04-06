// Dieses Skript fügt das Token automatisch zu Anfragen hinzu

// Warte, bis das Dokument geladen ist
document.addEventListener('DOMContentLoaded', function() {
  console.log('Authentifizierungs-Handler geladen');
  
  // Fügt Token zu allen fetch-Requests hinzu
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    const token = localStorage.getItem('token');
    
    console.log('Fetch-Anfrage an:', url);
    
    // Nur für relative URLs (API-Endpunkte)
    if (url.startsWith('/') && !url.startsWith('//') && token) {
      console.log('Füge Token zu Anfrage hinzu');
      options = options || {};
      options.headers = options.headers || {};
      options.headers['Authorization'] = token;
    }
    
    return originalFetch(url, options);
  };
});