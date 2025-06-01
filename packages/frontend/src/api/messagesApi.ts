import apiClient from './axios';

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
  const response = await apiClient.get<MessagesResponse>('/messages', { params });
  return response.data;
};

export const markMessageAsRead = async (id: string): Promise<Message> => {
  const response = await apiClient.patch<Message>(`/messages/${id}/read`);
  return response.data;
};

export const sendMessage = async (data: CreateMessageRequest): Promise<Message> => {
  const response = await apiClient.post<Message>('/messages', data);
  return response.data;
};