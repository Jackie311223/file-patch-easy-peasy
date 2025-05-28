import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Corrected path
import { CreatePaymentDto } from './dto/create-payment.dto'; // Path should be correct now
import { UpdatePaymentDto } from './dto/update-payment.dto'; // Path should be correct now
import { Payment, PaymentType, PaymentMethodV2, PaymentStatusV2, UserRole, Prisma } from '@prisma/client'; // Use UserRole

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto, user: { id: string; tenantId: string; role: UserRole }): Promise<Payment> { // Use UserRole
    const { bookingId, paymentType, method, collectedById, receivedFrom, paymentDate, ...rest } = createPaymentDto;

    // 1. Validate Booking exists and belongs to the user's tenant
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId, tenantId: user.tenantId },
      include: { property: true }, // Include property to check ownerId later
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found in your tenant.`);
    }

    // 2. Permission Check (SUPER_ADMIN or PARTNER owning the property)
    if (user.role !== UserRole.SUPER_ADMIN) { // Use UserRole
      if (user.role !== UserRole.PARTNER || booking.property.ownerId !== user.id) { // Use UserRole
        throw new ForbiddenException("You do not have permission to record payments for this booking.");
      }
    }

    // 3. Validate Payment Type specific logic
    let paymentData: Prisma.PaymentCreateInput = {
      ...rest,
      paymentDate: new Date(paymentDate),
      paymentType,
      method,
      booking: { connect: { id: bookingId } },
      tenant: { connect: { id: user.tenantId } },
    };

    if (paymentType === PaymentType.HOTEL_COLLECT) {
      if (!collectedById) {
        throw new BadRequestException('collectedById is required for HOTEL_COLLECT payments.');
      }
      // Validate collectedBy user exists and belongs to the tenant
      const collector = await this.prisma.user.findUnique({ where: { id: collectedById, tenantId: user.tenantId } });
      if (!collector) {
        throw new NotFoundException(`Collector user with ID ${collectedById} not found in your tenant.`);
      }
      // Validate allowed methods for HOTEL_COLLECT
      if (!([PaymentMethodV2.CASH, PaymentMethodV2.BANK_TRANSFER, PaymentMethodV2.MOMO, PaymentMethodV2.NINEPAY, PaymentMethodV2.ONEPAY] as PaymentMethodV2[]).includes(method)) {
        throw new BadRequestException(`Invalid payment method '${method}' for HOTEL_COLLECT.`);
      }
      paymentData.collectedBy = { connect: { id: collectedById } };
      paymentData.receivedFrom = null; // Ensure receivedFrom is null
    } else if (paymentType === PaymentType.OTA_COLLECT) {
      if (!receivedFrom) {
        throw new BadRequestException('receivedFrom is required for OTA_COLLECT payments.');
      }
      // Validate allowed methods for OTA_COLLECT
      if (!([PaymentMethodV2.OTA_TRANSFER, PaymentMethodV2.BANK_PERSONAL, PaymentMethodV2.NINEPAY, PaymentMethodV2.ONEPAY] as PaymentMethodV2[]).includes(method)) {
        throw new BadRequestException(`Invalid payment method '${method}' for OTA_COLLECT.`);
      }
      // Validate paymentDate >= checkOut for OTA_COLLECT
      if (new Date(paymentDate) < booking.checkOut) {
        throw new BadRequestException('OTA_COLLECT payment date must be on or after the booking check-out date.');
      }
      paymentData.receivedFrom = receivedFrom;
      // Ensure collectedBy is null for OTA_COLLECT, do not set collectedBy field
    }

    return this.prisma.payment.create({ data: paymentData });
  }

  async findAll(
    user: { id: string; tenantId: string; role: UserRole }, // Use UserRole
    query: {
      paymentType?: PaymentType;
      method?: PaymentMethodV2;
      status?: PaymentStatusV2;
      bookingId?: string;
      ownerId?: string; // Filter by property owner
    }
  ): Promise<Payment[]> {
    const where: Prisma.PaymentWhereInput = {
      tenantId: user.tenantId,
    };

    if (query.paymentType) where.paymentType = query.paymentType;
    if (query.method) where.method = query.method;
    if (query.status) where.status = query.status;
    if (query.bookingId) where.bookingId = query.bookingId;

    // Add ownerId filter if provided and user is SUPER_ADMIN or the owner themselves
    if (query.ownerId) {
      if (user.role === UserRole.SUPER_ADMIN || user.id === query.ownerId) { // Use UserRole
        where.booking = {
          property: {
            ownerId: query.ownerId,
          },
        };
      } else {
        // Non-superadmin trying to filter by another owner's ID
        throw new ForbiddenException("You can only filter by your own owner ID.");
      }
    } else if (user.role === UserRole.PARTNER) { // Use UserRole
      // Partners can only see payments related to properties they own
      where.booking = {
        property: {
          ownerId: user.id,
        },
      };
    } else if (user.role === UserRole.STAFF) { // Use UserRole
        // Staff see all within their tenant (unless ownerId filter applied by SuperAdmin)
        // No additional owner filtering needed here if query.ownerId is not set
    } else if (user.role !== UserRole.SUPER_ADMIN) { // Use UserRole
        // Should not happen if roles are exhaustive, but as a safeguard
        throw new ForbiddenException("Insufficient permissions to view payments.");
    }

    return this.prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            property: true, // Include property for context
          },
        },
        collectedBy: true, // Include collector details
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, user: { id: string; tenantId: string; role: UserRole }): Promise<Payment | null> { // Use UserRole
    const payment = await this.prisma.payment.findUnique({
      where: { id, tenantId: user.tenantId },
      include: {
        booking: {
          include: {
            property: true,
          },
        },
        collectedBy: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found.`);
    }

    // Permission Check: SUPER_ADMIN or PARTNER owning the related property
    if (user.role !== UserRole.SUPER_ADMIN) { // Use UserRole
      if (user.role !== UserRole.PARTNER || payment.booking.property.ownerId !== user.id) { // Use UserRole
        // Allow STAFF within the tenant to view?
        // Current logic restricts to SUPER_ADMIN/Owner. Adjust if needed.
        if (!([UserRole.STAFF] as UserRole[]).includes(user.role)) { // Use UserRole
             throw new ForbiddenException("You do not have permission to view this payment.");
        }
      }
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, user: { id: string; tenantId: string; role: UserRole }): Promise<Payment> { // Use UserRole
    const { paymentDate, ...rest } = updatePaymentDto;

    // 1. Find the existing payment and check tenant
    const existingPayment = await this.prisma.payment.findUnique({
      where: { id, tenantId: user.tenantId },
      include: { booking: { include: { property: true } } },
    });

    if (!existingPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found.`);
    }

    // 2. Permission Check (SUPER_ADMIN or PARTNER owning the property)
    if (user.role !== UserRole.SUPER_ADMIN) { // Use UserRole
      if (user.role !== UserRole.PARTNER || existingPayment.booking.property.ownerId !== user.id) { // Use UserRole
        throw new ForbiddenException("You do not have permission to update this payment.");
      }
    }

    // 3. Prepare update data
    const updateData: Prisma.PaymentUpdateInput = { ...rest };
    if (paymentDate) {
      updateData.paymentDate = new Date(paymentDate);

      // Re-validate paymentDate for OTA_COLLECT if date is changed
      if (existingPayment.paymentType === PaymentType.OTA_COLLECT && updateData.paymentDate < existingPayment.booking.checkOut) {
         throw new BadRequestException('OTA_COLLECT payment date must be on or after the booking check-out date.');
      }
    }

    // Prevent changing key fields like bookingId, paymentType, collectedById, receivedFrom via update

    return this.prisma.payment.update({
      where: { id },
      data: updateData,
    });
  }

  // Implement remove function with permission checks
  async remove(id: string, user: { id: string; tenantId: string; role: UserRole }): Promise<Payment> {
    // 1. Find the existing payment and check tenant
    const existingPayment = await this.prisma.payment.findUnique({
      where: { id, tenantId: user.tenantId },
      include: { booking: { include: { property: true } } },
    });

    if (!existingPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found.`);
    }

    // 2. Permission Check (only SUPER_ADMIN can delete payments)
    if (user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException("Only SUPER_ADMIN can delete payments.");
    }

    // 3. Delete the payment
    return this.prisma.payment.delete({
      where: { id },
    });
  }
}

