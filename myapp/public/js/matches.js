document.addEventListener('DOMContentLoaded', function() {
  console.log('Matches-Seite geladen');
  
  // Token aus localStorage prüfen
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('Kein Token gefunden, Umleitung zur Login-Seite');
    window.location.href = '/login';
    return;
  }

  // Event-Listener für Chat-Buttons
  const chatButtons = document.querySelectorAll('.match-chat');
  chatButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Match-ID und Name für Chat-Funktionalität
      const matchId = this.getAttribute('data-id');
      const matchName = this.getAttribute('data-name');
      
      // Chat-Partner-Name im Modal setzen
      document.getElementById('chat-partner-name').textContent = matchName;
      
      // Chat-Modal öffnen
      const chatModal = new bootstrap.Modal(document.getElementById('chatModal'));
      chatModal.show();
      
      // Hier würde später die echte Chat-Funktionalität implementiert werden
      console.log(`Chat mit Match ID ${matchId} geöffnet`);
    });
  });

  // Beispiel für zukünftige Implementierung: Automatisches Aktualisieren der Matches
  function refreshMatches() {
    fetch('/matches', {
      headers: {
        'Authorization': token
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Matches');
      }
      // In einer echten Implementierung würde hier die Liste der Matches aktualisiert
      // ohne die Seite neu zu laden
    })
    .catch(error => {
      console.error('Fehler:', error);
    });
  }

  // Periodisches Aktualisieren könnte hier implementiert werden
  // const refreshInterval = setInterval(refreshMatches, 60000); // Jede Minute
});