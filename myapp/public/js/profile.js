document.addEventListener('DOMContentLoaded', function() {
  console.log('Profil-Seite geladen');
  
  // Token aus localStorage abrufen
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('Kein Token gefunden, Umleitung zur Login-Seite');
    window.location.href = '/login';
    return;
  }
  
  // Account löschen Button-Handler
  document.getElementById('confirmDeleteAccount')?.addEventListener('click', function() {
    if (confirm('Bist du sicher, dass du deinen Account löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      fetch('/profile', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      })
      .then(response => {
        if (response.ok) {
          // Lösche Token und leite zur Startseite weiter
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/?deleted=true';
        } else {
          alert('Fehler beim Löschen des Accounts');
        }
      })
      .catch(error => {
        console.error('Fehler:', error);
        alert('Ein Fehler ist aufgetreten.');
      });
    }
  });
});