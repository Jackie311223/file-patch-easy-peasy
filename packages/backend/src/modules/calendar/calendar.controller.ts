import { Controller, Get, Query, Param, Patch, Body, UseGuards, Post } from '@nestjs/common'; // Added Post
import { CalendarService } from './calendar.service';
import { GetCalendarDto } from './dto/get-calendar.dto';
import { UpdateBookingDatesDto } from './dto/update-booking-dates.dto';
import { AssignRoomDto } from './dto/assign-room.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard'; // Corrected path
import { RolesGuard } from '../../core/auth/guards/roles.guard'; // Corrected path
import { Roles } from '../../core/auth/decorators/roles.decorator'; // Corrected path
import { UserRole } from '@prisma/client'; // Use UserRole
import { GetUser } from '../../core/auth/decorators/get-user.decorator'; // Corrected path

@Controller('calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER, UserRole.STAFF) // Use UserRole
  async getCalendarData(@Query() query: GetCalendarDto, @GetUser() user: { id: string; tenantId: string; role: UserRole }) { // Use GetUser decorator
    return this.calendarService.getCalendarData(query, user);
  }

  @Patch('bookings/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER) // Use UserRole
  async updateBookingDates(
    @Param('id') id: string,
    @Body() updateBookingDatesDto: UpdateBookingDatesDto,
    @GetUser() user: { id: string; tenantId: string; role: UserRole } // Use GetUser decorator
  ) {
    return this.calendarService.updateBookingDates(id, updateBookingDatesDto, user);
  }

  @Post('bookings/:bookingId/assign-room') // Corrected route to include bookingId
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER) // Use UserRole
  async assignRoom(
    @Param('bookingId') bookingId: string, // Added bookingId param
    @Body() assignRoomDto: AssignRoomDto,
    @GetUser() user: { id: string; tenantId: string; role: UserRole } // Use GetUser decorator
  ) {
    return this.calendarService.assignRoom(bookingId, assignRoomDto, user); // Pass bookingId
  }
}

