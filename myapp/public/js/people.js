// Skript zur Handhabung der /people Seite

document.addEventListener('DOMContentLoaded', function() {
  console.log('people.js: Seite geladen');
  
  // Token aus localStorage abrufen
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('Kein Token gefunden, Umleitung zur Login-Seite');
    window.location.href = '/login';
    return;
  }
  
  // Mach einen expliziten Authentifizierungstest
  fetch('/people', {
    headers: {
      'Authorization': token
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Nicht autorisiert');
    }
    return response.json();
  })
  .then(data => {
    console.log('Authentifizierung erfolgreich:', data);
    // Hier kannst du die Seiteninhalte dynamisch rendern
  })
  .catch(error => {
    console.error('Fehler:', error);
    alert('Authentifizierungsfehler. Bitte erneut einloggen.');
    localStorage.removeItem('token');
    window.location.href = '/login';
  });
});