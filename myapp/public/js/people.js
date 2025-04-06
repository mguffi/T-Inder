// Skript zur Handhabung der /people Seite

document.addEventListener('DOMContentLoaded', function() {
  console.log('People-Seite geladen');
  
  // Überprüfe, ob ein Token vorhanden ist
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Kein Token gefunden, Umleitung zur Login-Seite');
    window.location.href = '/login';
    return;
  }
  
  console.log('Token gefunden:', token.substring(0, 20) + '...');
  
  // Manuelle Anfrage mit Token
  fetch('/people', {
    headers: {
      'Authorization': localStorage.getItem('token')
    }
  })
  .then(response => {
    console.log('People-Antwort Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('People-Daten geladen:', data);
    // Hier Daten anzeigen
  })
  .catch(error => {
    console.error('Fehler beim Laden der People-Daten:', error);
  });
});