document.addEventListener('DOMContentLoaded', function() {
  console.log('Matches-Seite geladen');
  
  // Token aus localStorage prüfen
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('Kein Token gefunden, Umleitung zur Login-Seite');
    window.location.href = '/login';
    return;
  }

  // Socket.io-Verbindung herstellen
  const socket = io();
  
  // Mit Socket.io authentifizieren
  socket.emit('authenticate', token);
  
  let currentChatPartnerId = null;
  const chatMessages = document.getElementById('chat-messages');
  const messageInput = document.getElementById('message-input');
  const sendMessageBtn = document.getElementById('send-message-btn');
  
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
      
      // Chat-Verlauf laden
      loadChatHistory(matchId);
      
      // Aktuellen Chat-Partner speichern
      currentChatPartnerId = matchId;
      
      // Chat-Modal öffnen
      const chatModal = new bootstrap.Modal(document.getElementById('chatModal'));
      chatModal.show();
      
      // Input-Feld fokussieren
      setTimeout(() => {
        messageInput.focus();
      }, 500);
    });
  });

  // Nachrichten-Verlauf laden
  async function loadChatHistory(userId) {
    try {
      chatMessages.innerHTML = `
        <div class="text-center text-muted py-5" id="chat-loading">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Nachrichten werden geladen...</p>
        </div>
      `;
      
      const response = await fetch(`/chat/${userId}`, {
        headers: {
          'Authorization': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Nachrichten');
      }
      
      const data = await response.json();
      
      // Chat-Verlauf anzeigen
      displayChatHistory(data.messages);
      
    } catch (error) {
      console.error('Fehler:', error);
      chatMessages.innerHTML = `
        <div class="text-center text-danger py-5">
          <i class="fas fa-exclamation-circle fa-2x mb-3"></i>
          <p>Fehler beim Laden der Nachrichten.</p>
        </div>
      `;
    }
  }
  
  // Chat-Verlauf anzeigen
  function displayChatHistory(messages) {
    if (!messages || messages.length === 0) {
      chatMessages.innerHTML = `
        <div class="text-center text-muted py-5">
          <i class="fas fa-comments fa-2x mb-3"></i>
          <p>Noch keine Nachrichten. Schreibe jetzt!</p>
        </div>
      `;
      return;
    }
    
    chatMessages.innerHTML = '';
    
    messages.forEach(message => {
      appendMessage(message);
    });
    
    // Zum Ende des Chats scrollen
    scrollToBottom();
  }
  
  // Nachricht anhängen
  function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('mb-2', 'd-flex');
    
    if (message.isMine) {
      messageElement.classList.add('justify-content-end');
      messageElement.innerHTML = `
        <div class="message-bubble sent bg-primary text-white rounded p-2 px-3 mw-75">
          ${message.content}
          <div class="text-right small text-white-50">
            ${formatTime(message.created_at)}
          </div>
        </div>
      `;
    } else {
      messageElement.classList.add('justify-content-start');
      messageElement.innerHTML = `
        <div class="message-bubble received bg-light rounded p-2 px-3 mw-75">
          ${message.content}
          <div class="text-right small text-muted">
            ${formatTime(message.created_at)}
          </div>
        </div>
      `;
    }
    
    chatMessages.appendChild(messageElement);
  }
  
  // Zum Ende des Chats scrollen
  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Zeit formatieren
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Nachricht senden (mit Enter-Taste)
  messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Nachricht senden (mit Button)
  sendMessageBtn.addEventListener('click', sendMessage);
  
  // Nachricht senden
  function sendMessage() {
    const content = messageInput.value.trim();
    
    if (!content || !currentChatPartnerId) return;
    
    // Via Socket.io senden
    socket.emit('send_message', {
      recipientId: currentChatPartnerId,
      content
    });
    
    // Input-Feld leeren
    messageInput.value = '';
  }
  
  // Socket.io-Events
  socket.on('message', function(message) {
    // Nur anzeigen, wenn das aktuelle Chat-Fenster geöffnet ist
    if (currentChatPartnerId === message.senderId || currentChatPartnerId === message.recipientId) {
      appendMessage(message);
      scrollToBottom();
    }
  });
  
  socket.on('error', function(error) {
    console.error('Socket.io Error:', error);
    alert('Fehler: ' + error.message);
  });

  // Update die package.json, um socket.io als Abhängigkeit hinzuzufügen
  // npm install socket.io --save
});