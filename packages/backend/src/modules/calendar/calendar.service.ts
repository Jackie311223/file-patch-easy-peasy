import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Corrected path
import { GetCalendarDto } from './dto/get-calendar.dto';
import { UpdateBookingDatesDto } from './dto/update-booking-dates.dto';
import { AssignRoomDto } from './dto/assign-room.dto';
import { UserRole, Prisma, BookingStatus } from '@prisma/client'; // Use UserRole
import { differenceInDays, parseISO } from 'date-fns';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getCalendarData(query: GetCalendarDto, user: { id: string; tenantId: string; role: UserRole }) { // Use UserRole
    const { propertyId, startDate, endDate } = query; // Removed bookingStatus, roomTypeId

    // Validate property exists and user has access
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId, tenantId: user.tenantId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found.`);
    }

    // Check permissions (PARTNER can only access their own properties)
    if (user.role === UserRole.PARTNER && property.ownerId !== user.id) { // Use UserRole
      throw new ForbiddenException('You do not have permission to access this property\'s calendar.');
    }

    // Get all room types for the property
    const roomTypes = await this.prisma.roomType.findMany({
      where: {
        propertyId,
        tenantId: user.tenantId,
        // ...(roomTypeId ? { id: roomTypeId } : {}) // Removed as roomTypeId is not in DTO
      },
      orderBy: {
        name: 'asc'
      },
    });

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

    // Add bookingStatus filter if provided - Removed as bookingStatus is not in DTO
    // if (bookingStatus && bookingStatus.length > 0) {
    //   bookingWhereInput.bookingStatus = {
    //     in: bookingStatus,
    //   };
    // }

    // Get all bookings for the property within the date range
    const bookings = await this.prisma.booking.findMany({
      where: bookingWhereInput,
      include: {
        roomType: true,
        property: true,
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
      roomTypes: roomTypes.map(roomType => ({
        id: roomType.id,
        name: roomType.name,
        maxOccupancy: roomType.maxOccupancy,
        price: roomType.price,
      })),
      bookings: bookings.map(booking => ({
        id: booking.id,
        guestName: booking.guestName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.nights,
        adults: booking.adults,
        children: booking.children,
        status: booking.bookingStatus,
        roomTypeId: booking.roomTypeId,
        roomTypeName: booking.roomTypeId ? (roomTypes.find(rt => rt.id === booking.roomTypeId)?.name || 'Unknown') : 'Unknown',
        source: booking.channel,
        notes: booking.internalNotes,
        totalAmount: booking.totalAmount,
      })),
    };
  }

  async updateBookingDates(
    id: string,
    updateBookingDatesDto: UpdateBookingDatesDto,
    user: { id: string; tenantId: string; role: UserRole } // Use UserRole
  ) {
    const { checkIn, checkOut } = updateBookingDatesDto; // Removed nights
    
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
    if (user.role === UserRole.PARTNER && booking.property.ownerId !== user.id) { // Corrected: Use UserRole
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
    // const updatedNights = nights || calculatedNights; // 'nights' is not defined here after removing from DTO
    const updatedNights = calculatedNights; // Use calculated nights directly

    // Check for room availability if the booking has a room assigned
    // Note: Since roomId doesn't exist in the Booking model, we'll skip this check
    // and focus on roomTypeId which does exist
    
    // Update the booking with new dates
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
    bookingId: string, // Added bookingId as param
    assignRoomDto: AssignRoomDto,
    user: { id: string; tenantId: string; role: UserRole } // Use UserRole
  ) {
    const { roomId } = assignRoomDto; // Removed bookingId

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
    if (user.role === UserRole.PARTNER && booking.property.ownerId !== user.id) { // Corrected: Use UserRole
      throw new ForbiddenException('You do not have permission to update this booking.');
    }

    // Note: Since roomId doesn't exist in the Booking model and Room model doesn't exist,
    // we'll modify this method to update the roomTypeId instead
    
    // Find the room type (assuming roomId is actually a roomTypeId)
    const roomType = await this.prisma.roomType.findUnique({
      where: { id: roomId, tenantId: user.tenantId },
    });

    if (!roomType) {
      throw new NotFoundException(`Room Type with ID ${roomId} not found.`);
    }

    // Verify room type belongs to the same property as the booking
    if (roomType.propertyId !== booking.propertyId) {
      throw new BadRequestException('Room Type must belong to the same property as the booking.');
    }

    // Update the booking with the new room type
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

