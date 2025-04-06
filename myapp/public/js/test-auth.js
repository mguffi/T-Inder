// Test-Skript für die Authentifizierung
console.log('Test-Auth-Skript geladen');

document.getElementById('test-auth-button')?.addEventListener('click', function() {
  // Status des Tokens überprüfen
  const token = localStorage.getItem('token');
  
  // Informationen anzeigen
  alert(
    token 
      ? `Token vorhanden: ${token.substring(0, 20)}...` 
      : 'Kein Token gefunden!'
  );
  
  // Token-Test durchführen
  if (token) {
    fetch('/people', {
      headers: {
        'Authorization': token
      }
    })
    .then(response => {
      console.log('Test-Anfrage Status:', response.status);
      alert(`Test-Anfrage Status: ${response.status}`);
      
      if (response.ok) {
        return response.text();
      } else {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
    })
    .then(data => {
      console.log('Test-Anfrage erfolgreich');
    })
    .catch(error => {
      console.error('Test-Anfrage fehlgeschlagen:', error);
      alert('Test fehlgeschlagen: ' + error);
    });
  }
});