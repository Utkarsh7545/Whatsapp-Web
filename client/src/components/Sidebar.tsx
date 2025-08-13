import React, { useState } from "react";
import { Search, MessageCircle, MoreVertical, Users } from "lucide-react";
import { Conversation } from "../types";
import { loadSampleData } from "../services/api";

interface SidebarProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onConversationSelect: (phoneNumber: string) => void;
  onLoadSampleData: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  selectedConversation,
  onConversationSelect,
  onLoadSampleData,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv._id.includes(searchTerm)
  );

  const handleLoadSampleData = async () => {
    setLoading(true);
    try {
      await loadSampleData();
      onLoadSampleData();
    } catch (error) {
      console.error("Error loading sample data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-whatsapp-gray-light p-4 flex items-center justify-between border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-whatsapp-green rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-whatsapp-gray-dark">
            WhatsApp
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <Users className="w-5 h-5 text-whatsapp-gray-dark" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-whatsapp-gray-dark" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 bg-white border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="w-full pl-10 pr-4 py-2 bg-whatsapp-gray-light rounded-lg border-none outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Load Sample Data Button */}
      {conversations.length === 0 && (
        <div className="p-4 border-b">
          <button
            onClick={handleLoadSampleData}
            disabled={loading}
            className="w-full bg-whatsapp-green text-white py-2 px-4 rounded-lg hover:bg-whatsapp-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Load Sample Data"}
          </button>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No conversations yet</p>
            <p className="text-sm">
              Start a conversation or load sample data to get started
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation._id}
              onClick={() =>
                onConversationSelect(
                  conversation.phoneNumber || conversation._id
                )
              }
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation ===
                (conversation.phoneNumber || conversation._id)
                  ? "bg-whatsapp-gray-light"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-lg">
                    {conversation.contactName?.charAt(0).toUpperCase() ||
                      conversation._id.slice(-2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conversation.contactName || conversation._id}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatTime(conversation.lastTimestamp)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-whatsapp-green text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
