/**
 * WebSocket Chat Service to avoid exposing raw socket instances to views.
 */
import { getChatSocket } from './socket';

export const chatSocketService = {
  joinConversation: (token: string, tripId: string, onJoined: (data: { conversationId: string }) => void) => {
    const socket = getChatSocket(token);
    socket.emit('joinConversation', { tripId });
    socket.on('joinedConversation', onJoined);
    return () => {
      socket.off('joinedConversation', onJoined);
    };
  },

  sendMessage: (token: string, payload: { conversationId: string; content: string }) => {
    const socket = getChatSocket(token);
    socket.emit('sendMessage', payload);
  },

  onNewMessage: (token: string, onMessageReceived: (message: any) => void) => {
    const socket = getChatSocket(token);
    socket.on('newMessage', onMessageReceived);
    return () => {
      socket.off('newMessage', onMessageReceived);
    };
  }
};
