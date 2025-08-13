import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getConversations = async () => {
  const response = await api.get("/messages/conversations");
  return response.data;
};

export const getMessages = async (phoneNumber: string) => {
  const response = await api.get(`/messages/conversation/${phoneNumber}`);
  return response.data;
};

export const sendMessage = async (messageData: {
  to: string;
  body: string;
  contactName: string;
}) => {
  const response = await api.post("/messages/send", messageData);
  return response.data;
};

export const loadSampleData = async () => {
  const response = await api.post("/messages/load-sample");
  return response.data;
};

export const loadConversation = async (conversationId: string) => {
  const response = await api.post(
    `/messages/load-conversation/${conversationId}`
  );
  return response.data;
};

export const debugMessages = async () => {
  const response = await api.get("/messages/debug/messages");
  return response.data;
};
