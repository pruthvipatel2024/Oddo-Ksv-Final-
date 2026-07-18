import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger, UseFilters } from '@nestjs/common';
import { TripStatus } from '@prisma/client';
import { RedisService } from '../database/redis.service';
import { TripsService } from '../trips/trips.service';
import { PrismaService } from '../database/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'tracking',
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('TrackingGateway');

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly tripsService: TripsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Authenticate and register user socket connections.
   */
  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization || client.handshake.auth?.token;
      if (!authHeader) {
        this.logger.warn(`Disconnecting unauthenticated client: ${client.id}`);
        client.disconnect(true);
        return;
      }

      const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      // Save user payload context on socket
      client.data.user = payload;
      this.logger.log(`Client authenticated: ${client.id} (User: ${payload.email})`);
    } catch (err) {
      this.logger.warn(`Authentication failed for client ${client.id}: ${err.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Joining a trip-scoped tracking room.
   */
  @SubscribeMessage('joinTrip')
  async handleJoinTrip(
    @MessageBody() data: { tripId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) {
      client.emit('error', 'Unauthorized');
      return;
    }

    try {
      // 1. Fetch trip and check if the user is a registered participant of this trip
      const trip = await this.tripsService.findById(data.tripId, user.organizationId || undefined);
      
      const isParticipant = trip.participants.some((p: any) => p.userId === user.sub);
      if (!isParticipant && user.role !== 'SUPER_ADMIN') {
        client.emit('error', 'You are not a participant of this trip');
        return;
      }

      // 2. Join the Socket.io room
      const roomName = `trip:${data.tripId}`;
      await client.join(roomName);
      this.logger.log(`User ${user.email} joined tracking room: ${roomName}`);
      
      client.emit('joinedRoom', { room: roomName });

      // 3. Emit last cached location from Redis if available
      const lastLoc = await this.redisService.get(`trip:${data.tripId}:location`);
      if (lastLoc) {
        client.emit('locationUpdate', JSON.parse(lastLoc));
      }
    } catch (err) {
      client.emit('error', `Failed to join tracking room: ${err.message}`);
    }
  }

  /**
   * Driver GPS coordinates ping receiver.
   */
  @SubscribeMessage('pingLocation')
  async handlePingLocation(
    @MessageBody()
    data: {
      tripId: string;
      lat: number;
      lng: number;
      heading?: number;
      speed?: number;
      accuracy?: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) {
      client.emit('error', 'Unauthorized');
      return;
    }

    try {
      // 1. Validate that the trip exists
      const trip = await this.tripsService.findById(data.tripId, user.organizationId || undefined);

      // 2. Only the assigned driver is allowed to publish location pings
      if (trip.ride.driverId !== user.sub) {
        client.emit('error', 'Only the driver can publish location updates');
        return;
      }

      // 3. Updates are only broadcasted while trip is active (STARTED or IN_PROGRESS)
      if (trip.status !== TripStatus.STARTED && trip.status !== TripStatus.IN_PROGRESS) {
        client.emit('error', 'Trip is not active. Location pings rejected.');
        return;
      }

      const locationPayload = {
        tripId: data.tripId,
        lat: data.lat,
        lng: data.lng,
        heading: data.heading || null,
        speed: data.speed || null,
        accuracy: data.accuracy || null,
        timestamp: new Date().toISOString(),
      };

      // 4. Cache current location in Redis (highly efficient retrieval)
      const roomName = `trip:${data.tripId}`;
      await this.redisService.set(`${roomName}:location`, JSON.stringify(locationPayload));

      // 5. Broadcast to all subscribed passengers in the room
      this.server.to(roomName).emit('locationUpdate', locationPayload);

      // 6. Decimate updates into PostgreSQL history writer (every 30 seconds)
      const lastWriteKey = `${roomName}:last_db_write`;
      const lastWriteTime = await this.redisService.get(lastWriteKey);
      const now = Date.now();

      if (!lastWriteTime || now - Number(lastWriteTime) >= 30000) {
        await this.prisma.tripLocationHistory.create({
          data: {
            tripId: data.tripId,
            lat: data.lat,
            lng: data.lng,
            heading: data.heading || null,
            speed: data.speed || null,
            accuracy: data.accuracy || null,
          },
        });
        await this.redisService.set(lastWriteKey, String(now));
      }
    } catch (err) {
      client.emit('error', `Location update processing failed: ${err.message}`);
    }
  }
}
