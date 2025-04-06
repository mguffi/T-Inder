// Test-Skript für die Authentifizierung
console.log('Test-Auth-Skript geladen');

// Token im localStorage überprüfen
const token = localStorage.getItem('token');
console.log('Token im localStorage:', token ? 'Vorhanden' : 'Nicht vorhanden');
if (token) {
  console.log('Token (gekürzt):', token.substring(0, 20) + '...');
}

// Teste einen authentifizierten API-Aufruf
document.getElementById('test-auth-button')?.addEventListener('click', function() {
  fetch('/people', {
    headers: {
      'Authorization': token
    }
  })
  .then(response => {
    console.log('Test-Auth-Anfrage Status:', response.status);
    return response.text();
  })
  .then(data => {
    console.log('Test-Auth-Antwort:', data.substring(0, 100) + '...');
  })
  .catch(error => {
    console.error('Test-Auth-Fehler:', error);
  });
});