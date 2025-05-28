import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, UserRole } from '@prisma/client'; // Import UserRole

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  // Helper to verify tenant access for a specific payment
  private async verifyPaymentAccess(id: string, tenantId: string, userRole: UserRole): Promise<void> {
    if (userRole === UserRole.SUPER_ADMIN) return; // Super admin bypasses tenant check

    const payment = await this.prisma.payment.findUnique({
      where: { id },
      select: { tenantId: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found.`);
    }

    if (payment.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied to this payment.');
    }
  }

  async findAll(tenantId: string, userRole: UserRole) {
    const whereClause: Prisma.PaymentWhereInput = {};
    if (userRole !== UserRole.SUPER_ADMIN) {
      whereClause.tenantId = tenantId;
    }
    // Add other filters based on role if needed, e.g., filter by property for PARTNER/STAFF

    return this.prisma.payment.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string, userRole: UserRole) {
    // Verify access first
    await this.verifyPaymentAccess(id, tenantId, userRole);

    // If access is verified (or user is SUPER_ADMIN), fetch the payment
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      // Include relations if needed
    });
    if (!payment) {
        // This case should ideally be caught by verifyPaymentAccess, but added for robustness
        throw new NotFoundException(`Payment with ID ${id} not found.`);
    }
    return payment;
  }

  async create(data: any, tenantId: string) {
    // Ensure tenantId is added to the payment data
    const paymentData = { ...data, tenantId };
    return this.prisma.payment.create({
      data: paymentData,
    });
  }

  async update(id: string, data: any, tenantId: string, userRole: UserRole) {
    // Verify access before updating
    await this.verifyPaymentAccess(id, tenantId, userRole);

    return this.prisma.payment.update({
      where: { id }, // We already verified tenant access, so just use ID
      data,
    });
  }

  async remove(id: string, tenantId: string, userRole: UserRole) {
    // Verify access before deleting
    await this.verifyPaymentAccess(id, tenantId, userRole);

    return this.prisma.payment.delete({
      where: { id }, // We already verified tenant access, so just use ID
    });
  }
}
