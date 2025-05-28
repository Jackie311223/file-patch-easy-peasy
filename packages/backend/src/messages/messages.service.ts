import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { Prisma, UserRole, MessageType } from '@prisma/client'; // Import UserRole, MessageType and Prisma types

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto, userId: string, tenantId: string) {
    const { recipientId, messageType, content } = createMessageDto;

    // For SYSTEM messages, recipientId should be null
    // For PRIVATE messages, recipientId is required
    if (messageType === 'PRIVATE' && !recipientId) {
      throw new Error('Recipient is required for private messages');
    }

    // If PRIVATE, verify recipient exists and belongs to the same tenant
    if (messageType === 'PRIVATE' && recipientId) {
      const recipient = await this.prisma.user.findUnique({
        where: { id: recipientId },
      });

      if (!recipient) {
        throw new Error('Recipient not found');
      }

      if (recipient.tenantId !== tenantId) {
        throw new Error('Cannot send messages to users from different tenants');
      }
    }

    return this.prisma.message.create({
      data: {
        messageType,
        content,
        senderId: userId,
        recipientId: messageType === 'PRIVATE' ? recipientId : null,
        tenantId,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Modified findAll to accept userRole and handle SUPER_ADMIN case
  async findAll(query: QueryMessagesDto, userId: string, tenantId: string, userRole: UserRole) {
    const { type, isRead, limit = 20, offset = 0 } = query;

    // Build where clause
    const where: Prisma.MessageWhereInput = {}; // Use Prisma type

    if (userRole !== UserRole.SUPER_ADMIN) {
      // Apply tenant filter and OR condition for non-superadmins
      where.tenantId = tenantId;
      where.OR = [
        { messageType: 'SYSTEM', recipientId: null }, // System messages for their tenant
        { messageType: 'PRIVATE', recipientId: userId }, // Private messages for them
      ];
    } else {
      // SUPER_ADMIN can see all messages, potentially filtered by type/read status
      // No tenant filter, no OR condition based on recipientId
    }

    // Add type filter if provided
    if (type) {
      // FIX: Cast the validated string type to the MessageType enum
      where.messageType = type as MessageType;
    }

    // Add isRead filter if provided
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    // Get total count for pagination
    const total = await this.prisma.message.count({ where });

    // Get messages
    const data = await this.prisma.message.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      data,
      total,
    };
  }

  async markAsRead(id: string, userId: string, tenantId: string) {
    // Find the message
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    // Check if user has access to this message
    // SUPER_ADMIN should bypass this check if they need to mark any message as read
    // For now, assuming only users within the tenant can mark as read
    if (message.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied to this message tenant');
    }

    // For PRIVATE messages, only the recipient can mark as read
    if (message.messageType === 'PRIVATE' && message.recipientId !== userId) {
      throw new ForbiddenException('Only the recipient can mark this private message as read');
    }

    // Update the message
    return this.prisma.message.update({
      where: { id },
      data: { isRead: true },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}

