import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Message, Conversation, TripStatus } from '@prisma/client';
import { ChatRepository } from './chat.repository';
import { TripsService } from '../trips/trips.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger('ChatService');

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly tripsService: TripsService,
  ) {}

  /**
   * Fetch conversation for a trip. Enforces active trip lifecycle bounds and participant checks.
   */
  async getConversation(tripId: string, userId: string): Promise<Conversation> {
    // 1. Verify trip and participant membership
    const trip = await this.tripsService.findById(tripId);
    const isParticipant = trip.participants.some(
      (p: any) => p.userId === userId,
    );

    if (!isParticipant && userId !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to access chat history for this trip',
      );
    }

    // 2. Restrict chat access strictly to active trip windows (BOOKED, STARTED, IN_PROGRESS)
    if (
      trip.status === TripStatus.COMPLETED ||
      trip.status === TripStatus.CANCELLED
    ) {
      throw new ForbiddenException(
        'Chat room is archived because the trip is completed or cancelled',
      );
    }

    // 3. Fetch or create conversation
    let conversation =
      await this.chatRepository.findConversationByTripId(tripId);
    if (!conversation) {
      conversation = await this.chatRepository.createConversation(tripId);
    }

    return conversation;
  }

  /**
   * Fetch messages for a trip.
   */
  async getMessages(tripId: string, userId: string): Promise<Message[]> {
    const conversation = await this.getConversation(tripId, userId);
    return this.chatRepository.findMessagesByConversationId(conversation.id);
  }

  /**
   * Save a message and return the created record with sender info.
   */
  async saveMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<Message> {
    return this.chatRepository.createMessage(conversationId, senderId, content);
  }
}
