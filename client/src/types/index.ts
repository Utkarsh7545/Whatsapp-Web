export interface Message {
  _id: string;
  messageId: string;
  from: string;
  to: string;
  body: string;
  type: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  contactName?: string;
  isOutgoing: boolean;
}

export interface Conversation {
  _id: string;
  phoneNumber: string;
  lastMessage: string;
  lastTimestamp: string;
  contactName: string;
  unreadCount: number;
}
