import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportQueryDto, ReportRange } from './dto/report-query.dto';
import { UserRole, Prisma, PaymentStatusV2, BookingStatus } from '@prisma/client';
import { subDays, subWeeks, subMonths, subYears, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // Helper to get date range based on query
  private getDateRange(query: ReportQueryDto): { gte: Date; lte: Date } {
    const now = new Date();
    let gte: Date;
    let lte: Date = endOfDay(now); // Default end date is today

    switch (query.range) {
      case ReportRange.DAILY:
        gte = startOfDay(now);
        break;
      case ReportRange.WEEKLY:
        gte = startOfWeek(now, { weekStartsOn: 1 }); // Assuming week starts on Monday
        lte = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case ReportRange.MONTHLY:
        gte = startOfMonth(now);
        lte = endOfMonth(now);
        break;
      case ReportRange.YEARLY:
        gte = startOfYear(now);
        lte = endOfYear(now);
        break;
      case ReportRange.CUSTOM:
        if (!query.startDate || !query.endDate) {
          throw new BadRequestException('startDate and endDate are required for custom range.');
        }
        gte = startOfDay(new Date(query.startDate));
        lte = endOfDay(new Date(query.endDate));
        break;
      default: // Default to monthly if range is invalid or not provided
        gte = startOfMonth(now);
        lte = endOfMonth(now);
    }
    return { gte, lte };
  }

  // Helper to build base where clause with permissions
  private buildBaseWhereClause(user: { id: string; tenantId: string; role: UserRole }, query: ReportQueryDto): Prisma.PropertyWhereInput {
    const where: Prisma.PropertyWhereInput = {
      tenantId: user.tenantId,
    };

    if (query.ownerId) {
      if (user.role === UserRole.SUPER_ADMIN || user.id === query.ownerId) {
        where.ownerId = query.ownerId;
      } else {
        throw new ForbiddenException('You can only filter reports by your own owner ID.');
      }
    } else if (user.role === UserRole.PARTNER) {
      where.ownerId = user.id; // Partner can only see their own properties
    }
    // SUPER_ADMIN, ADMIN, MANAGER, STAFF see all properties within the tenant if ownerId is not specified

    if (query.propertyId) where.id = query.propertyId;
    if (query.district) where.district = { contains: query.district, mode: 'insensitive' };
    if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
    if (query.region) where.region = { contains: query.region, mode: 'insensitive' };

    return where;
  }

  // 1. Revenue Report
  async getRevenueReport(user: { id: string; tenantId: string; role: UserRole }, query: ReportQueryDto): Promise<any> {
    const dateRange = this.getDateRange(query);
    const propertyWhere = this.buildBaseWhereClause(user, query);

    // Find properties matching the criteria
    const properties = await this.prisma.property.findMany({
        where: propertyWhere,
        select: { id: true }
    });
    const propertyIds = properties.map(p => p.id);

    if (propertyIds.length === 0) {
        return { totalRevenue: 0, details: [] }; // No properties match filter
    }

    // Sum payments linked to bookings within the date range for the filtered properties
    // We sum payments that are PAID and occurred within the date range.
    const result = await this.prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        tenantId: user.tenantId,
        status: PaymentStatusV2.PAID,
        paymentDate: {
          gte: dateRange.gte,
          lte: dateRange.lte,
        },
        booking: {
          propertyId: { in: propertyIds },
        },
      },
    });

    // Optionally, provide more details, e.g., revenue per property or per day/week/month
    // This requires more complex aggregation or multiple queries.

    return {
      reportType: 'Revenue',
      filters: query,
      dateRange,
      totalRevenue: result._sum.amount ?? 0,
      // Add detailed breakdown here if needed
    };
  }

  // 2. Occupancy Report
  async getOccupancyReport(user: { id: string; tenantId: string; role: UserRole }, query: ReportQueryDto): Promise<any> {
    const dateRange = this.getDateRange(query);
    const propertyWhere = this.buildBaseWhereClause(user, query);

    // Find properties and their room types
    const properties = await this.prisma.property.findMany({
      where: propertyWhere,
      include: {
        roomTypes: { select: { id: true } }, // Get room count indirectly or add a count field
      },
    });

    if (properties.length === 0) {
      return { occupancyRate: 0, bookedNights: 0, availableNights: 0, details: [] };
    }

    const propertyIds = properties.map(p => p.id);

    // Calculate total available room nights in the period
    // This is simplified: Assumes all rooms are available every day.
    // A more accurate calculation would need room inventory/availability data.
    const daysInRange = (dateRange.lte.getTime() - dateRange.gte.getTime()) / (1000 * 3600 * 24) + 1;
    let totalAvailableRoomNights = 0;
    for (const prop of properties) {
        // Need a way to know the number of rooms per room type, or total rooms per property
        // Let's assume each roomType represents one physical room for simplicity here.
        totalAvailableRoomNights += prop.roomTypes.length * daysInRange;
    }

    // Calculate total booked nights within the date range for the filtered properties
    // Sum the nights for bookings that overlap with the date range
    const bookings = await this.prisma.booking.findMany({
      where: {
        tenantId: user.tenantId,
        propertyId: { in: propertyIds },
        bookingStatus: { notIn: [BookingStatus.CANCELLED] }, // Consider only confirmed/pending/no-show?
        // Booking overlaps with the date range
        OR: [
          { checkIn: { lte: dateRange.lte }, checkOut: { gte: dateRange.gte } }, // Overlaps range
        ],
      },
      select: { checkIn: true, checkOut: true, nights: true },
    });

    let totalBookedNights = 0;
    bookings.forEach(booking => {
        // Calculate overlapping nights within the report date range
        const overlapStart = booking.checkIn > dateRange.gte ? booking.checkIn : dateRange.gte;
        const overlapEnd = booking.checkOut < dateRange.lte ? booking.checkOut : dateRange.lte;
        const overlapDuration = (endOfDay(overlapEnd).getTime() - startOfDay(overlapStart).getTime()) / (1000 * 3600 * 24);
        if (overlapDuration > 0) {
            totalBookedNights += overlapDuration;
        }
    });

    const occupancyRate = totalAvailableRoomNights > 0 ? (totalBookedNights / totalAvailableRoomNights) * 100 : 0;

    return {
      reportType: 'Occupancy',
      filters: query,
      dateRange,
      occupancyRate: parseFloat(occupancyRate.toFixed(2)),
      totalBookedNights: parseFloat(totalBookedNights.toFixed(2)),
      totalAvailableRoomNights,
      // Add details per property if needed
    };
  }

  // 3. Source Report
  async getSourceReport(user: { id: string; tenantId: string; role: UserRole }, query: ReportQueryDto): Promise<any> {
    const dateRange = this.getDateRange(query);
    const propertyWhere = this.buildBaseWhereClause(user, query);

     // Find properties matching the criteria
    const properties = await this.prisma.property.findMany({
        where: propertyWhere,
        select: { id: true }
    });
    const propertyIds = properties.map(p => p.id);

    if (propertyIds.length === 0) {
        return { sources: [] }; // No properties match filter
    }

    // Group bookings by channel within the date range for the filtered properties
    const sourceCounts = await this.prisma.booking.groupBy({
      by: ['channel'],
      _count: {
        id: true,
      },
      _sum: {
        netRevenue: true, // Also sum revenue per source
      },
      where: {
        tenantId: user.tenantId,
        propertyId: { in: propertyIds },
        // Filter by booking creation date or check-in date within the range?
        // Let's use check-in date for this example
        checkIn: {
          gte: dateRange.gte,
          lte: dateRange.lte,
        },
        bookingStatus: { notIn: [BookingStatus.CANCELLED] },
      },
    });

    return {
      reportType: 'Booking Source',
      filters: query,
      dateRange,
      sources: sourceCounts.map(s => ({
        channel: s.channel,
        bookingCount: s._count.id,
        totalNetRevenue: s._sum.netRevenue ?? 0,
      })),
    };
  }
}

