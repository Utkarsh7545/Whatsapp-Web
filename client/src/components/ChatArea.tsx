import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  Check,
  CheckCheck,
} from "lucide-react";
import { Message, Conversation } from "../types";
import { sendMessage } from "../services/api";

interface ChatAreaProps {
  selectedConversation: string | null;
  messages: Message[];
  conversations: Conversation[];
  onSendMessage: (messageData: any) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedConversation,
  messages,
  conversations,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentConversation = conversations.find(
    (c) => c.phoneNumber === selectedConversation || c._id === selectedConversation
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage(""); 

    try {
      const messageData = {
        to: selectedConversation,
        body: messageText,
        contactName: currentConversation?.contactName || selectedConversation,
      };

      // Send via API (this will also emit socket event)
      await sendMessage(messageData);
      

    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  // Better date/time formatting with error handling
  const formatTime = (timestamp: string | Date) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return "00:00";
      }
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      console.warn('Error formatting time:', error);
      return "00:00";
    }
  };

  const formatDate = (timestamp: string | Date) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return "Invalid Date";
      }

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    } catch (error) {
      console.warn('Error formatting date:', error);
      return "Invalid Date";
    }
  };

  const renderStatusIcon = (status: string, isOutgoing: boolean) => {
    if (!isOutgoing) return null;

    switch (status) {
      case "sent":
        return <Check className="w-4 h-4 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  // Better message grouping with error handling
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      try {
        const date = new Date(message.timestamp);
        let dateKey: string;

        if (isNaN(date.getTime())) {
          dateKey = "Invalid Date";
        } else {
          dateKey = date.toDateString();
        }

        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(message);
      } catch (error) {
        console.warn('Error grouping message:', error);
        if (!groups["Invalid Date"]) {
          groups["Invalid Date"] = [];
        }
        groups["Invalid Date"].push(message);
      }
    });

    return groups;
  };

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-whatsapp-gray-light">
        <div className="text-center">
          <div className="w-64 h-64 mx-auto mb-8 opacity-20">
            <svg viewBox="0 0 303 172" className="w-full h-full">
              <defs>
                <linearGradient id="a" x1="50%" x2="50%" y1="100%" y2="0%">
                  <stop offset="0%" stopColor="#1fa2f3" stopOpacity=".08"></stop>
                  <stop offset="100%" stopColor="#1fa2f3" stopOpacity=".02"></stop>
                </linearGradient>
              </defs>
              <path
                fill="url(#a)"
                d="M229.221 12.739c11.031 0 19.97 8.939 19.97 19.97v106.562c0 11.031-8.939 19.97-19.97 19.97H73.779c-11.031 0-19.97-8.939-19.97-19.97V32.709c0-11.031 8.939-19.97 19.97-19.97h155.442z"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-light text-whatsapp-gray-dark mb-2">
            WhatsApp Web
          </h2>
          <p className="text-whatsapp-gray-dark opacity-60 max-w-md mx-auto">
            Send and receive messages without keeping your phone online. Use
            WhatsApp on up to 4 linked devices and 1 phone at the same time.
          </p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col bg-whatsapp-gray">
      {/* Chat Header */}
      <div className="bg-whatsapp-gray-light p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {currentConversation?.contactName?.charAt(0).toUpperCase() ||
                selectedConversation.slice(-2)}
            </span>
          </div>
          <div>
            <h2 className="font-medium text-whatsapp-gray-dark">
              {currentConversation?.contactName || selectedConversation}
            </h2>
            <p className="text-sm text-gray-500">online</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <Video className="w-5 h-5 text-whatsapp-gray-dark" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <Phone className="w-5 h-5 text-whatsapp-gray-dark" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-whatsapp-gray-dark" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(messageGroups)
          .sort(([dateA], [dateB]) => {
            // Sort date groups chronologically
            if (dateA === "Invalid Date") return 1;
            if (dateB === "Invalid Date") return -1;
            return new Date(dateA).getTime() - new Date(dateB).getTime();
          })
          .map(([dateKey, dayMessages]) => (
            <div key={dateKey}>
              {/* Date Separator */}
              <div className="flex justify-center mb-4">
                <span className="bg-white px-3 py-1 rounded-lg text-xs text-gray-600 shadow-sm">
                  {dateKey === "Invalid Date" ? "Invalid Date" : formatDate(dayMessages[0].timestamp)}
                </span>
              </div>

              {/* Messages for this date */}
              {dayMessages.map((message, index) => (
                <div
                  key={message._id || `${dateKey}-${index}-${message.messageId}`}
                  className={`flex ${
                    message.isOutgoing ? "justify-end" : "justify-start"
                  } mb-2`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isOutgoing
                        ? "bg-whatsapp-green-light text-gray-800"
                        : "bg-white text-gray-800"
                    } shadow-sm`}
                  >
                    <p className="text-sm leading-relaxed">{message.body}</p>
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                      {renderStatusIcon(message.status, message.isOutgoing)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-whatsapp-gray-light p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <button
            type="button"
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <Smile className="w-6 h-6 text-whatsapp-gray-dark" />
          </button>
          <button
            type="button"
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <Paperclip className="w-6 h-6 text-whatsapp-gray-dark" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
              className="w-full px-4 py-2 bg-white rounded-full border border-gray-200 outline-none focus:border-whatsapp-green transition-colors"
              disabled={sending}
            />
          </div>
          {newMessage.trim() ? (
            <button
              type="submit"
              disabled={sending}
              className="p-2 bg-whatsapp-green hover:bg-whatsapp-green-dark rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-6 h-6 text-white" />
            </button>
          ) : (
            <button
              type="button"
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <Mic className="w-6 h-6 text-whatsapp-gray-dark" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
