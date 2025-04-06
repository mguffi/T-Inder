// Stelle sicher, dass diese Datei existiert und eingebunden wird

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
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
          // WICHTIG: Token im localStorage speichern
          localStorage.setItem('token', data.token);
          console.log('Token wurde im localStorage gespeichert:', data.token.substring(0, 20) + '...');
          
          // Benutzerinfos speichern
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Umleitung zur People-Seite
          window.location.href = '/people';
        } else {
          alert('Login fehlgeschlagen: ' + (data.message || 'Unbekannter Fehler'));
        }
      })
      .catch(err => {
        console.error('Fehler beim Login:', err);
        alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      });
    });
  }
});