const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateJWT } = require('../middlewares/auth');

// Chat-Verlauf abrufen
router.get('/:userId', authenticateJWT, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = parseInt(req.params.userId);
    
    // Sicherstellen, dass ein Match zwischen den Benutzern besteht
    const [matches] = await pool.query(`
      SELECT * FROM matches m1
      JOIN matches m2 ON m1.user_id = m2.liked_user_id AND m1.liked_user_id = m2.user_id
      WHERE (m1.user_id = ? AND m1.liked_user_id = ?)
    `, [currentUserId, otherUserId]);
    
    if (matches.length === 0) {
      return res.status(403).json({ message: 'Kein Match mit diesem Benutzer' });
    }
    
    // Nachrichten abrufen (is_read statt read)
    const [messages] = await pool.query(`
      SELECT id, sender_id, recipient_id, content, is_read, created_at
      FROM messages
      WHERE (sender_id = ? AND recipient_id = ?) 
         OR (sender_id = ? AND recipient_id = ?)
      ORDER BY created_at ASC
    `, [currentUserId, otherUserId, otherUserId, currentUserId]);
    
    // Ungelesene Nachrichten als gelesen markieren (is_read statt read)
    await pool.query(`
      UPDATE messages
      SET is_read = TRUE
      WHERE recipient_id = ? AND sender_id = ? AND is_read = FALSE
    `, [currentUserId, otherUserId]);
    
    // Benutzerdetails des Chat-Partners abrufen
    const [userDetails] = await pool.query(
      'SELECT id, name, image_url FROM user WHERE id = ?',
      [otherUserId]
    );
    
    if (userDetails.length === 0) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
    
    res.json({
      messages: messages.map(msg => ({
        ...msg,
        isMine: msg.sender_id === currentUserId
      })),
      chatPartner: userDetails[0]
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Serverfehler' });
  }
});

// Nachricht senden (Fallback für nicht-Socket.io Clients)
router.post('/:userId', authenticateJWT, async (req, res) => {
  try {
    const senderId = req.user.id;
    const recipientId = parseInt(req.params.userId);
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Nachricht darf nicht leer sein' });
    }
    
    // Sicherstellen, dass ein Match zwischen den Benutzern besteht
    const [matches] = await pool.query(`
      SELECT * FROM matches m1
      JOIN matches m2 ON m1.user_id = m2.liked_user_id AND m1.liked_user_id = m2.user_id
      WHERE (m1.user_id = ? AND m1.liked_user_id = ?)
    `, [senderId, recipientId]);
    
    if (matches.length === 0) {
      return res.status(403).json({ message: 'Kein Match mit diesem Benutzer' });
    }
    
    // Nachricht speichern
    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, recipient_id, content) VALUES (?, ?, ?)',
      [senderId, recipientId, content]
    );
    
    res.status(201).json({
      id: result.insertId,
      sender_id: senderId,
      recipient_id: recipientId,
      content,
      created_at: new Date(),
      isMine: true
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Serverfehler' });
  }
});

// Enhanced sendMessage function
function sendMessage() {
  const content = messageInput.value.trim();
  
  if (!content || !currentChatPartnerId) return;
  
  // Create a temporary message ID
  const tempId = `temp-${Date.now()}`;
  const timestamp = new Date();
  
  // Add message to UI immediately (optimistic UI update)
  appendMessage({
    id: tempId,
    content: content,
    created_at: timestamp,
    isMine: true
  });
  
  // Scroll to the new message
  scrollToBottom();
  
  // Clear input field immediately for better user experience
  messageInput.value = '';
  
  // Via Socket.io senden
  socket.emit('send_message', {
    recipientId: currentChatPartnerId,
    content
  });
  
  // If you want a fallback for when Socket.io might fail
  // You can implement a retry mechanism or an HTTP fallback
  socket.once('message', (message) => {
    // If desired, you could replace the temporary message with the confirmed one
    // But usually this isn't necessary as they will appear identical
    console.log('Message confirmed by server:', message);
  });
  
  // Handle potential errors
  socket.once('error', (error) => {
    console.error('Error sending message:', error);
    // You could add UI feedback for the error here
    alert(`Fehler beim Senden: ${error.message}`);
  });
}

module.exports = router;