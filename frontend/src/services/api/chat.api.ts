import { apiClient } from './client';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const chatApi = {
  getMessages: (tripId: string) => 
    apiClient.get<{ success: boolean; data: ChatMessage[] }>(`/chat/trips/${tripId}/messages`),
};
