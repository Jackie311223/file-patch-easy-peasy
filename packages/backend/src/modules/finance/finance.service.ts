import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Corrected path
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from '../invoices/dto/update-invoice-status.dto'; // Corrected path
// import { Prisma, InvoiceStatus, PaymentType, Booking } from '@prisma/client'; // Commented out problematic import
import { Decimal } from '@prisma/client/runtime/library'; // Import Decimal

// Manually define enums and types needed for the service logic, mirroring the spec file approach
enum PaymentType { HOTEL_COLLECT = 'HOTEL_COLLECT', OTA_COLLECT = 'OTA_COLLECT' }
enum InvoiceStatus { DRAFT = 'DRAFT', SENT = 'SENT', PAID = 'PAID', VOID = 'VOID', CANCELLED = 'CANCELLED' }

// Define Prisma namespace locally for required types
namespace Prisma { 
    export type InvoiceWhereInput = any; 
    export type InvoiceItemCreateManyInvoiceInput = any;
    // Add other Prisma types used within the service if needed
}

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async createInvoice(createInvoiceDto: CreateInvoiceDto, user: { id: string; tenantId: string }) {
    const { bookingIds, paymentType } = createInvoiceDto; // Removed notes

    if (!bookingIds || bookingIds.length === 0) {
      throw new BadRequestException('At least one booking ID must be provided.');
    }

    // Start transaction
    // Use 'any' for tx type if Prisma.$transaction type causes issues without proper Prisma client types
    return (this.prisma as any).$transaction(async (tx: any) => {
      // 1. Fetch bookings and validate
      const bookings = await tx.booking.findMany({
        where: {
          id: { in: bookingIds },
          tenantId: user.tenantId, // Ensure bookings belong to the user's tenant
          paymentType: paymentType, // Ensure all bookings have the same payment type as the invoice
          isInvoiced: false, // Ensure bookings are not already invoiced
        },
      });

      if (bookings.length !== bookingIds.length) {
        const foundIds = bookings.map((b: any) => b.id);
        const notFoundOrInvalid = bookingIds.filter(id => !foundIds.includes(id));
        throw new NotFoundException(`Bookings not found, already invoiced, or payment type mismatch for IDs: ${notFoundOrInvalid.join(', ')}`);
      }

      // 2. Calculate total amount and create invoice items data
      let totalInvoiceAmount = new Decimal(0);
      const invoiceItemsData: Prisma.InvoiceItemCreateManyInvoiceInput[] = bookings.map((booking: any) => {
        const bookingTotal = new Decimal(booking.totalAmount);
        const commission = booking.commission ? new Decimal(booking.commission) : new Decimal(0);
        const netRevenue = bookingTotal.minus(commission);
        totalInvoiceAmount = totalInvoiceAmount.plus(bookingTotal);

        return {
          bookingId: booking.id,
          amount: bookingTotal,
          commission: commission,
          netRevenue: netRevenue,
        };
      });

      // 3. Create the Invoice
      const newInvoice = await tx.invoice.create({
        data: {
          invoiceNumber: this.generateInvoiceNumber(), // Implement generation logic
          invoiceDate: new Date(),
          paymentType: paymentType,
          totalAmount: totalInvoiceAmount,
          status: InvoiceStatus.DRAFT,
          notes: createInvoiceDto.notes,
          tenantId: user.tenantId,
          items: {
            createMany: {
              data: invoiceItemsData,
            },
          },
        },
        include: { items: { include: { booking: true } } }, // Include items and bookings in the response
      });

      // 4. Mark bookings as invoiced
      await tx.booking.updateMany({
        where: {
          id: { in: bookingIds },
        },
        data: {
          isInvoiced: true,
        },
      });

      return newInvoice;
    });
  }

  // TODO: Implement filtering logic based on query params
  async findAllInvoices(filters: { status?: string; paymentType?: string; startDate?: string; endDate?: string }, user: { id: string; tenantId: string }) {
     const where: Prisma.InvoiceWhereInput = {
      tenantId: user.tenantId,
    };

    if (filters.status && Object.values(InvoiceStatus).includes(filters.status as InvoiceStatus)) {
      where.status = filters.status as InvoiceStatus;
    }
    if (filters.paymentType && Object.values(PaymentType).includes(filters.paymentType as PaymentType)) {
      where.paymentType = filters.paymentType as PaymentType;
    }
    // Add date filtering logic if needed
    // if (filters.startDate) { ... }
    // if (filters.endDate) { ... }

    return (this.prisma as any).invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: { select: { bookingId: true } } }, // Include only booking IDs for list view
    });
  }

  async findOneInvoice(id: string, user: { id: string; tenantId: string }) {
    const invoice = await (this.prisma as any).invoice.findUnique({
      where: { id, tenantId: user.tenantId }, // Ensure tenant access
      include: {
        items: {
          include: {
            booking: true, // Include full booking details for the specific invoice
          },
        },
        tenant: { select: { name: true } }, // Include tenant name
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found.`);
    }
    return invoice;
  }

  async updateInvoiceStatus(id: string, updateInvoiceStatusDto: UpdateInvoiceStatusDto, user: { id: string; tenantId: string }) {
    const { status } = updateInvoiceStatusDto;

    // Validate if the invoice exists and belongs to the tenant
    const invoice = await (this.prisma as any).invoice.findUnique({
      where: { id, tenantId: user.tenantId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found.`);
    }

    // Add business logic here if needed (e.g., cannot change status from PAID)
    if (invoice.status === InvoiceStatus.PAID && status !== InvoiceStatus.PAID) {
        // Example: Prevent changing status once paid (adjust as needed)
        // throw new BadRequestException('Cannot change status of a paid invoice.');
    }
     if (invoice.status === InvoiceStatus.CANCELLED || invoice.status === InvoiceStatus.VOID) {
        throw new BadRequestException(`Cannot update status of a ${invoice.status.toLowerCase()} invoice.`);
    }

    return (this.prisma as any).invoice.update({
      where: { id },
      data: { status },
    });
  }

  async removeInvoice(id: string, user: { id: string; tenantId: string }) {
     // Instead of deleting, update status to CANCELLED or VOID
     // Also, revert the isInvoiced flag on associated bookings

     return (this.prisma as any).$transaction(async (tx: any) => {
        const invoice = await tx.invoice.findUnique({
            where: { id, tenantId: user.tenantId },
            include: { items: true },
        });

        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found.`);
        }

        if (invoice.status === InvoiceStatus.PAID) {
            throw new BadRequestException('Cannot cancel a paid invoice. Consider creating a credit note or refund process.');
        }
        if (invoice.status === InvoiceStatus.CANCELLED || invoice.status === InvoiceStatus.VOID) {
             throw new BadRequestException(`Invoice is already ${invoice.status.toLowerCase()}.`);
        }

        // Update invoice status
        const updatedInvoice = await tx.invoice.update({
            where: { id },
            data: { status: InvoiceStatus.CANCELLED }, // Or VOID depending on business logic
        });

        // Revert isInvoiced flag for bookings
        const bookingIds = invoice.items.map((item: any) => item.bookingId);
        if (bookingIds.length > 0) {
            await tx.booking.updateMany({
                where: { id: { in: bookingIds } },
                data: { isInvoiced: false },
            });
        }

        return updatedInvoice;
     });
  }

  // Placeholder for invoice number generation logic
  private generateInvoiceNumber(): string {
    // Implement your logic, e.g., INV-YYYYMMDD-XXXX
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INV-${year}${month}${day}-${randomSuffix}`;
  }
}

