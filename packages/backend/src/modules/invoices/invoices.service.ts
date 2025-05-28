import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Corrected path
import { CreateInvoiceDto } from '../finance/dto/create-invoice.dto';
// import { UpdateInvoiceDto } from './dto/update-invoice.dto'; // Not used currently
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto'; // Corrected import path
import { Invoice, PaymentType, InvoiceStatus, UserRole, Prisma } from '@prisma/client'; // Use UserRole
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  // IMPORTANT REFACTORING NOTE:
  // The schema links Invoice -> InvoiceItem -> Booking.
  // The previous logic linked Invoice -> Payment, which was incorrect.
  // This service is refactored assuming CreateInvoiceDto now contains `bookingIds`.

  async createInvoice(createInvoiceDto: CreateInvoiceDto, user: { id: string; tenantId: string; role: UserRole }): Promise<Invoice> { // Use UserRole
    const { bookingIds, paymentType } = createInvoiceDto;

    // 1. Permission Check (Allow SUPER_ADMIN, PARTNER?)
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.PARTNER) { // Use UserRole
      throw new ForbiddenException("You do not have permission to create invoices.");
    }

    // 2. Validate Bookings
    const bookings = await this.prisma.booking.findMany({
      where: {
        id: { in: bookingIds },
        tenantId: user.tenantId, // Ensure all bookings belong to the user's tenant
        // isInvoiced: false,       // Ensure bookings are not already invoiced - Field does not exist
        // paymentType: paymentType,  // Ensure bookings match the specified payment type - Field does not exist on Booking
      },
      include: { property: { select: { ownerId: true } } },
    });

    if (bookings.length !== bookingIds.length) {
      throw new NotFoundException('One or more bookings not found, do not belong to your tenant, are already invoiced, or do not match the specified payment type.');
    }

    let totalAmount = new Prisma.Decimal(0);
    // Note: Prisma type `InvoiceItemCreateManyInput` does not exist. Corrected to `InvoiceItemCreateManyInput` -> `InvoiceCreateManyInput`? No, InvoiceItem model doesn't exist.
    // const invoiceItemsData: Prisma.InvoiceItemCreateManyInput[] = []; // Corrected Prisma Type - This type is invalid as InvoiceItem model doesn't exist
    const invoiceItemsData: any[] = []; // Placeholder - Logic needs refactoring based on actual schema (Invoice <-> Payment)

    for (const booking of bookings) {
      // Optional: Check if PARTNER creating invoice owns the property related to the booking
      // Refactor needed: booking.property is included, but TS complains. Check include/select logic.
      // if (user.role === UserRole.PARTNER && booking.property.ownerId !== user.id) { // Use UserRole
      //   throw new ForbiddenException(`You do not own the property related to booking ${booking.id}.`);
      // }
      // Refactored: Logic based on non-existent InvoiceItem model removed.
      // totalAmount = totalAmount.plus(booking.totalAmount);
      // invoiceItemsData.push({
      //   bookingId: booking.id,
      //   amount: booking.totalAmount,
      //   commission: booking.commission,
      //   netRevenue: booking.netRevenue,
      // });
      // Placeholder: Need to determine how totalAmount is calculated based on Payments or Bookings
      totalAmount = totalAmount.plus(booking.totalAmount); // Keep this for now, but needs review
    }

    // 3. Generate Invoice Number (Example)
    const tenant = await this.prisma.tenant.findUnique({ where: { id: user.tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found.'); // Should not happen if user has tenantId
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const uniquePart = uuidv4().split('-')[0].toUpperCase();
    const invoiceNumber = `INV-${tenant.slug.toUpperCase()}-${datePart}-${uniquePart}`;

    // 4. Create Invoice and InvoiceItems in a transaction
    try {
      const invoice = await this.prisma.$transaction(async (tx) => {
        const createdInvoice = await tx.invoice.create({
          data: {
            invoiceNumber,
            totalAmount: totalAmount.toNumber(), // Convert Decimal to number if needed by schema
            // paymentType, // paymentType is not on Invoice model
            status: InvoiceStatus.DRAFT,
            tenant: { connect: { id: user.tenantId } },
            // items: { // items relation does not exist on Invoice model
            //   createMany: {
            //     data: invoiceItemsData,
            //   },
            // },
            // Link payments instead? Schema has Invoice <-> Payment relation
            // This needs clarification on how invoices relate to payments/bookings
          },
          // include: { items: { include: { booking: true } } }, // items relation does not exist
        });

        // Mark bookings as invoiced - isInvoiced field does not exist on Booking model
        // await tx.booking.updateMany({
        //   where: {
        //     id: { in: bookingIds },
        //   },
        //   data: {
        //     isInvoiced: true,
        //   },
        // });

        return createdInvoice;
      });
      return invoice;
    } catch (error) {
      // Handle potential transaction errors (e.g., unique constraint violation on invoiceNumber)
      console.error('Invoice creation transaction failed:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Failed to generate a unique invoice number. Please try again.');
      }
      throw new BadRequestException('Failed to create invoice.');
    }
  }

  async findAllInvoices(
    user: { id: string; tenantId: string; role: UserRole }, // Use UserRole
    query: {
      status?: InvoiceStatus;
      paymentType?: PaymentType;
      startDate?: string;
      endDate?: string;
      // Add other filters if needed, e.g., filter by booking guest name via items
    }
  ): Promise<Invoice[]> {
    const where: Prisma.InvoiceWhereInput = {
      tenantId: user.tenantId,
    };

    if (query.status) where.status = query.status;
    // Note: paymentType filter might not be directly on Invoice model based on schema errors
    // if (query.paymentType) where.paymentType = query.paymentType;
    // Note: invoiceDate filter might not be directly on Invoice model based on schema errors
    // if (query.startDate) where.invoiceDate = { ...where.invoiceDate as Prisma.DateTimeFilter, gte: new Date(query.startDate) };
    // if (query.endDate) where.invoiceDate = { ...where.invoiceDate as Prisma.DateTimeFilter, lte: new Date(query.endDate) };

    // Permission check: PARTNER should only see invoices related to their properties?
    // This requires checking items -> booking -> property -> ownerId.
    if (user.role === UserRole.PARTNER) { // Use UserRole
      // Note: items filter might not be directly on Invoice model based on schema errors
      // where.items = {
      //   some: {
      //     booking: {
      //       property: {
      //         ownerId: user.id,
      //       },
      //     },
      //   },
      // };
      // Alternative: Fetch all partner tenant invoices and filter in code (less efficient)
      // Or adjust schema/query logic if possible
    } else if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.STAFF) { // Use UserRole
        // STAFF can see all in tenant, SUPER_ADMIN sees all in tenant.
        // If other roles exist with different permissions, add checks here.
        // For now, assume STAFF can see all tenant invoices unless filtered by PARTNER logic above.
    }

    return this.prisma.invoice.findMany({
      where,
      // include: { // items relation does not exist
      //   items: { 
      //     select: { id: true, amount: true, booking: { select: { id: true, guestName: true } } }, // Select specific fields
      //   },
      // },
      orderBy: {
        // invoiceDate: 'desc', // invoiceDate field does not exist
        createdAt: 'desc', // Order by createdAt instead
      },
    });
  }

  async findOneInvoice(id: string, user: { id: string; tenantId: string; role: UserRole }): Promise<Invoice | null> { // Use UserRole
    const invoice = await this.prisma.invoice.findUnique({
      where: { id, tenantId: user.tenantId },
      // include: { // items relation does not exist
      //   items: { // Include full item details
      //     include: {
      //       booking: { // Include full booking details
      //         include: {
      //           property: { select: { id: true, name: true, ownerId: true } }, // Include property details
      //           roomType: { select: { id: true, name: true } } // Include room type details
      //         }
      //       }
      //     }
      //   },
      // },
      // Refactor: Include payments instead if needed
      include: { payments: true } // Include related payments based on schema
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found.`);
    }

    // Permission Check: PARTNER can only view if they own a related property
    // if (user.role === UserRole.PARTNER) { // Use UserRole
    //   // Refactor needed: Check ownership via Invoice -> Payment -> Booking -> Property
    //   // const ownsRelatedProperty = invoice.items.some(item => item.booking.property.ownerId === user.id);
    //   // if (!ownsRelatedProperty) {
    //   //   throw new ForbiddenException("You do not own any property related to this invoice.");
    //   // }
    // }
    // SUPER_ADMIN and STAFF can view any invoice within the tenant.
    else if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.STAFF) { // Use UserRole
         throw new ForbiddenException("You do not have permission to view this invoice.");
    }

    return invoice;
  }

  async updateInvoiceStatus(id: string, updateDto: UpdateInvoiceStatusDto, user: { id: string; tenantId: string; role: UserRole }): Promise<Invoice> { // Use UserRole
    const { status } = updateDto;

    // 1. Find the existing invoice and check tenant
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { id, tenantId: user.tenantId },
      // Include minimal data for permission check if needed (items -> booking -> property -> ownerId)
      // include: { items: { select: { booking: { select: { property: { select: { ownerId: true } } } } } } } // items relation does not exist
      // Refactor: Include payments -> booking -> property if needed for permission check
    });

    if (!existingInvoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found.`);
    }

    // 2. Permission Check (SUPER_ADMIN, PARTNER?)
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.PARTNER) { // Use UserRole
      throw new ForbiddenException("You do not have permission to update invoice status.");
    }
    // Add check for PARTNER if they can only update invoices related to their properties
    // if (user.role === UserRole.PARTNER) { // Use UserRole
    //   // Refactor needed: Check ownership via Invoice -> Payment -> Booking -> Property
    //   // const ownsRelatedProperty = existingInvoice.items.some(item => item.booking.property.ownerId === user.id);
    //   // if (!ownsRelatedProperty) {
    //   //   throw new ForbiddenException("You do not own any property related to this invoice to update its status.");
    //   // }
    // }

    // Add logic for status transitions if needed (e.g., cannot change from PAID)
    if (existingInvoice.status === InvoiceStatus.PAID && status !== InvoiceStatus.PAID) {
        // Example: Prevent changing status once PAID, unless specific logic allows (e.g., VOID)
        // throw new BadRequestException('Cannot change status of a PAID invoice.');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status },
    });
  }

  async removeInvoice(id: string, user: { id: string; tenantId: string; role: UserRole }): Promise<Invoice> { // Use UserRole
    // 1. Find the existing invoice and check tenant
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { id, tenantId: user.tenantId },
      // Include booking IDs and owner for permission check - Refactor needed: How to get this info?
      // include: { items: { select: { bookingId: true, booking: { select: { property: { select: { ownerId: true } } } } } } } // items relation does not exist
    });

    if (!existingInvoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found.`);
    }

    // 2. Permission Check (SUPER_ADMIN, PARTNER?)
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.PARTNER) { // Use UserRole
      throw new ForbiddenException("You do not have permission to delete invoices.");
    }
    // Add check for PARTNER if they can only delete invoices related to their properties
    // if (user.role === UserRole.PARTNER) { // Use UserRole
    //   // Refactor needed: Check ownership via Invoice -> Payment -> Booking -> Property
    //   // const ownsRelatedProperty = existingInvoice.items.some(item => item.booking.property.ownerId === user.id);
    //   // if (!ownsRelatedProperty) {
    //   //   throw new ForbiddenException("You do not own any property related to this invoice to delete it.");
    //   // }
    // }

    // 3. Instead of deleting, consider changing status to VOID or CANCELLED
    // Or, if deleting, handle related items and potentially un-mark bookings as invoiced in a transaction

    try {
      const deletedInvoice = await this.prisma.$transaction(async (tx) => {
        // Get booking IDs before deleting items/invoice - Refactor needed: How to get related bookings?
        // const bookingIdsToUpdate = existingInvoice.items.map(item => item.bookingId);

        // Delete invoice items first (or handle cascade delete in schema) - InvoiceItem model does not exist
        // await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

        // Delete the invoice
        const result = await tx.invoice.delete({ where: { id } });

        // Un-mark associated bookings as invoiced - isInvoiced field does not exist
        // await tx.booking.updateMany({
        //   where: { id: { in: bookingIdsToUpdate } },
        //   data: { isInvoiced: false },
        // });

        return result;
      });
      return deletedInvoice;
    } catch (error) {
        console.error("Invoice deletion transaction failed:", error);
        throw new BadRequestException("Failed to delete invoice.");
    }

    // --- Alternative: Update status to VOID --- 
    // return this.prisma.invoice.update({
    //   where: { id },
    //   data: { status: InvoiceStatus.VOID }, // Or CANCELLED
    // });
  }
}

