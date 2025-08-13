import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { Conversation, Message } from './types';
import { getConversations, getMessages } from './services/api';

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:8000');
    setSocket(newSocket);

    // Load initial conversations
    loadConversations();

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      // Handle socket events without duplicates
      const handleNewMessage = (message: Message) => {
        console.log('New message received:', message);
        
        // Only add message if it's for current conversation
        if (selectedConversation && 
            (message.from === selectedConversation || message.to === selectedConversation)) {
          setMessages(prev => {
            // Prevent duplicates by checking if message already exists
            const exists = prev.some(m => m.messageId === message.messageId || m._id === message._id);
            if (exists) return prev;
            
            return [...prev, message].sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
          });
        }
        
        // Always refresh conversations to update last message
        loadConversations();
      };

      const handleMessageSent = (message: Message) => {
        console.log('Message sent confirmation:', message);
        // This handles the confirmation that our sent message was processed
        // No need to add to messages again as handleNewMessage will handle it
      };

      const handleStatusUpdate = (statusData: { messageId: string; status: string }) => {
        console.log('Status updated:', statusData);
        setMessages(prev => 
          prev.map(msg => 
            msg.messageId === statusData.messageId 
              ? { ...msg, status: statusData.status as 'sent' | 'delivered' | 'read' }
              : msg
          )
        );
      };

      // Register socket event listeners
      socket.on('new-message', handleNewMessage);
      socket.on('message-sent', handleMessageSent);
      socket.on('status-updated', handleStatusUpdate);

      // Cleanup listeners on unmount
      return () => {
        socket.off('new-message', handleNewMessage);
        socket.off('message-sent', handleMessageSent);
        socket.off('status-updated', handleStatusUpdate);
      };
    }
  }, [socket, selectedConversation]);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (phoneNumber: string) => {
    try {
      setMessages([]); // Clear existing messages first
      const data = await getMessages(phoneNumber);
      
      // Sort messages by timestamp to ensure proper order
      const sortedMessages = data.sort((a: Message, b: Message) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      setMessages(sortedMessages);
      
      // Join the conversation room for real-time updates
      if (socket) {
        socket.emit('join-conversation', phoneNumber);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleConversationSelect = (phoneNumber: string) => {
    setSelectedConversation(phoneNumber);
    loadMessages(phoneNumber);
  };

  const handleSendMessage = (messageData: any) => {
    // The socket event in ChatArea will handle message sending
    // This function is kept for compatibility but doesn't need to do anything
    console.log('Send message triggered:', messageData);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-whatsapp-gray-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-green mx-auto mb-4"></div>
          <p className="text-whatsapp-gray-dark">Loading WhatsApp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-whatsapp-gray-light">
      <Sidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onConversationSelect={handleConversationSelect}
        onLoadSampleData={loadConversations}
      />
      <ChatArea
        selectedConversation={selectedConversation}
        messages={messages}
        conversations={conversations}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default App;
