import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Booking, Prisma, UserRole, Property, RoomType } from '@prisma/client'; // Import Property and RoomType
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { differenceInCalendarDays } from 'date-fns';
import { Decimal } from '@prisma/client/runtime/library';

// Define simplified types for included relations based on service selects
type IncludedProperty = { id: string; name: string };
type IncludedRoomType = { id: string; name: string };

// Define the type for the booking returned by most service methods
// Includes base Booking fields and simplified relations
type ServiceReturnedBooking = Omit<Booking, 'property' | 'roomType'> & {
  property: IncludedProperty;
  roomType: IncludedRoomType;
};

// Define the type for the booking returned by findOne (after sanitization)
// Similar structure, but derived from a different Prisma query initially
type FindOneReturnedBooking = Omit<Booking, 'property' | 'roomType'> & {
    property: IncludedProperty; // Property after removing sensitive fields
    roomType: IncludedRoomType;
};


@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  // Helper to safely convert string to Decimal or return null/default
  private toDecimal(value: string | number | undefined | null, defaultValue: Decimal | null = null): Decimal | null {
    if (value === undefined || value === null || value === '') return defaultValue;
    try {
      return new Decimal(value);
    } catch (e) {
      console.error(`Error converting value to Decimal: ${value}`, e);
      return defaultValue;
    }
  }

  // Calculate derived fields - takes specific required fields
  private calculateBookingFields(checkIn: string | Date, checkOut: string | Date, totalAmountStr: string, commissionStr?: string | null, amountPaidStr?: string | null, depositAmountStr?: string | null, paymentMethod?: string | null): Partial<Booking> {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
      throw new BadRequestException('Invalid check-in or check-out date.');
    }

    const nights = differenceInCalendarDays(checkOutDate, checkInDate);
    const totalAmount = this.toDecimal(totalAmountStr, new Decimal(0))!;
    const commission = this.toDecimal(commissionStr, new Decimal(0))!;
    const amountPaid = this.toDecimal(amountPaidStr, new Decimal(0))!;
    // const depositAmount = this.toDecimal(depositAmountStr, new Decimal(0))!;

    const netRevenue = totalAmount.minus(commission);
    let outstandingBalance = totalAmount.minus(amountPaid);

    // Refined outstanding balance logic (example)
    if (paymentMethod === 'OTA_COLLECT') {
        // If OTA collects, outstanding for the hotel might be netRevenue - amountPaid
        outstandingBalance = netRevenue.minus(amountPaid);
    } else {
        // If Hotel collects, outstanding is total - paid
        outstandingBalance = totalAmount.minus(amountPaid);
    }

    return {
      nights,
      netRevenue,
      outstandingBalance,
    };
  }

  // Verify tenant access
  private async verifyTenantAccess(userId: string, tenantId: string, userRole: UserRole): Promise<void> {
    if (userRole === UserRole.SUPER_ADMIN) return;
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
    if (!user || user.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied to this tenant');
    }
  }

  // Verify property access and return tenantId
  private async verifyPropertyAccess(propertyId: string, userId: string, userRole: UserRole): Promise<string> {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId }, select: { tenantId: true, userId: true } });
    if (!property) throw new NotFoundException(`Property with ID ${propertyId} not found.`);

    if (userRole === UserRole.SUPER_ADMIN) return property.tenantId;

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
    if (!user) throw new ForbiddenException('User not found.');

    if (property.tenantId !== user.tenantId) throw new ForbiddenException('Access denied to this property tenant');
    if (userRole !== UserRole.ADMIN && property.userId !== userId) throw new ForbiddenException('User does not manage this property');

    return property.tenantId;
  }

  // Verify room type access
  private async verifyRoomTypeAccess(roomTypeId: string, propertyId: string, tenantId: string): Promise<void> {
    const roomType = await this.prisma.roomType.findUnique({ where: { id: roomTypeId }, select: { propertyId: true, tenantId: true } });
    if (!roomType) throw new NotFoundException(`Room type with ID ${roomTypeId} not found.`);
    if (roomType.propertyId !== propertyId || roomType.tenantId !== tenantId) {
      throw new BadRequestException('Room type does not belong to the specified property or tenant');
    }
  }

  // Standard include clause for returning simplified relations
  private readonly includeRelations = {
    property: { select: { id: true, name: true } },
    roomType: { select: { id: true, name: true } },
  };

  async create(createBookingDto: CreateBookingDto, userId: string, userRole: UserRole, tenantId?: string): Promise<ServiceReturnedBooking> { // Added tenantId?
    // tenantId passed from controller might be redundant if logic derives it anyway, but added for signature match
    const derivedTenantId = await this.verifyPropertyAccess(createBookingDto.propertyId, userId, userRole);
    await this.verifyRoomTypeAccess(createBookingDto.roomTypeId, createBookingDto.propertyId, derivedTenantId);

    const calculatedFields = this.calculateBookingFields(
        createBookingDto.checkIn,
        createBookingDto.checkOut,
        createBookingDto.totalAmount,
        createBookingDto.commission,
        createBookingDto.amountPaid,
        createBookingDto.depositAmount,
        createBookingDto.paymentMethod
    );

    const prismaCreateData: Prisma.BookingCreateInput = {
      guestName: createBookingDto.guestName,
      contactPhone: createBookingDto.contactPhone,
      checkIn: new Date(createBookingDto.checkIn),
      checkOut: new Date(createBookingDto.checkOut),
      adults: createBookingDto.adults,
      children: createBookingDto.children,
      totalAmount: this.toDecimal(createBookingDto.totalAmount, new Decimal(0))!,
      currency: createBookingDto.currency,
      paymentMethod: createBookingDto.paymentMethod,
      paymentStatus: createBookingDto.paymentStatus,
      bookingStatus: createBookingDto.bookingStatus,
      channel: createBookingDto.channel,
      nights: calculatedFields.nights!,
      netRevenue: calculatedFields.netRevenue!,
      outstandingBalance: calculatedFields.outstandingBalance!,
      ...(createBookingDto.contactEmail && { contactEmail: createBookingDto.contactEmail }),
      ...(createBookingDto.reference && { reference: createBookingDto.reference }),
      commission: this.toDecimal(createBookingDto.commission),
      amountPaid: this.toDecimal(createBookingDto.amountPaid, new Decimal(0))!,
      depositAmount: this.toDecimal(createBookingDto.depositAmount),
      refundedAmount: this.toDecimal(createBookingDto.refundedAmount),
      ...(createBookingDto.paymentChannel && { paymentChannel: createBookingDto.paymentChannel }),
      ...(createBookingDto.invoiceUrl && { invoiceUrl: createBookingDto.invoiceUrl }),
      ...(createBookingDto.assignedStaff && { assignedStaff: createBookingDto.assignedStaff }),
      ...(createBookingDto.specialRequests && { specialRequests: createBookingDto.specialRequests }),
      ...(createBookingDto.internalNotes && { internalNotes: createBookingDto.internalNotes }),
      ...(createBookingDto.depositDate && { depositDate: new Date(createBookingDto.depositDate) }),
      ...(createBookingDto.depositMethod && { depositMethod: createBookingDto.depositMethod }),
      ...(createBookingDto.depositStatus && { depositStatus: createBookingDto.depositStatus }),
      property: { connect: { id: createBookingDto.propertyId } },
      roomType: { connect: { id: createBookingDto.roomTypeId } },
      user: { connect: { id: userId } },
      tenant: { connect: { id: tenantId } },
    };

    try {
      // Use the standard include clause
      const booking = await this.prisma.booking.create({
        data: prismaCreateData,
        include: this.includeRelations,
      });
      // The return type matches ServiceReturnedBooking due to the include clause
      return booking as ServiceReturnedBooking;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Related entity (Property, RoomType, User, or Tenant) not found.`);
      }
      console.error("Error creating booking:", error);
      throw new BadRequestException('Failed to create booking.');
    }
  }

  // Find all bookings for a specific tenant
  async findAllForTenant(tenantId: string, userId: string, userRole: UserRole): Promise<ServiceReturnedBooking[]> {
    await this.verifyTenantAccess(userId, tenantId, userRole);
    const bookings = await this.prisma.booking.findMany({
      where: { tenantId: tenantId },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return bookings as ServiceReturnedBooking[];
  }

  // Find all bookings for a specific user across all their properties
  async findAllForUser(userId: string, userRole: UserRole, tenantId?: string): Promise<ServiceReturnedBooking[]> { // Added tenantId?
    // tenantId passed from controller might be redundant if logic derives it anyway, but added for signature match
    this.prisma.user.findUnique({ where: { id: userId } }); // Example usage to avoid unused var warning if tenantId is truly optional
    let bookings: Booking[];
    if (userRole === UserRole.SUPER_ADMIN) {
      bookings = await this.prisma.booking.findMany({
        include: this.includeRelations,
        orderBy: { createdAt: 'desc' },
      });
    } else {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
        if (!user?.tenantId) throw new BadRequestException('User does not belong to any tenant');

        if (userRole === UserRole.ADMIN) {
            return this.findAllForTenant(user.tenantId, userId, userRole);
        }

        // MANAGER, STAFF, HOST
        bookings = await this.prisma.booking.findMany({
            where: {
                tenantId: user.tenantId,
                property: { userId: userId },
            },
            include: this.includeRelations,
            orderBy: { createdAt: 'desc' },
        });
    }
    return bookings as ServiceReturnedBooking[];
  }

  // Find bookings for a specific property
  async findAllByProperty(propertyId: string, userId: string, userRole: UserRole): Promise<ServiceReturnedBooking[]> {
    const tenantId = await this.verifyPropertyAccess(propertyId, userId, userRole);
    const bookings = await this.prisma.booking.findMany({
      where: { propertyId: propertyId, tenantId: tenantId },
      include: this.includeRelations,
      orderBy: { checkIn: 'asc' },
    });
    return bookings as ServiceReturnedBooking[];
  }

  // Find bookings for a specific room type
  async findAllByRoomType(roomTypeId: string, userId: string, userRole: UserRole): Promise<ServiceReturnedBooking[]> {
    const roomType = await this.prisma.roomType.findUnique({ where: { id: roomTypeId }, select: { propertyId: true, tenantId: true } });
    if (!roomType) throw new NotFoundException(`Room type with ID ${roomTypeId} not found.`);
    await this.verifyPropertyAccess(roomType.propertyId, userId, userRole); // Verifies tenant access indirectly

    const bookings = await this.prisma.booking.findMany({
      where: { roomTypeId: roomTypeId, tenantId: roomType.tenantId },
      include: this.includeRelations,
      orderBy: { checkIn: 'asc' },
    });
    return bookings as ServiceReturnedBooking[];
  }

  // Find one booking by ID
  async findOne(id: string, userId: string, userRole: UserRole, tenantId?: string): Promise<FindOneReturnedBooking | null> { // Added tenantId?
    // tenantId passed from controller might be redundant if logic derives it anyway, but added for signature match
    this.prisma.user.findUnique({ where: { id: userId } }); // Example usage to avoid unused var warning if tenantId is truly optional
    // Fetch booking with necessary fields for authorization check
    const booking = await this.prisma.booking.findUnique({
      where: { id: id },
      include: {
        property: { select: { id: true, name: true, userId: true, tenantId: true } }, // Include fields needed for auth
        roomType: { select: { id: true, name: true } }, // Standard simplified roomType
      },
    });

    if (!booking) throw new NotFoundException(`Booking with ID ${id} not found.`);

    // Authorization check
    if (userRole !== UserRole.SUPER_ADMIN) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
        if (!user || user.tenantId !== booking.property.tenantId) {
            throw new ForbiddenException('Access denied to this booking tenant');
        }
        if (userRole !== UserRole.ADMIN && booking.property.userId !== userId) {
            throw new ForbiddenException('User does not manage the property for this booking');
        }
    }

    // Construct the final return object matching FindOneReturnedBooking
    // Separate the base booking fields from the relations
    const { property, roomType, ...baseBooking } = booking;
    
    // Create the sanitized property object
    const sanitizedProperty: IncludedProperty = { 
        id: property.id, 
        name: property.name 
    };

    // Return the combined object with the correct structure
    return {
        ...baseBooking,
        property: sanitizedProperty,
        roomType: roomType, // roomType is already in the correct IncludedRoomType format
    };
  }

  async update(id: string, updateBookingDto: UpdateBookingDto, userId: string, userRole: UserRole, tenantId?: string): Promise<ServiceReturnedBooking> { // Added tenantId?
    // Verify the booking exists and the user has permission to access it initially
    // findOne now returns FindOneReturnedBooking or throws
    // Pass the potentially redundant tenantId to findOne for signature match
    const existingBooking = await this.findOne(id, userId, userRole, tenantId);
    if (!existingBooking) throw new NotFoundException(`Booking with ID ${id} not found or access denied.`); // Should not happen if findOne works

    const currentPropertyId = existingBooking.propertyId;
    const currentTenantId = existingBooking.tenantId;

    // If propertyId is being updated, verify access to the new property
    let targetTenantId = currentTenantId;
    if (updateBookingDto.propertyId && updateBookingDto.propertyId !== currentPropertyId) {
      targetTenantId = await this.verifyPropertyAccess(updateBookingDto.propertyId, userId, userRole);
      if (targetTenantId !== currentTenantId && userRole !== UserRole.SUPER_ADMIN) {
          throw new BadRequestException('Cannot move booking to a different tenant.');
      }
    }

    // If roomTypeId is being updated, verify access to the new room type within the target property/tenant
    const targetPropertyId = updateBookingDto.propertyId || currentPropertyId;
    if (updateBookingDto.roomTypeId && updateBookingDto.roomTypeId !== existingBooking.roomTypeId) {
      await this.verifyRoomTypeAccess(updateBookingDto.roomTypeId, targetPropertyId, targetTenantId);
    }

    // Recalculate fields if relevant data changes
    const checkInForCalc = updateBookingDto.checkIn || existingBooking.checkIn;
    const checkOutForCalc = updateBookingDto.checkOut || existingBooking.checkOut;
    const totalAmountForCalc = updateBookingDto.totalAmount ?? existingBooking.totalAmount.toString();
    const commissionForCalc = updateBookingDto.commission ?? existingBooking.commission?.toString();
    const amountPaidForCalc = updateBookingDto.amountPaid ?? existingBooking.amountPaid.toString();
    const depositAmountForCalc = updateBookingDto.depositAmount ?? existingBooking.depositAmount?.toString();
    const paymentMethodForCalc = updateBookingDto.paymentMethod || existingBooking.paymentMethod;

    const calculatedFields = this.calculateBookingFields(
        checkInForCalc,
        checkOutForCalc,
        totalAmountForCalc,
        commissionForCalc,
        amountPaidForCalc,
        depositAmountForCalc,
        paymentMethodForCalc
    );

    // Map DTO to Prisma Update Input
    const prismaUpdateData: Prisma.BookingUpdateInput = {
      ...(updateBookingDto.guestName && { guestName: updateBookingDto.guestName }),
      ...(updateBookingDto.contactPhone && { contactPhone: updateBookingDto.contactPhone }),
      ...(updateBookingDto.checkIn && { checkIn: new Date(updateBookingDto.checkIn) }),
      ...(updateBookingDto.checkOut && { checkOut: new Date(updateBookingDto.checkOut) }),
      ...(updateBookingDto.adults !== undefined && { adults: updateBookingDto.adults }),
      ...(updateBookingDto.children !== undefined && { children: updateBookingDto.children }),
      ...(updateBookingDto.totalAmount !== undefined && { totalAmount: this.toDecimal(updateBookingDto.totalAmount)! }),
      ...(updateBookingDto.currency && { currency: updateBookingDto.currency }),
      ...(updateBookingDto.paymentMethod && { paymentMethod: updateBookingDto.paymentMethod }),
      ...(updateBookingDto.paymentStatus && { paymentStatus: updateBookingDto.paymentStatus }),
      ...(updateBookingDto.bookingStatus && { bookingStatus: updateBookingDto.bookingStatus }),
      ...(updateBookingDto.channel && { channel: updateBookingDto.channel }),
      ...(updateBookingDto.contactEmail && { contactEmail: updateBookingDto.contactEmail }),
      ...(updateBookingDto.reference && { reference: updateBookingDto.reference }),
      ...(updateBookingDto.commission !== undefined && { commission: this.toDecimal(updateBookingDto.commission) }),
      ...(updateBookingDto.amountPaid !== undefined && { amountPaid: this.toDecimal(updateBookingDto.amountPaid)! }),
      ...(updateBookingDto.depositAmount !== undefined && { depositAmount: this.toDecimal(updateBookingDto.depositAmount) }),
      ...(updateBookingDto.refundedAmount !== undefined && { refundedAmount: this.toDecimal(updateBookingDto.refundedAmount) }),
      ...(updateBookingDto.paymentChannel && { paymentChannel: updateBookingDto.paymentChannel }),
      ...(updateBookingDto.invoiceUrl && { invoiceUrl: updateBookingDto.invoiceUrl }),
      ...(updateBookingDto.assignedStaff && { assignedStaff: updateBookingDto.assignedStaff }),
      ...(updateBookingDto.specialRequests && { specialRequests: updateBookingDto.specialRequests }),
      ...(updateBookingDto.internalNotes && { internalNotes: updateBookingDto.internalNotes }),
      ...(updateBookingDto.depositDate && { depositDate: new Date(updateBookingDto.depositDate) }),
      ...(updateBookingDto.depositMethod && { depositMethod: updateBookingDto.depositMethod }),
      ...(updateBookingDto.depositStatus && { depositStatus: updateBookingDto.depositStatus }),
      // Update relations if provided
      ...(updateBookingDto.propertyId && { property: { connect: { id: updateBookingDto.propertyId } } }),
      ...(updateBookingDto.roomTypeId && { roomType: { connect: { id: updateBookingDto.roomTypeId } } }),
      // Update calculated fields
      nights: calculatedFields.nights,
      netRevenue: calculatedFields.netRevenue,
      outstandingBalance: calculatedFields.outstandingBalance,
    };

    try {
      const updatedBooking = await this.prisma.booking.update({
        where: { id: id },
        data: prismaUpdateData,
        include: this.includeRelations, // Use standard include
      });
      return updatedBooking as ServiceReturnedBooking;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Booking with ID ${id} or related entity not found.`);
      }
      console.error("Error updating booking:", error);
      throw new BadRequestException('Failed to update booking.');
    }
  }

  async remove(id: string, userId: string, userRole: UserRole, tenantId?: string): Promise<ServiceReturnedBooking> { // Added tenantId?
    // Verify access first using findOne, pass tenantId for signature match
    await this.findOne(id, userId, userRole, tenantId);

    try {
      // Prisma delete returns the deleted object, but relations might not be included by default
      // To ensure consistency, we fetch it again with includes before deleting, or just return the result of findOne
      // However, the standard practice is often just to delete and maybe return the ID or a confirmation.
      // For consistency with other methods returning ServiceReturnedBooking, we fetch before delete.
      // Note: This has a race condition risk. A safer way is transaction or just returning the deleted object from delete.
      
      // Fetch with includes before deleting to match return type
      const bookingToDelete = await this.prisma.booking.findUnique({
          where: { id },
          include: this.includeRelations,
      });
      if (!bookingToDelete) throw new NotFoundException(`Booking with ID ${id} not found.`); // Should be caught by findOne already

      await this.prisma.booking.delete({ where: { id: id } });
      
      return bookingToDelete as ServiceReturnedBooking;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Booking with ID ${id} not found.`);
      }
      console.error("Error removing booking:", error);
      throw new BadRequestException('Failed to remove booking.');
    }
  }
}

