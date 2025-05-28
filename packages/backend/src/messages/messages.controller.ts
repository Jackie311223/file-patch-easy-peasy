import { Controller, Get, Post, Body, Patch, Param, UseGuards, Logger, Query, UnauthorizedException } from '@nestjs/common'; // Added UnauthorizedException
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { Roles } from '../core/auth/decorators/roles.decorator'; // Corrected path
import { UserRole } from '@prisma/client';
// import { Public } from '../auth/decorators/public.decorator'; // Removed if not used
import { GetUser } from '../core/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../core/auth/guards/jwt-auth.guard'; // Added JwtAuthGuard
import { RolesGuard } from '../core/auth/guards/roles.guard'; // Added RolesGuard
import { User } from '../types/user.interface'; // Use User interface

@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards at controller level
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name); // Added logger instance

  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER)
  create(
    @Body() createMessageDto: CreateMessageDto,
    @GetUser() user: User // Use User interface
  ) {
    this.logger.log(`create called by user: ${JSON.stringify(user)} with DTO: ${JSON.stringify(createMessageDto)}`); // Added logging
    if (!user) {
      this.logger.error('User object is undefined in create! Throwing UnauthorizedException.');
      throw new UnauthorizedException('User context missing'); // Added explicit guard clause
    }
    // Pass tenantId from user object
    return this.messagesService.create(createMessageDto, user.id, user.tenantId);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER, UserRole.STAFF)
  findAll(
    @Query() query: QueryMessagesDto,
    @GetUser() user: User // Use User interface
  ) {
    this.logger.log(`findAll called by user: ${JSON.stringify(user)} with query: ${JSON.stringify(query)}`); // Added logging
    if (!user) {
      this.logger.error('User object is undefined in findAll! Throwing UnauthorizedException.');
      throw new UnauthorizedException('User context missing'); // Added explicit guard clause
    }
    // Pass tenantId and userRole from user object
    // FIX: Added user.role as the fourth argument
    return this.messagesService.findAll(query, user.id, user.tenantId, user.role);
  }

  @Patch(':id/read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER, UserRole.STAFF)
  markAsRead(
    @Param('id') id: string,
    @GetUser() user: User // Use User interface
  ) {
    this.logger.log(`markAsRead called for id ${id} by user: ${JSON.stringify(user)}`); // Added logging
    if (!user) {
      this.logger.error('User object is undefined in markAsRead! Throwing UnauthorizedException.');
      throw new UnauthorizedException('User context missing'); // Added explicit guard clause
    }
    // Pass tenantId from user object
    return this.messagesService.markAsRead(id, user.id, user.tenantId);
  }
}

