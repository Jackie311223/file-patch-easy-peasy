import { Request } from 'express';
import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { GetCalendarDto } from './dto/get-calendar.dto';
import { UpdateBookingDatesDto } from './dto/update-booking-dates.dto';
import { AssignRoomDto } from './dto/assign-room.dto';
import { createUserContext } from '../types/user.interface';

@Controller('calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PARTNER, UserRole.MANAGER, UserRole.STAFF)
  async getCalendarData(@Query() query: GetCalendarDto, @Req() req: Request) {
    const user = req.user;
    // Convert User to expected format with required properties
    const userContext = createUserContext(user);
    return this.calendarService.getCalendarData(query, userContext);
  }

  @Patch('bookings/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PARTNER, UserRole.MANAGER)
  async updateBookingDates(
    @Param('id') id: string,
    @Body() updateBookingDatesDto: UpdateBookingDatesDto,
    @Req() req: Request
  ) {
    const user = req.user;
    // Convert User to expected format with required properties
    const userContext = createUserContext(user);
    return this.calendarService.updateBookingDates(id, updateBookingDatesDto, userContext);
  }

  @Post('bookings/assign-room')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PARTNER, UserRole.MANAGER)
  async assignRoom(@Body() assignRoomDto: AssignRoomDto, @Req() req: Request) {
    const user = req.user;
    // Convert User to expected format with required properties
    const userContext = createUserContext(user);
    return this.calendarService.assignRoom(assignRoomDto, userContext);
  }
}
