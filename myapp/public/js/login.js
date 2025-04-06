// Stelle sicher, dass diese Datei existiert und eingebunden wird

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  
  if (!loginForm) {
    console.error('Login-Formular nicht gefunden');
    return;
  }
  
  // Formular-Submit abfangen
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Login-Anfrage senden
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Login-Antwort:', data);
      
      if (data.success) {
        // Token im localStorage speichern - WICHTIG: GENAU wie es zurückgegeben wird
        localStorage.setItem('token', data.token);
        console.log('Token gespeichert:', data.token);
        
        // WICHTIG! Hier liegt das Problem: Die reguläre Navigation sendet den Token nicht mit
        
        // Statt window.location zu verwenden, machen wir eine authentifizierte fetch-Anfrage
        // und rendern dann die Seite, ODER wir fügen den Token zur URL hinzu (Query-Parameter)
        
        // Option 1: Authentifizierte fetch-Anfrage für die HTML-Version
        fetch('/people', {
          headers: {
            'Authorization': data.token
          }
        })
        .then(response => {
          if (response.ok) {
            // Kompletten Seitenwechsel durchführen
            window.location.href = '/people';
          } else {
            alert('Fehler beim Laden der Personen-Seite: ' + response.status);
          }
        })
        .catch(error => {
          console.error('Fehler beim Laden der Personen-Seite:', error);
          // Trotzdem zur Seite navigieren als Fallback
          window.location.href = '/people';
        });
      } else {
        // Fehlerbehandlung
        alert('Login fehlgeschlagen: ' + (data.message || 'Unbekannter Fehler'));
      }
    })
    .catch(error => {
      console.error('Fehler beim Login:', error);
      alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    });
  });
});