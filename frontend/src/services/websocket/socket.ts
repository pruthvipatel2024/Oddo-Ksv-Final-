import { io, Socket } from 'socket.io-client';
import { env } from '@/src/config/env';
import { logger } from '@/src/lib/logger';

let chatSocket: Socket | null = null;
let trackingSocket: Socket | null = null;

export const getChatSocket = (token: string): Socket => {
  if (!chatSocket) {
    logger.info('Initializing single chat namespace WebSocket...');
    chatSocket = io(`${env.WS_URL}/chat`, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    chatSocket.on('connect', () => {
      logger.info('Chat WebSocket connected successfully.');
    });

    chatSocket.on('connect_error', (error) => {
      logger.error('Chat WebSocket connection error:', error);
    });

    chatSocket.on('disconnect', (reason) => {
      logger.warn('Chat WebSocket disconnected:', reason);
    });
  }
  return chatSocket;
};

export const getTrackingSocket = (token: string): Socket => {
  if (!trackingSocket) {
    logger.info('Initializing single tracking namespace WebSocket...');
    trackingSocket = io(`${env.WS_URL}/tracking`, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    trackingSocket.on('connect', () => {
      logger.info('Tracking WebSocket connected successfully.');
    });

    trackingSocket.on('connect_error', (error) => {
      logger.error('Tracking WebSocket connection error:', error);
    });

    trackingSocket.on('disconnect', (reason) => {
      logger.warn('Tracking WebSocket disconnected:', reason);
    });
  }
  return trackingSocket;
};

export const disconnectSockets = (): void => {
  if (chatSocket) {
    logger.info('Disconnecting chat WebSocket...');
    chatSocket.disconnect();
    chatSocket = null;
  }
  if (trackingSocket) {
    logger.info('Disconnecting tracking WebSocket...');
    trackingSocket.disconnect();
    trackingSocket = null;
  }
};
