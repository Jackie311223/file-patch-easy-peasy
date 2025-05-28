import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto'; // Keep for potential future use
import { Invoice, PaymentType, PaymentStatusV2, InvoiceStatus, UserRole, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'; // For generating unique parts of invoice numbers if needed

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto, user: { id: string; tenantId: string; role: UserRole }): Promise<Invoice> {
    const { paymentIds } = createInvoiceDto;

    // 1. Permission Check (Allow SUPER_ADMIN, ADMIN, PARTNER, MANAGER?)
    // For now, let's assume ADMINs and above in the tenant can create invoices.
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ADMIN && 
        user.role !== UserRole.PARTNER && user.role !== UserRole.MANAGER) {
      throw new ForbiddenException('You do not have permission to create invoices.');
    }

    // 2. Validate Payments
    const payments = await this.prisma.payment.findMany({
      where: {
        id: { in: paymentIds },
        tenantId: user.tenantId, // Ensure all payments belong to the user's tenant
      },
      include: { booking: { select: { property: { select: { ownerId: true } } } } },
    });

    if (payments.length !== paymentIds.length) {
      throw new NotFoundException('One or more payments not found or do not belong to your tenant.');
    }

    let totalAmount = 0;
    for (const payment of payments) {
      // Check if all payments are OTA_COLLECT and PAID
      if (payment.paymentType !== PaymentType.OTA_COLLECT) {
        throw new BadRequestException(`Payment ${payment.id} is not of type OTA_COLLECT.`);
      }
      if (payment.status !== PaymentStatusV2.PAID) {
        throw new BadRequestException(`Payment ${payment.id} is not PAID.`);
      }
      // Optional: Check if PARTNER creating invoice owns the property related to the payment
      if (user.role === UserRole.PARTNER && payment.booking.property.ownerId !== user.id) {
          throw new ForbiddenException(`You do not own the property related to payment ${payment.id}.`);
      }
      totalAmount += payment.amount; // Summing float amounts
    }

    // 3. Generate Invoice Number (Example: INV-TENANTA-20250525-XXXX)
    const tenant = await this.prisma.tenant.findUnique({ where: { id: user.tenantId } });
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const uniquePart = uuidv4().split('-')[0].toUpperCase(); // Short unique part
    const invoiceNumber = `INV-${tenant.slug.toUpperCase()}-${datePart}-${uniquePart}`;

    // 4. Create Invoice
    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        totalAmount,
        status: InvoiceStatus.DRAFT, // Start as DRAFT or SENT?
        tenant: { connect: { id: user.tenantId } },
        payments: {
          connect: paymentIds.map(id => ({ id })),
        },
      },
      include: { payments: true }, // Include payments in the response
    });

    return invoice;
  }

  async findAll(
    user: { id: string; tenantId: string; role: UserRole },
    query: {
      status?: InvoiceStatus;
      ota?: string; // Filter by receivedFrom in related payments
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Invoice[]> {
    const where: Prisma.InvoiceWhereInput = {
      tenantId: user.tenantId,
    };

    if (query.status) where.status = query.status;
    if (query.startDate) where.createdAt = { ...where.createdAt as Prisma.DateTimeFilter, gte: new Date(query.startDate) };
    if (query.endDate) where.createdAt = { ...where.createdAt as Prisma.DateTimeFilter, lte: new Date(query.endDate) };

    // Filter by OTA (receivedFrom)
    if (query.ota) {
      where.payments = {
        some: {
          receivedFrom: {
            contains: query.ota,
            mode: 'insensitive',
          },
          paymentType: PaymentType.OTA_COLLECT, // Ensure we only match OTA payments
        },
      };
    }

    // Permission check: PARTNER should only see invoices related to their properties?
    // This requires checking payments -> booking -> property -> ownerId. Complex for list view.
    // Simplification: Allow ADMIN/MANAGER/PARTNER/STAFF within tenant to see all tenant invoices for now.
    // SUPER_ADMIN sees all for the tenant.
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ADMIN && 
        user.role !== UserRole.PARTNER && user.role !== UserRole.MANAGER && 
        user.role !== UserRole.STAFF) {
        throw new ForbiddenException('You do not have permission to view invoices.');
    }
    // If user is PARTNER, further filtering might be needed if strict property ownership is required.

    return this.prisma.invoice.findMany({
      where,
      include: {
        payments: { // Optionally include some payment details
            select: { id: true, amount: true, receivedFrom: true, paymentDate: true }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, user: { id: string; tenantId: string; role: UserRole }): Promise<Invoice | null> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id, tenantId: user.tenantId },
      include: {
        payments: { // Include full payment details
            include: {
                booking: { select: { id: true, guestName: true, property: { select: { id: true, name: true, ownerId: true } } } }
            }
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found.`);
    }

    // Permission Check: Similar to findAll, allow tenant users for now.
    // If PARTNER, check if they own at least one property related to the payments?
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ADMIN && 
        user.role !== UserRole.PARTNER && user.role !== UserRole.MANAGER && 
        user.role !== UserRole.STAFF) {
        throw new ForbiddenException('You do not have permission to view this invoice.');
    }
    // Add check for PARTNER if needed:
    // if (user.role === UserRole.PARTNER) {
    //   const ownsRelatedProperty = invoice.payments.some(p => p.booking.property.ownerId === user.id);
    //   if (!ownsRelatedProperty) {
    //     throw new ForbiddenException('You do not own any property related to this invoice.');
    //   }
    // }

    return invoice;
  }

  // Update endpoint (e.g., to change status from DRAFT to SENT)
  async updateStatus(id: string, status: InvoiceStatus, user: { id: string; tenantId: string; role: UserRole }): Promise<Invoice> {
     // 1. Find the existing invoice and check tenant
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { id, tenantId: user.tenantId },
      include: { payments: { select: { booking: { select: { property: { select: { ownerId: true } } } } } } } // Include minimal data for permission check
    });

    if (!existingInvoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found.`);
    }

    // 2. Permission Check (SUPER_ADMIN, ADMIN, PARTNER?)
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ADMIN && 
        user.role !== UserRole.PARTNER && user.role !== UserRole.MANAGER) {
      throw new ForbiddenException('You do not have permission to update invoice status.');
    }
    // Add check for PARTNER if needed:
    // if (user.role === UserRole.PARTNER) {
    //   const ownsRelatedProperty = existingInvoice.payments.some(p => p.booking.property.ownerId === user.id);
    //   if (!ownsRelatedProperty) {
    //     throw new ForbiddenException('You do not own any property related to this invoice.');
    //   }
    // }

    return this.prisma.invoice.update({
        where: { id },
        data: { status },
    });
  }

  // No general update DTO for now, only status update.
  // async update(id: string, updateInvoiceDto: UpdateInvoiceDto, user: { id: string; tenantId: string; role: UserRole }): Promise<Invoice> { ... }

  // Remove function might be needed
  // async remove(id: string, user: { id: string; tenantId: string; role: UserRole }): Promise<Invoice> { ... }
}

