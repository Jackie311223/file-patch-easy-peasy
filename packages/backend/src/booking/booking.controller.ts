import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Logger, UnauthorizedException } from '@nestjs/common'; // Added UnauthorizedException
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Roles } from '../core/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { GetUser } from '../core/auth/decorators/get-user.decorator';
import { User } from '../types/user.interface';
import { JwtAuthGuard } from '../core/auth/guards/jwt-auth.guard'; // Added JwtAuthGuard
import { RolesGuard } from '../core/auth/guards/roles.guard'; // Added RolesGuard

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards at controller level
export class BookingsController {
  private readonly logger = new Logger(BookingsController.name); // Added logger instance

  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER, UserRole.STAFF)
  findAll(@GetUser() user: User) {
    this.logger.log(`findAll called by user: ${JSON.stringify(user)}`); // Added logging
    if (!user) {
      this.logger.error('User object is undefined in findAll! Throwing UnauthorizedException.');
      throw new UnauthorizedException('User context missing'); // Added explicit guard clause
    }
    return this.bookingService.findAllForUser(user.id, user.role, user.tenantId); // Removed optional chaining as user is guaranteed
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER, UserRole.STAFF)
  findOne(@Param('id') id: string, @GetUser() user: User) {
    this.logger.log(`findOne called for id ${id} by user: ${JSON.stringify(user)}`); // Added logging
    if (!user) {
      this.logger.error('User object is undefined in findOne! Throwing UnauthorizedException.');
      throw new UnauthorizedException('User context missing'); // Added explicit guard clause
    }
    return this.bookingService.findOne(id, user.id, user.role, user.tenantId); // Removed optional chaining
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER)
  create(@Body() createBookingDto: CreateBookingDto, @GetUser() user: User) {
    this.logger.log(`create called by user: ${JSON.stringify(user)} with DTO: ${JSON.stringify(createBookingDto)}`); // Added logging
     if (!user) {
      this.logger.error('User object is undefined in create! Throwing UnauthorizedException.');
      throw new UnauthorizedException('User context missing'); // Added explicit guard clause
    }
    return this.bookingService.create(createBookingDto, user.id, user.role, user.tenantId); // Removed optional chaining
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER)
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto, @GetUser() user: User) {
    this.logger.log(`update called for id ${id} by user: ${JSON.stringify(user)} with DTO: ${JSON.stringify(updateBookingDto)}`); // Added logging
     if (!user) {
      this.logger.error('User object is undefined in update! Throwing UnauthorizedException.');
      throw new UnauthorizedException('User context missing'); // Added explicit guard clause
    }
    return this.bookingService.update(id, updateBookingDto, user.id, user.role, user.tenantId); // Removed optional chaining
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER)
  remove(@Param('id') id: string, @GetUser() user: User) {
    this.logger.log(`remove called for id ${id} by user: ${JSON.stringify(user)}`); // Added logging
     if (!user) {
      this.logger.error('User object is undefined in remove! Throwing UnauthorizedException.');
      throw new UnauthorizedException('User context missing'); // Added explicit guard clause
    }
    return this.bookingService.remove(id, user.id, user.role, user.tenantId); // Removed optional chaining
  }
}
