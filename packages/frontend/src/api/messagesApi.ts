import axios from 'axios';
import { API_BASE_URL } from '@/config';

// Types
export interface Message {
  id: string;
  messageType: 'SYSTEM' | 'PRIVATE';
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
  };
}

export interface MessagesResponse {
  data: Message[];
  total: number;
}

export interface CreateMessageRequest {
  messageType: 'SYSTEM' | 'PRIVATE';
  recipientId?: string;
  content: string;
}

// API functions
export const getMessages = async (params?: {
  type?: string;
  isRead?: boolean;
  limit?: number;
  offset?: number;
}): Promise<MessagesResponse> => {
  const response = await axios.get(`${API_BASE_URL}/messages`, { params });
  return response.data;
};

export const markMessageAsRead = async (id: string): Promise<Message> => {
  const response = await axios.patch(`${API_BASE_URL}/messages/${id}/read`);
  return response.data;
};

export const sendMessage = async (data: CreateMessageRequest): Promise<Message> => {
  const response = await axios.post(`${API_BASE_URL}/messages`, data);
  return response.data;
};
