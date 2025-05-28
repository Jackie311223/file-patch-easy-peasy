import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common'; // Added Req
import { BookingsService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard'; // Assuming guard is used globally or here

@Controller('bookings')
@UseGuards(JwtAuthGuard) // Apply guard to ensure req.user exists
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER, UserRole.STAFF)
  findAll(@Req() req) { // Added @Req() req
    // Pass user context from request to service
    return this.bookingsService.findAll(req.user);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER, UserRole.STAFF)
  findOne(@Param('id') id: string, @Req() req) { // Added @Req() req
    // Pass id and user context from request to service
    return this.bookingsService.findOne(id, req.user);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER)
  create(@Body() createBookingDto: CreateBookingDto, @Req() req) { // Added @Req() req
    // Pass DTO and user context from request to service
    return this.bookingsService.create(createBookingDto, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER)
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto, @Req() req) { // Added @Req() req
    // Pass id, DTO, and user context from request to service
    return this.bookingsService.update(id, updateBookingDto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER)
  remove(@Param('id') id: string, @Req() req) { // Added @Req() req
    // Pass id and user context from request to service
    return this.bookingsService.remove(id, req.user);
  }
}

