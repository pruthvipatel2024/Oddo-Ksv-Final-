import { Injectable } from '@nestjs/common';
import { Message, Conversation } from '@prisma/client';
import { BaseRepository } from '../database/base.repository';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ChatRepository extends BaseRepository<Message> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.message);
  }

  /**
   * Find a conversation associated with a specific trip.
   */
  async findConversationByTripId(tripId: string): Promise<Conversation | null> {
    return this.prisma.conversation.findUnique({
      where: { tripId },
    });
  }

  /**
   * Find message history for a specific conversation, ordered chronologically.
   */
  async findMessagesByConversationId(
    conversationId: string,
  ): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Create a new message in database.
   */
  async createMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<Message> {
    return this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        read: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Create a new conversation for a trip.
   */
  async createConversation(tripId: string): Promise<Conversation> {
    return this.prisma.conversation.create({
      data: { tripId },
    });
  }
}
