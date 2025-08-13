import Message from '../models/Message.js';

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a conversation room
    socket.on('join-conversation', (phoneNumber) => {
      socket.join(`conversation-${phoneNumber}`);
      console.log(`User ${socket.id} joined conversation-${phoneNumber}`);
    });

    // Handle sending message
    socket.on('send-message', async (messageData) => {
      try {
        // Create and save message to database
        const message = new Message({
          messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          from: "918329446654", // Business number
          to: messageData.to,
          body: messageData.body,
          contactName: messageData.contactName || messageData.to,
          isOutgoing: true,
          status: "sent",
          timestamp: new Date(),
        });

        const savedMessage = await message.save();

        // Emit to all clients in the conversation (including sender)
        io.to(`conversation-${messageData.to}`).emit('new-message', savedMessage);
        
        // Also emit to sender if they're not in the conversation room
        socket.emit('message-sent', savedMessage);

        console.log('Message sent and saved:', savedMessage.messageId);
      } catch (error) {
        console.error('Error handling send-message:', error);
        socket.emit('message-error', { error: error.message });
      }
    });

    // Handle message status updates
    socket.on('message-status-update', async (statusData) => {
      try {
        const { messageId, status, phoneNumber } = statusData;
        
        // Update message status in database
        const updatedMessage = await Message.findOneAndUpdate(
          { messageId },
          { status },
          { new: true }
        );

        if (updatedMessage) {
          // Broadcast status update to conversation participants
          io.to(`conversation-${phoneNumber}`).emit('status-updated', {
            messageId,
            status,
            phoneNumber
          });
        }
      } catch (error) {
        console.error('Error updating message status:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}
