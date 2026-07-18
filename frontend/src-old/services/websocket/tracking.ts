/**
 * WebSocket Tracking Service to avoid exposing raw socket instances to views.
 */
import { getTrackingSocket } from './socket';

export const trackingSocketService = {
  joinTrip: (token: string, tripId: string) => {
    const socket = getTrackingSocket(token);
    socket.emit('joinTrip', { tripId });
  },

  pingLocation: (token: string, payload: { tripId: string; lat: number; lng: number }) => {
    const socket = getTrackingSocket(token);
    socket.emit('pingLocation', payload);
  },

  onLocationUpdate: (token: string, onUpdate: (data: { lat: number; lng: number }) => void) => {
    const socket = getTrackingSocket(token);
    socket.on('locationUpdate', onUpdate);
    return () => {
      socket.off('locationUpdate', onUpdate);
    };
  }
};
