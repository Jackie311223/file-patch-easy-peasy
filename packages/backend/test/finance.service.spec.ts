import { FinanceService } from '../src/finance/finance.service';
// import { PrismaService } from '../prisma/prisma.service'; // Removed import
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { UpdateInvoiceStatusDto } from '../src/finance/dto/update-invoice-status.dto';

// No longer need jest.mock for PrismaService
// jest.mock('../prisma/prisma.service');

// Manually define enums for testing
enum PaymentType { HOTEL_COLLECT = 'HOTEL_COLLECT', OTA_COLLECT = 'OTA_COLLECT' }
enum InvoiceStatus { DRAFT = 'DRAFT', SENT = 'SENT', PAID = 'PAID', VOID = 'VOID', CANCELLED = 'CANCELLED' }
enum BookingStatus { CONFIRMED = 'CONFIRMED', PENDING = 'PENDING', CANCELLED = 'CANCELLED', NO_SHOW = 'NO_SHOW' }
enum Channel { DIRECT = 'DIRECT', AIRBNB = 'AIRBNB', AGODA = 'AGODA', BOOKING_COM = 'BOOKING_COM', CTRIP = 'CTRIP', EXPEDIA = 'EXPEDIA', TRAVELOKA = 'TRAVELOKA', KLOOK = 'KLOOK', OTHER = 'OTHER' }
enum PaymentMethod { CASH = 'CASH', BANK_TRANSFER = 'BANK_TRANSFER', CREDIT_CARD = 'CREDIT_CARD', MOMO = 'MOMO', OTA_COLLECT = 'OTA_COLLECT', HOTEL_COLLECT = 'HOTEL_COLLECT', UPC = 'UPC' }
enum BookingPaymentStatus { PAID = 'PAID', PARTIALLY_PAID = 'PARTIALLY_PAID', UNPAID = 'UNPAID', REFUNDED = 'REFUNDED' }
enum DepositMethod { CASH = 'CASH', BANK_TRANSFER = 'BANK_TRANSFER', MOMO = 'MOMO', UPC = 'UPC', CREDIT_CARD = 'CREDIT_CARD' }
enum DepositStatus { PENDING = 'PENDING', PAID = 'PAID', REFUNDED = 'REFUNDED', FORFEITED = 'FORFEITED' }

// Define Prisma namespace for types
namespace Prisma { 
    export type InvoiceWhereInput = any; 
    export type InvoiceItemCreateManyInvoiceInput = any;
}

// Mock data (keep as is)
const mockBooking1: any = {
  id: 'booking1',
  tenantId: 'tenant1',
  paymentType: PaymentType.HOTEL_COLLECT,
  isInvoiced: false,
  totalAmount: new Decimal(100.00),
  commission: new Decimal(10.00),
  guestName: 'Guest One',
  contactPhone: '1234567890',
  channel: Channel.DIRECT,
  checkIn: new Date('2024-01-10'),
  checkOut: new Date('2024-01-12'),
  nights: 2,
  adults: 2,
  children: 0,
  netRevenue: new Decimal(90.00),
  currency: 'VND',
  paymentMethod: PaymentMethod.CASH,
  paymentStatus: BookingPaymentStatus.UNPAID,
  amountPaid: new Decimal(0.00),
  outstandingBalance: new Decimal(100.00),
  bookingStatus: BookingStatus.CONFIRMED,
  createdAt: new Date(),
  updatedAt: new Date(),
  propertyId: 'prop1',
  roomTypeId: 'roomType1',
  userId: 'user1',
};

const mockBooking2: any = {
  ...mockBooking1,
  id: 'booking2',
  totalAmount: new Decimal(200.00),
  commission: new Decimal(20.00),
  netRevenue: new Decimal(180.00),
  outstandingBalance: new Decimal(200.00),
};

const mockBookingInvoiced: any = {
  ...mockBooking1,
  id: 'bookingInvoiced',
  isInvoiced: true,
};

const mockBookingWrongType: any = {
  ...mockBooking1,
  id: 'bookingWrongType',
  paymentType: PaymentType.OTA_COLLECT,
};

const mockInvoice1: any = {
  id: 'invoice1',
  tenantId: 'tenant1',
  invoiceNumber: 'INV-20240527-ABCD',
  invoiceDate: new Date(),
  paymentType: PaymentType.HOTEL_COLLECT,
  totalAmount: new Decimal(300.00),
  status: InvoiceStatus.DRAFT,
  notes: 'Test invoice',
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [
    {
      id: 'item1',
      invoiceId: 'invoice1',
      bookingId: 'booking1',
      amount: new Decimal(100.00),
      commission: new Decimal(10.00),
      netRevenue: new Decimal(90.00),
      booking: mockBooking1,
    },
    {
      id: 'item2',
      invoiceId: 'invoice1',
      bookingId: 'booking2',
      amount: new Decimal(200.00),
      commission: new Decimal(20.00),
      netRevenue: new Decimal(180.00),
      booking: mockBooking2,
    },
  ],
};

// Define the mock implementation as a plain object
const mockPrismaImplementation = {
  booking: {
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
  invoice: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $transaction: jest.fn().mockImplementation(async (callback) => {
    // Pass the same mock object as the transaction context
    return await callback(mockPrismaImplementation);
  }),
};

// No longer need to assign to PrismaService.prototype
// PrismaService.prototype.$transaction = mockPrismaImplementation.$transaction;
// PrismaService.prototype.booking = mockPrismaImplementation.booking;
// PrismaService.prototype.invoice = mockPrismaImplementation.invoice;
// PrismaService.prototype.$connect = mockPrismaImplementation.$connect;
// PrismaService.prototype.$disconnect = mockPrismaImplementation.$disconnect;

describe('FinanceService', () => {
  let service: FinanceService;
  let prisma: any; // Use 'any' type for the mocked Prisma object

  beforeEach(() => {
    // Assign the plain mock object to prisma
    prisma = mockPrismaImplementation;
    // Instantiate FinanceService with the plain mock object
    service = new FinanceService(prisma);

    // Reset mocks before each test
    jest.clearAllMocks();
    // Reset specific mock implementations
    prisma.$transaction.mockClear().mockImplementation(async (callback) => {
        return await callback(prisma);
    });
    prisma.booking.findMany.mockClear();
    prisma.booking.updateMany.mockClear();
    prisma.invoice.create.mockClear();
    prisma.invoice.findMany.mockClear();
    prisma.invoice.findUnique.mockClear();
    prisma.invoice.update.mockClear();

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- createInvoice Tests ---
  describe('createInvoice', () => {
    const createDto: any = {
      bookingIds: ['booking1', 'booking2'],
      paymentType: PaymentType.HOTEL_COLLECT,
      notes: 'Test notes',
    };
    const user = { id: 'user1', tenantId: 'tenant1' };

    it('should create an invoice successfully', async () => {
      // Arrange
      prisma.booking.findMany.mockResolvedValue([mockBooking1, mockBooking2]);
      prisma.invoice.create.mockResolvedValue(mockInvoice1);
      prisma.booking.updateMany.mockResolvedValue({ count: 2 });

      // Act
      const result = await service.createInvoice(createDto, user);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: createDto.bookingIds },
          tenantId: user.tenantId,
          paymentType: createDto.paymentType,
          isInvoiced: false,
        },
      });
      expect(prisma.invoice.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          paymentType: createDto.paymentType,
          totalAmount: new Decimal(300.00),
          status: InvoiceStatus.DRAFT,
          notes: createDto.notes,
          tenantId: user.tenantId,
          items: {
            createMany: {
              data: [
                { bookingId: 'booking1', amount: new Decimal(100.00), commission: new Decimal(10.00), netRevenue: new Decimal(90.00) },
                { bookingId: 'booking2', amount: new Decimal(200.00), commission: new Decimal(20.00), netRevenue: new Decimal(180.00) },
              ],
            },
          },
        }),
      }));
      expect(prisma.booking.updateMany).toHaveBeenCalledWith({
        where: { id: { in: createDto.bookingIds } },
        data: { isInvoiced: true },
      });
      expect(result).toEqual(mockInvoice1);
    });

    it('should throw BadRequestException if bookingIds is empty', async () => {
      await expect(service.createInvoice({ ...createDto, bookingIds: [] }, user))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if some bookings are not found', async () => {
      prisma.booking.findMany.mockResolvedValue([mockBooking1]);
      await expect(service.createInvoice(createDto, user))
        .rejects.toThrow(NotFoundException);
      expect(prisma.invoice.create).not.toHaveBeenCalled();
      expect(prisma.booking.updateMany).not.toHaveBeenCalled();
    });

     it('should throw NotFoundException if a booking is already invoiced', async () => {
      prisma.booking.findMany.mockResolvedValue([mockBooking1, mockBookingInvoiced]);
      await expect(service.createInvoice({ ...createDto, bookingIds: ['booking1', 'bookingInvoiced'] }, user))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if payment types mismatch', async () => {
      prisma.booking.findMany.mockResolvedValue([mockBooking1, mockBookingWrongType]);
      await expect(service.createInvoice({ ...createDto, bookingIds: ['booking1', 'bookingWrongType'] }, user))
        .rejects.toThrow(NotFoundException);
    });

  });

  // --- findAllInvoices Tests ---
  describe('findAllInvoices', () => {
    const user = { id: 'user1', tenantId: 'tenant1' };

    it('should return a list of invoices for the tenant', async () => {
      const invoices = [mockInvoice1];
      prisma.invoice.findMany.mockResolvedValue(invoices);

      const result = await service.findAllInvoices({}, user);

      expect(prisma.invoice.findMany).toHaveBeenCalledWith({
        where: { tenantId: user.tenantId },
        orderBy: { createdAt: 'desc' },
        include: { items: { select: { bookingId: true } } },
      });
      expect(result).toEqual(invoices);
    });

    it('should filter invoices by status', async () => {
      const invoices = [mockInvoice1];
      prisma.invoice.findMany.mockResolvedValue(invoices);

      await service.findAllInvoices({ status: InvoiceStatus.DRAFT }, user);

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { tenantId: user.tenantId, status: InvoiceStatus.DRAFT },
      }));
    });

     it('should filter invoices by paymentType', async () => {
      const invoices = [mockInvoice1];
      prisma.invoice.findMany.mockResolvedValue(invoices);

      await service.findAllInvoices({ paymentType: PaymentType.HOTEL_COLLECT }, user);

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { tenantId: user.tenantId, paymentType: PaymentType.HOTEL_COLLECT },
      }));
    });

  });

  // --- findOneInvoice Tests ---
  describe('findOneInvoice', () => {
     const user = { id: 'user1', tenantId: 'tenant1' };

    it('should return a single invoice with details', async () => {
      prisma.invoice.findUnique.mockResolvedValue(mockInvoice1);

      const result = await service.findOneInvoice('invoice1', user);

      expect(prisma.invoice.findUnique).toHaveBeenCalledWith({
        where: { id: 'invoice1', tenantId: user.tenantId },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockInvoice1);
    });

    it('should throw NotFoundException if invoice not found', async () => {
      prisma.invoice.findUnique.mockResolvedValue(null);
      await expect(service.findOneInvoice('invalidId', user)).rejects.toThrow(NotFoundException);
    });
  });

  // --- updateInvoiceStatus Tests ---
  describe('updateInvoiceStatus', () => {
    const user = { id: 'user1', tenantId: 'tenant1' };
    const updateDto: UpdateInvoiceStatusDto = { status: InvoiceStatus.PAID };

    it('should update the invoice status successfully', async () => {
      const updatedInvoice = { ...mockInvoice1, status: InvoiceStatus.PAID };
      prisma.invoice.findUnique.mockResolvedValue(mockInvoice1);
      prisma.invoice.update.mockResolvedValue(updatedInvoice);

      const result = await service.updateInvoiceStatus('invoice1', updateDto, user);

      expect(prisma.invoice.findUnique).toHaveBeenCalledWith({ where: { id: 'invoice1', tenantId: user.tenantId } });
      expect(prisma.invoice.update).toHaveBeenCalledWith({
        where: { id: 'invoice1' },
        data: { status: InvoiceStatus.PAID },
      });
      expect(result).toEqual(updatedInvoice);
    });

    it('should throw NotFoundException if invoice not found', async () => {
      prisma.invoice.findUnique.mockResolvedValue(null);
      await expect(service.updateInvoiceStatus('invalidId', updateDto, user)).rejects.toThrow(NotFoundException);
      expect(prisma.invoice.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if trying to update a cancelled invoice', async () => {
        const cancelledInvoice = { ...mockInvoice1, status: InvoiceStatus.CANCELLED };
        prisma.invoice.findUnique.mockResolvedValue(cancelledInvoice);
        await expect(service.updateInvoiceStatus('invoice1', updateDto, user)).rejects.toThrow(BadRequestException);
        expect(prisma.invoice.update).not.toHaveBeenCalled();
    });

     it('should throw BadRequestException if trying to update a void invoice', async () => {
        const voidInvoice = { ...mockInvoice1, status: InvoiceStatus.VOID };
        prisma.invoice.findUnique.mockResolvedValue(voidInvoice);
        await expect(service.updateInvoiceStatus('invoice1', updateDto, user)).rejects.toThrow(BadRequestException);
        expect(prisma.invoice.update).not.toHaveBeenCalled();
    });

  });

  // --- removeInvoice Tests ---
  describe('removeInvoice', () => {
    const user = { id: 'user1', tenantId: 'tenant1' };

    it('should cancel an invoice and revert isInvoiced flag on bookings', async () => {
      const cancelledInvoice = { ...mockInvoice1, status: InvoiceStatus.CANCELLED };
      // Mock findUnique inside transaction
      prisma.invoice.findUnique.mockResolvedValueOnce(mockInvoice1);
      // Mock update inside transaction
      prisma.invoice.update.mockResolvedValueOnce(cancelledInvoice);
      // Mock updateMany inside transaction
      prisma.booking.updateMany.mockResolvedValueOnce({ count: 2 });

      const result = await service.removeInvoice('invoice1', user);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.invoice.findUnique).toHaveBeenCalledWith({ where: { id: 'invoice1', tenantId: user.tenantId }, include: { items: true } });
      expect(prisma.invoice.update).toHaveBeenCalledWith({
        where: { id: 'invoice1' },
        data: { status: InvoiceStatus.CANCELLED },
      });
      expect(prisma.booking.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['booking1', 'booking2'] } },
        data: { isInvoiced: false },
      });
      expect(result).toEqual(cancelledInvoice);
    });

    it('should throw NotFoundException if invoice not found', async () => {
      prisma.invoice.findUnique.mockResolvedValue(null);
      await expect(service.removeInvoice('invalidId', user)).rejects.toThrow(NotFoundException);
      expect(prisma.invoice.update).not.toHaveBeenCalled();
      expect(prisma.booking.updateMany).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if trying to cancel a paid invoice', async () => {
      const paidInvoice = { ...mockInvoice1, status: InvoiceStatus.PAID };
      prisma.invoice.findUnique.mockResolvedValue(paidInvoice);
      await expect(service.removeInvoice('invoice1', user)).rejects.toThrow(BadRequestException);
      expect(prisma.invoice.update).not.toHaveBeenCalled();
      expect(prisma.booking.updateMany).not.toHaveBeenCalled();
    });

     it('should throw BadRequestException if trying to cancel an already cancelled invoice', async () => {
      const cancelledInvoice = { ...mockInvoice1, status: InvoiceStatus.CANCELLED };
      prisma.invoice.findUnique.mockResolvedValue(cancelledInvoice);
      await expect(service.removeInvoice('invoice1', user)).rejects.toThrow(BadRequestException);
      expect(prisma.invoice.update).not.toHaveBeenCalled();
      expect(prisma.booking.updateMany).not.toHaveBeenCalled();
    });

  });

});
