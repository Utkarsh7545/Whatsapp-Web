import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// Process webhook payload
router.post('/process', async (req, res) => {
  try {
    const payload = req.body;
    
    if (payload.payload_type === 'whatsapp_webhook') {
      const entry = payload.metaData.entry[0];
      const change = entry.changes[0];
      
      if (change.field === 'messages' && change.value.messages) {
        // Process incoming messages
        for (const msg of change.value.messages) {
          const contact = change.value.contacts?.find(c => c.wa_id === msg.from);
          
          const message = new Message({
            messageId: msg.id,
            from: msg.from,
            to: change.value.metadata.display_phone_number,
            body: msg.text?.body || msg.caption || 'Media message',
            type: msg.type,
            timestamp: new Date(parseInt(msg.timestamp) * 1000),
            contactName: contact?.profile?.name || msg.from,
            status: 'delivered'
          });
          
          await message.save();
        }
      } else if (change.field === 'messages' && change.value.statuses) {
        // Process status updates
        for (const status of change.value.statuses) {
          await Message.findOneAndUpdate(
            { messageId: status.id },
            { status: status.status },
            { new: true }
          );
        }
      }
    }
    
    res.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
