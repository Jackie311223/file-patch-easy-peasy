import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './booking.controller';
import { BookingsService } from "./booking.service";
import { JwtAuthGuard } from "../../core/auth/guards/jwt-auth.guard";
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Channel, PaymentMethod, BookingStatus, PaymentStatus, UserRole, PaymentType } from '@prisma/client';
import { ClassSerializerInterceptor, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Mock BookingService
const bookingServiceMock = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('BookingsController', () => {
  let controller: BookingsController;
  let service: typeof bookingServiceMock;

  const userId = 'user-test-id';
  const tenantId = 'tenant-a-uuid';
  const propertyId = 'prop-test-id';
  const roomTypeId = 'rt-test-id';
  const bookingId = 'booking-test-id';

  // Define a mock request object containing the user context
  const mockReq = {
    user: { id: userId, tenantId: tenantId, role: UserRole.MANAGER }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        { provide: BookingsService, useValue: bookingServiceMock },
        { provide: Reflector, useValue: { get: jest.fn() } },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ 
        canActivate: (context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            // Ensure the mock guard attaches the same user structure as mockReq
            req.user = mockReq.user; 
            return true;
        }
     })
    .overrideInterceptor(ClassSerializerInterceptor)
    .useValue({ intercept: jest.fn((context, next) => next.handle()) })
    .compile();

    controller = module.get<BookingsController>(BookingsController);
    service = module.get(BookingsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Test POST /bookings --- 
  describe('create', () => {
    const createDto: CreateBookingDto = {
        propertyId: propertyId,
        roomTypeId: roomTypeId,
        guestName: 'Test Create',
        contactPhone: '111222333',
        channel: Channel.DIRECT,
        checkIn: '2024-09-01T00:00:00Z',
        checkOut: '2024-09-03T00:00:00Z',
        adults: 2,
        totalAmount: '300.50',
        paymentMethod: PaymentMethod.CASH,
        paymentType: PaymentType.HOTEL_COLLECT, // Added missing field
        bookingStatus: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
        currency: 'USD',
        contactEmail: 'create@test.com',
        commission: '0',
        amountPaid: '0',
        children: 0,
    };
    const expectedBooking = { id: 'new-booking-id', ...createDto, tenantId: tenantId };

    it('should call bookingService.create with correct DTO and user context, and return the result', async () => {
      service.create.mockResolvedValue(expectedBooking);
      // Pass mockReq to the controller method
      const result = await controller.create(createDto, mockReq);
      // Expect service to be called with DTO and user from mockReq
      expect(service.create).toHaveBeenCalledWith(createDto, mockReq.user);
      expect(result).toEqual(expectedBooking);
    });
  });

  // --- Test GET /bookings --- 
  describe('findAll', () => {
    const mockBookings = [{ id: 'b1', property: { name: 'P1' } }, { id: 'b2', property: { name: 'P2' } }];

    it('should call bookingService.findAll with user context and return the result', async () => {
      service.findAll.mockResolvedValue(mockBookings);
      // Pass mockReq to the controller method
      const result = await controller.findAll(mockReq);
      // Expect service to be called with user from mockReq
      expect(service.findAll).toHaveBeenCalledWith(mockReq.user);
      expect(result).toEqual(mockBookings);
    });
  });

  // Removed tests for non-existent endpoints: findAllForTenant, findAllByProperty, findAllByRoomType

  // --- Test GET /bookings/:id --- 
  describe('findOne', () => {
    const mockBooking = { id: bookingId, guestName: 'Test FindOne' };

    it('should call bookingService.findOne with correct id and user context, and return the result', async () => {
      service.findOne.mockResolvedValue(mockBooking);
      // Pass mockReq to the controller method
      const result = await controller.findOne(bookingId, mockReq);
      // Expect service to be called with id and user from mockReq
      expect(service.findOne).toHaveBeenCalledWith(bookingId, mockReq.user);
      expect(result).toEqual(mockBooking);
    });
  });

  // --- Test PATCH /bookings/:id --- 
  describe('update', () => {
    const updateDto: UpdateBookingDto = { guestName: 'Updated Name', bookingStatus: BookingStatus.CONFIRMED };
    const updatedBooking = { id: bookingId, guestName: 'Updated Name', bookingStatus: BookingStatus.CONFIRMED };

    it('should call bookingService.update with correct id, DTO, and user context, and return the result', async () => {
      service.update.mockResolvedValue(updatedBooking);
      // Pass mockReq to the controller method
      const result = await controller.update(bookingId, updateDto, mockReq);
      // Expect service to be called with id, DTO, and user from mockReq
      expect(service.update).toHaveBeenCalledWith(bookingId, updateDto, mockReq.user);
      expect(result).toEqual(updatedBooking);
    });
  });

  // --- Test DELETE /bookings/:id --- 
  describe('remove', () => {
    const removedBooking = { id: bookingId, guestName: 'Deleted Booking' };

    it('should call bookingService.remove with correct id and user context, and return the result', async () => {
      service.remove.mockResolvedValue(removedBooking);
      // Pass mockReq to the controller method
      const result = await controller.remove(bookingId, mockReq);
      // Expect service to be called with id and user from mockReq
      expect(service.remove).toHaveBeenCalledWith(bookingId, mockReq.user);
      expect(result).toEqual(removedBooking);
    });
  });

});

