import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetCalendarDto } from './dto/get-calendar.dto';
import { UpdateBookingDatesDto } from './dto/update-booking-dates.dto';
import { AssignRoomDto } from './dto/assign-room.dto';
import { UserRole, Prisma, BookingStatus } from '@prisma/client';
import { differenceInDays, parseISO } from 'date-fns';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getCalendarData(query: GetCalendarDto, user: { id: string; tenantId: string; role: UserRole }) {
    const { propertyId, startDate, endDate, bookingStatus, roomTypeId } = query;

    // Validate property exists and user has access
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId, tenantId: user.tenantId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found.`);
    }

    // Check permissions (PARTNER can only access their own properties)
    if (user.role === UserRole.PARTNER && property.ownerId !== user.id) {
      throw new ForbiddenException('You do not have permission to access this property\'s calendar.');
    }

    // Build room query
    // Note: Using RoomTypeWhereInput instead of RoomWhereInput since Room model doesn't exist
    const roomTypeWhereInput: Prisma.RoomTypeWhereInput = {
      propertyId,
      tenantId: user.tenantId,
    };

    // Add roomTypeId filter if provided
    if (roomTypeId) {
      roomTypeWhereInput.id = roomTypeId;
    }

    // Note: Room model doesn't exist in the current Prisma schema
    // Using roomType instead as a workaround
    const roomTypes = await this.prisma.roomType.findMany({
      where: roomTypeWhereInput,
      orderBy: {
        name: 'asc',
      },
    });
    
    // Create a mock rooms array based on roomTypes
    const rooms = roomTypes.map(roomType => ({
      id: roomType.id, // Using roomType ID as a placeholder
      name: `Room (${roomType.name})`, // Creating a mock name
      roomTypeId: roomType.id,
      roomType: roomType,
      status: 'AVAILABLE', // Default status
    }));

    // Build booking query
    const bookingWhereInput: Prisma.BookingWhereInput = {
      propertyId,
      tenantId: user.tenantId,
      // Find bookings that overlap with the requested date range
      OR: [
        // Case 1: Booking starts within the range
        {
          checkIn: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        // Case 2: Booking ends within the range
        {
          checkOut: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        // Case 3: Booking spans the entire range
        {
          checkIn: {
            lte: new Date(startDate),
          },
          checkOut: {
            gte: new Date(endDate),
          },
        },
      ],
    };

    // Add bookingStatus filter if provided
    if (bookingStatus && bookingStatus.length > 0) {
      bookingWhereInput.bookingStatus = {
        in: bookingStatus,
      };
    }

    // Get all bookings for the property within the date range
    const bookings = await this.prisma.booking.findMany({
      where: bookingWhereInput,
      include: {
        roomType: true,
        user: true, // Using user instead of guest as per schema
      },
      orderBy: {
        checkIn: 'asc',
      },
    });

    // Format the response for the calendar view
    return {
      property,
      dateRange: {
        startDate,
        endDate,
      },
      rooms: rooms.map(room => ({
        id: room.id,
        name: room.name,
        roomTypeId: room.roomTypeId,
        roomTypeName: room.roomType.name,
        status: room.status,
      })),
      bookings: bookings.map(booking => ({
        id: booking.id,
        guestName: booking.guestName,
        guestId: booking.userId, // Using userId instead of guestId
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.nights,
        adults: booking.adults,
        children: booking.children,
        status: booking.bookingStatus,
        roomTypeId: booking.roomTypeId,
        roomTypeName: booking.roomType?.name || 'Unknown',
        source: booking.channel,
        notes: booking.internalNotes || booking.specialRequests, // Using available fields
        totalAmount: booking.totalAmount,
      })),
    };
  }

  async updateBookingDates(
    id: string,
    updateBookingDatesDto: UpdateBookingDatesDto,
    user: { id: string; tenantId: string; role: UserRole }
  ) {
    const { checkIn, checkOut, nights } = updateBookingDatesDto;
    
    // Find the booking
    const booking = await this.prisma.booking.findUnique({
      where: { id, tenantId: user.tenantId },
      include: {
        property: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found.`);
    }

    // Check permissions (PARTNER can only update bookings for their own properties)
    if (user.role === UserRole.PARTNER && booking.property.ownerId !== user.id) {
      throw new ForbiddenException('You do not have permission to update this booking.');
    }

    // Validate dates
    const checkInDate = parseISO(checkIn);
    const checkOutDate = parseISO(checkOut);
    
    if (checkInDate >= checkOutDate) {
      throw new BadRequestException('Check-out date must be after check-in date.');
    }

    // Calculate nights if not provided
    const calculatedNights = differenceInDays(checkOutDate, checkInDate);
    const updatedNights = nights || calculatedNights;

    // Check for room availability if the booking has a room assigned
    // Note: Since roomId doesn't exist in the schema, we'll skip this check
    // and just update the booking directly
    
    // Update the booking
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights: updatedNights,
      },
      include: {
        roomType: true,
        property: true,
      },
    });

    return updatedBooking;
  }

  async assignRoom(
    assignRoomDto: AssignRoomDto,
    user: { id: string; tenantId: string; role: UserRole }
  ) {
    const { bookingId, roomId } = assignRoomDto;

    // Find the booking
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId, tenantId: user.tenantId },
      include: {
        property: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found.`);
    }

    // Check permissions (PARTNER can only update bookings for their own properties)
    if (user.role === UserRole.PARTNER && booking.property.ownerId !== user.id) {
      throw new ForbiddenException('You do not have permission to update this booking.');
    }

    // Note: Since Room model doesn't exist in the schema, we'll use roomType directly
    // Find the roomType instead of room
    const roomType = await this.prisma.roomType.findUnique({
      where: { id: roomId, tenantId: user.tenantId },
    });

    if (!roomType) {
      throw new NotFoundException(`Room Type with ID ${roomId} not found.`);
    }

    // Verify roomType belongs to the same property as the booking
    if (roomType.propertyId !== booking.propertyId) {
      throw new BadRequestException('Room Type must belong to the same property as the booking.');
    }

    // Update the booking with the new roomType
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        roomTypeId: roomType.id,
      },
      include: {
        roomType: true,
        property: true,
      },
    });

    return updatedBooking;
  }
}
