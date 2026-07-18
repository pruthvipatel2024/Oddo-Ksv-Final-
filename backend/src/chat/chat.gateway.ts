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
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('ChatGateway');

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
  ) {}

  /**
   * Authenticate connecting clients via JWT.
   */
  async handleConnection(client: Socket) {
    try {
      const authHeader =
        client.handshake.headers.authorization || client.handshake.auth?.token;
      if (!authHeader) {
        this.logger.warn(
          `Chat client unauthenticated: disconnecting ${client.id}`,
        );
        client.disconnect(true);
        return;
      }

      const token = authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authHeader;
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      client.data.user = payload;
      this.logger.log(
        `Chat client connected: ${client.id} (User: ${payload.email})`,
      );
    } catch (err) {
      this.logger.warn(
        `Chat authentication failed for client ${client.id}: ${err.message}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Chat client disconnected: ${client.id}`);
  }

  /**
   * Connect users to a conversation room. Enforces membership scope.
   */
  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() data: { tripId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) {
      client.emit('error', 'Unauthorized');
      return;
    }

    try {
      // 1. Fetch conversation and verify participant permissions
      const conversation = await this.chatService.getConversation(
        data.tripId,
        user.sub,
      );

      const roomName = `conversation:${conversation.id}`;
      await client.join(roomName);

      this.logger.log(`User ${user.email} joined chat room: ${roomName}`);
      client.emit('joinedConversation', { conversationId: conversation.id });
    } catch (err) {
      client.emit('error', `Failed to join conversation: ${err.message}`);
    }
  }

  /**
   * Broadcast message to room and persist in DB.
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { conversationId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) {
      client.emit('error', 'Unauthorized');
      return;
    }

    try {
      // Save message in database
      const message = await this.chatService.saveMessage(
        data.conversationId,
        user.sub,
        data.content,
      );

      // Broadcast to room
      const roomName = `conversation:${data.conversationId}`;
      this.server.to(roomName).emit('newMessage', message);
    } catch (err) {
      client.emit('error', `Failed to send message: ${err.message}`);
    }
  }

  /**
   * Typing indicators broadcast.
   */
  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) return;

    const roomName = `conversation:${data.conversationId}`;
    client.to(roomName).emit('userTyping', {
      userId: user.sub,
      email: user.email,
      isTyping: data.isTyping,
    });
  }
}
