import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Prisma, UserRole } from '@prisma/client';
import { differenceInCalendarDays } from 'date-fns'; // Need to install date-fns

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  // Helper to calculate nights
  private calculateNights(checkIn: string | Date, checkOut: string | Date): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return differenceInCalendarDays(end, start);
  }

  // Helper to calculate outstanding balance
  private calculateOutstandingBalance(totalAmount: string | number | Prisma.Decimal, amountPaid: string | number | Prisma.Decimal): Prisma.Decimal {
    const total = typeof totalAmount === 'object' ? totalAmount : new Prisma.Decimal(totalAmount.toString());
    const paid = typeof amountPaid === 'object' ? amountPaid : new Prisma.Decimal(amountPaid.toString());
    return total.minus(paid);
  }

  async create(createDto: CreateBookingDto, user: { id: string; tenantId: string; role: UserRole }) {
    const nights = this.calculateNights(createDto.checkIn, createDto.checkOut);
    const outstandingBalance = this.calculateOutstandingBalance(createDto.totalAmount, createDto.amountPaid || '0');

    // Ensure property belongs to the user's tenant
    const property = await this.prisma.property.findFirst({
        where: { id: createDto.propertyId, tenantId: user.tenantId }
    });
    if (!property) {
        throw new NotFoundException(`Property with ID ${createDto.propertyId} not found in your tenant.`);
    }
    // Ensure room type belongs to the user's tenant
    const roomType = await this.prisma.roomType.findFirst({
        where: { id: createDto.roomTypeId, tenantId: user.tenantId }
    });
    if (!roomType) {
        throw new NotFoundException(`RoomType with ID ${createDto.roomTypeId} not found in your tenant.`);
    }

    // Extract propertyId and roomTypeId from createDto to use with connect
    const { propertyId, roomTypeId, ...restOfCreateDto } = createDto;
    
    // Calculate netRevenue (required field in schema)
    const totalAmount = new Prisma.Decimal(createDto.totalAmount);
    const commission = createDto.commission 
      ? new Prisma.Decimal(createDto.commission) 
      : new Prisma.Decimal(0);
    const netRevenue = totalAmount.minus(commission);
    
    return this.prisma.booking.create({
      data: {
        ...restOfCreateDto,
        nights,
        outstandingBalance,
        totalAmount,
        commission: createDto.commission ? commission : undefined,
        amountPaid: createDto.amountPaid ? new Prisma.Decimal(createDto.amountPaid) : new Prisma.Decimal(0),
        netRevenue, // Add required netRevenue field
        // Ensure dates are Date objects if needed by Prisma
        checkIn: new Date(createDto.checkIn),
        checkOut: new Date(createDto.checkOut),
        // Connect all relations properly
        property: {
          connect: { id: propertyId }
        },
        roomType: {
          connect: { id: roomTypeId }
        },
        user: {
          connect: { id: user.id }
        },
        tenant: {
          connect: { id: user.tenantId }
        }
      },
    });
  }

  async findAll(user: { id: string; tenantId: string; role: UserRole }) {
    // Filter by tenant for non-super admins
    const whereClause: Prisma.BookingWhereInput = {};
    if (user.role !== UserRole.SUPER_ADMIN) {
      whereClause.tenantId = user.tenantId;
    }
    return this.prisma.booking.findMany({ where: whereClause });
  }

  async findOne(id: string, user: { id: string; tenantId: string; role: UserRole }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Check tenant access for non-super admins
    if (user.role !== UserRole.SUPER_ADMIN && booking.tenantId !== user.tenantId) {
      throw new ForbiddenException('You do not have permission to access this booking.');
    }

    return booking;
  }

  async update(id: string, updateDto: UpdateBookingDto, user: { id: string; tenantId: string; role: UserRole }) {
    // First, find the booking to ensure it exists and check permissions
    const existingBooking = await this.findOne(id, user); // Use findOne for permission check

    let nights = existingBooking.nights;
    let outstandingBalance = existingBooking.outstandingBalance;
    let totalAmount = existingBooking.totalAmount;
    let amountPaid = existingBooking.amountPaid;

    // Recalculate nights if dates change
    if (updateDto.checkIn || updateDto.checkOut) {
      const checkIn = updateDto.checkIn ? new Date(updateDto.checkIn) : existingBooking.checkIn;
      const checkOut = updateDto.checkOut ? new Date(updateDto.checkOut) : existingBooking.checkOut;
      nights = this.calculateNights(checkIn, checkOut);
    }

    // Recalculate balance if amounts change
    if (updateDto.totalAmount !== undefined || updateDto.amountPaid !== undefined) {
        totalAmount = updateDto.totalAmount !== undefined ? new Prisma.Decimal(updateDto.totalAmount) : existingBooking.totalAmount;
        amountPaid = updateDto.amountPaid !== undefined ? new Prisma.Decimal(updateDto.amountPaid) : existingBooking.amountPaid;
        outstandingBalance = this.calculateOutstandingBalance(totalAmount, amountPaid);
    }

    // Extract propertyId and roomTypeId if they exist in updateDto
    const { ...restOfUpdateDto } = updateDto; // Removed propertyId, roomTypeId from destructuring
    
    // Prepare data object for update
    const updateData: any = {
      ...restOfUpdateDto,
      // Update calculated fields
      nights,
      outstandingBalance,
      // Ensure numeric types are correct
      totalAmount: updateDto.totalAmount !== undefined ? new Prisma.Decimal(updateDto.totalAmount) : undefined,
      // commission: updateDto.commission !== undefined ? new Prisma.Decimal(updateDto.commission) : undefined, // Commission field removed from UpdateBookingDto
      amountPaid: updateDto.amountPaid !== undefined ? new Prisma.Decimal(updateDto.amountPaid) : undefined,
      // Ensure dates are Date objects if provided
      checkIn: updateDto.checkIn ? new Date(updateDto.checkIn) : undefined,
      checkOut: updateDto.checkOut ? new Date(updateDto.checkOut) : undefined,
    };
    
    // Add property relation if propertyId is provided
    if (updateDto.propertyId) { // Check if propertyId exists in the DTO
      updateData.property = {
        connect: { id: updateDto.propertyId } // Connect using the ID from DTO
      };
    }

    // Conditionally connect roomType if roomTypeId is provided
    if (updateDto.roomTypeId) { // Check if roomTypeId exists in the DTO
      updateData.roomType = {
        connect: { id: updateDto.roomTypeId } // Connect using the ID from DTO
      };
    }   
    // Note: We don't update user or tenant relations in update method
    // as these fields are not part of UpdateBookingDto

    return this.prisma.booking.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, user: { id: string; tenantId: string; role: UserRole }) {
    // First, find the booking to ensure it exists and check permissions
    await this.findOne(id, user); // Use findOne for permission check

    return this.prisma.booking.delete({
      where: { id },
    });
  }
}

