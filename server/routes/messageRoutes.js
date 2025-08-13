import express from "express";
import Message from "../models/Message.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const BUSINESS_NUMBER = "918329446654"; // business phone number

// Get all conversations
router.get("/conversations", async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        // Match messages where business number is sender OR receiver
        $match: {
          $or: [
            { from: BUSINESS_NUMBER },
            { to: BUSINESS_NUMBER }
          ]
        }
      },
      {
        // Group by the other party (not business number)
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$from", BUSINESS_NUMBER] },
              then: "$to",
              else: "$from"
            }
          },
          lastMessage: { $last: "$body" },
          lastTimestamp: { $last: "$timestamp" },
          contactName: { $last: "$contactName" },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $ne: ["$status", "read"] },
                    { $ne: ["$from", BUSINESS_NUMBER] } // Only count unread from others
                  ]
                }, 
                1, 
                0
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: "$_id", // This is the phone number
          phoneNumber: "$_id",
          contactName: { $ifNull: ["$contactName", "$_id"] },
          lastMessage: 1,
          lastTimestamp: 1,
          unreadCount: 1,
        },
      },
      { $sort: { lastTimestamp: -1 } },
    ]);

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a specific conversation
router.get("/conversation/:phoneNumber", async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    const messages = await Message.find({
      $or: [
        { from: phoneNumber, to: BUSINESS_NUMBER }, // Messages from contact to business
        { from: BUSINESS_NUMBER, to: phoneNumber }, // Messages from business to contact
      ],
    }).sort({ timestamp: 1 }); // Sort chronologically

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: error.message });
  }
});

// Send a new message
router.post("/send", async (req, res) => {
  try {
    const { to, body, contactName } = req.body;

    const message = new Message({
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: BUSINESS_NUMBER,
      to,
      body,
      contactName: contactName || to,
      isOutgoing: true, // Messages FROM business are outgoing
      status: "sent",
      timestamp: new Date(), // Use current timestamp
    });

    const savedMessage = await message.save();
    
    // Emit socket event for real-time update
    req.app.get('io').emit('new-message', savedMessage);
    
    res.json(savedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: error.message });
  }
});

// Load sample data
router.post("/load-sample", async (req, res) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dataPath = path.join(__dirname, "..", "data");

    if (!fs.existsSync(dataPath)) {
      return res.status(400).json({ error: "Data directory not found" });
    }

    const files = fs
      .readdirSync(dataPath)
      .filter((file) => file.endsWith(".json"));

    if (files.length === 0) {
      return res.status(400).json({ error: "No JSON files found in data directory" });
    }

    const allMessages = [];
    const statusUpdates = [];

    for (const file of files) {
      try {
        const filePath = path.join(dataPath, file);
        const fileContent = JSON.parse(fs.readFileSync(filePath, "utf8"));

        if (fileContent.metaData?.entry) {
          for (const entry of fileContent.metaData.entry) {
            if (entry.changes) {
              for (const change of entry.changes) {
                if (change.field === "messages" && change.value) {
                  const value = change.value;

                  // Process messages
                  if (value.contacts && value.messages) {
                    for (const message of value.messages) {
                      const contact = value.contacts.find(c => c.wa_id === message.from) || value.contacts[0];
                      
                      const isOutgoing = message.from === BUSINESS_NUMBER;
                      
                      const messageObj = {
                        messageId: message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        from: message.from,
                        to: isOutgoing ? contact.wa_id : BUSINESS_NUMBER,
                        body: message.text?.body || "Media message",
                        contactName: contact.profile?.name || contact.wa_id || message.from,
                        timestamp: new Date(parseInt(message.timestamp) * 1000),
                        status: isOutgoing ? "sent" : "delivered",
                        isOutgoing: isOutgoing,
                        type: message.type || "text",
                      };

                      allMessages.push(messageObj);
                    }
                  }

                  // Process status updates
                  if (value.statuses) {
                    for (const status of value.statuses) {
                      statusUpdates.push({
                        messageId: status.id,
                        status: status.status,
                        timestamp: new Date(parseInt(status.timestamp) * 1000),
                        recipient_id: status.recipient_id
                      });
                    }
                  }
                }
              }
            }
          }
        }

        // Handle files that are pure status update payloads
        if (fileContent.payload_type === 'whatsapp_webhook' && fileContent.metaData?.entry) {
          for (const entry of fileContent.metaData.entry) {
            for (const change of entry.changes) {
              if (change.field === "messages" && change.value?.statuses) {
                for (const status of change.value.statuses) {
                  statusUpdates.push({
                    messageId: status.id,
                    status: status.status,
                    timestamp: new Date(parseInt(status.timestamp) * 1000),
                    recipient_id: status.recipient_id
                  });
                }
              }
            }
          }
        }

      } catch (fileError) {
        console.error(`Error processing file ${file}:`, fileError);
      }
    }

    if (allMessages.length === 0) {
      return res.status(400).json({ error: "No valid messages found in JSON files" });
    }

    // Clear existing messages and insert new ones
    await Message.deleteMany({});
    await Message.insertMany(allMessages);

    // Apply status updates after messages are inserted
    let updatedCount = 0;
    for (const statusUpdate of statusUpdates) {
      const result = await Message.findOneAndUpdate(
        { messageId: statusUpdate.messageId },
        { 
          status: statusUpdate.status,
          // Optionally update timestamp if status is newer
          $max: { timestamp: statusUpdate.timestamp }
        },
        { new: true }
      );
      
      if (result) {
        updatedCount++;
        console.log(`Updated message ${statusUpdate.messageId} to status: ${statusUpdate.status}`);
        
        // Emit real-time status update if socket.io is available
        if (req.app.get('io')) {
          req.app.get('io').emit('status-updated', {
            messageId: statusUpdate.messageId,
            status: statusUpdate.status,
            phoneNumber: result.from === BUSINESS_NUMBER ? result.to : result.from
          });
        }
      } else {
        console.warn(`Message not found for status update: ${statusUpdate.messageId}`);
      }
    }

    console.log(`Loaded ${allMessages.length} messages from ${files.length} files`);
    console.log(`Applied ${updatedCount} status updates`);

    res.json({
      message: `Sample data loaded successfully from ${files.length} files`,
      messagesCount: allMessages.length,
      statusUpdatesCount: updatedCount,
      filesProcessed: files,
    });
  } catch (error) {
    console.error("Error loading sample data:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
