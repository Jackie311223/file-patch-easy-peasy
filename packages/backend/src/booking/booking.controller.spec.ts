import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './booking.controller';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Adjust path if needed
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Channel, PaymentMethod, BookingStatus, PaymentStatus, UserRole } from '@prisma/client';
import { ClassSerializerInterceptor, ForbiddenException, ExecutionContext } from '@nestjs/common'; // Import ExecutionContext
import { Reflector } from '@nestjs/core';

// Mock BookingService
const bookingServiceMock = {
  create: jest.fn(),
  findAllForUser: jest.fn(),
  findAllForTenant: jest.fn(), // Added mock for tenant endpoint
  findAllByProperty: jest.fn(),
  findAllByRoomType: jest.fn(), // Added mock for room type endpoint
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock request object with user including role and tenantId
const mockRequest = (userId?: string, role: UserRole = UserRole.MANAGER, tenantId: string = 'tenant-a-uuid') => ({
  // Return an object that mimics the structure NestJS uses
  switchToHttp: () => ({
    getRequest: () => ({
      user: userId ? { userId, id: userId, role, tenantId } : undefined, // Use 'id' as commonly used, ensure undefined if no userId
    }),
  }),
} as unknown as ExecutionContext); // Cast to ExecutionContext


describe('BookingController', () => {
  let controller: BookingsController;
  let service: typeof bookingServiceMock;

  const userId = 'user-test-id';
  const tenantId = 'tenant-a-uuid';
  const propertyId = 'prop-test-id';
  const roomTypeId = 'rt-test-id'; // Added roomTypeId
  const bookingId = 'booking-test-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        { provide: BookingService, useValue: bookingServiceMock },
        // Provide Reflector if ClassSerializerInterceptor needs it, although we mock the interceptor
        { provide: Reflector, useValue: { get: jest.fn() } }, 
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ 
        canActivate: (context: ExecutionContext) => {
            // Attach mock user to request within the mock guard
            const req = context.switchToHttp().getRequest();
            // Simulate attaching user based on a mock logic, e.g., always attach for these tests
            req.user = { userId: userId, id: userId, role: UserRole.MANAGER, tenantId: tenantId }; 
            return true;
        }
     })
    .overrideInterceptor(ClassSerializerInterceptor) // Mock the interceptor
    .useValue({ intercept: jest.fn((context, next) => next.handle()) })
    .compile();

    controller = module.get<BookingsController>(BookingsController);
    service = module.get(BookingService);
    jest.clearAllMocks(); // Use jest.clearAllMocks with Jest
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Test POST /bookings --- 
  describe('create', () => {
    const createDto: CreateBookingDto = {
        propertyId: propertyId,
        roomTypeId: roomTypeId, // Added missing roomTypeId
        guestName: 'Test Create',
        contactPhone: '111222333',
        channel: Channel.DIRECT,
        checkIn: '2024-09-01T00:00:00Z',
        checkOut: '2024-09-03T00:00:00Z',
        adults: 2,
        totalAmount: '300.50',
        paymentMethod: PaymentMethod.CASH,
        bookingStatus: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
        currency: 'USD',
        contactEmail: 'create@test.com',
        commission: '0',
        amountPaid: '0',
        children: 0,
    };
    const expectedBooking = { id: 'new-booking-id', ...createDto, tenantId: tenantId };

    it('should call bookingService.create with correct params and return the result', async () => {
      service.create.mockResolvedValue(expectedBooking);
      // The guard mock will attach the user, so we just need to pass the DTO
      const req = { user: { userId: userId, id: userId, role: UserRole.MANAGER, tenantId: tenantId } }; // Mimic request object structure

      const result = await controller.create(createDto, req);

      // Expect service to be called with DTO, userId, and userRole from the mocked request user
      expect(service.create).toHaveBeenCalledWith(createDto, userId, UserRole.MANAGER);
      expect(result).toEqual(expectedBooking);
    });

    // Add test for missing user ID scenario - fixed assertion
    it('should throw ForbiddenException if userId is missing in request', async () => {
      const reqWithoutUser = { user: {} }; // Request without userId
      
      // Correct way to test for exceptions in Jest
      await expect(async () => {
        await controller.create(createDto, reqWithoutUser);
      }).rejects.toThrow(ForbiddenException);
      
      expect(service.create).not.toHaveBeenCalled();
    });
    
    // Add test for different user roles
    it('should pass ADMIN role to service when user is ADMIN', async () => {
      service.create.mockResolvedValue(expectedBooking);
      const adminReq = { user: { userId: userId, id: userId, role: UserRole.ADMIN, tenantId: tenantId } };
      
      await controller.create(createDto, adminReq);
      
      expect(service.create).toHaveBeenCalledWith(createDto, userId, UserRole.ADMIN);
    });
  });

  // --- Test GET /bookings/all --- 
  describe('findAllForUser', () => {
    const mockBookings = [{ id: 'b1', property: { name: 'P1' } }, { id: 'b2', property: { name: 'P2' } }];

    it('should call bookingService.findAllForUser with correct params and return the result', async () => {
      service.findAllForUser.mockResolvedValue(mockBookings);
      const req = { user: { userId: userId, id: userId, role: UserRole.MANAGER, tenantId: tenantId } };

      const result = await controller.findAllForUser(req);

      expect(service.findAllForUser).toHaveBeenCalledWith(userId, UserRole.MANAGER);
      expect(result).toEqual(mockBookings);
    });
    
    // Add test for missing user ID scenario - fixed assertion
    it('should throw ForbiddenException if userId is missing in request', async () => {
      const reqWithoutUser = { user: {} }; // Request without userId
      
      // Correct way to test for exceptions in Jest
      await expect(async () => {
        await controller.findAllForUser(reqWithoutUser);
      }).rejects.toThrow(ForbiddenException);
      
      expect(service.findAllForUser).not.toHaveBeenCalled();
    });
    
    // Add test for SUPER_ADMIN role
    it('should pass SUPER_ADMIN role to service when user is SUPER_ADMIN', async () => {
      service.findAllForUser.mockResolvedValue(mockBookings);
      const superAdminReq = { user: { userId: userId, id: userId, role: UserRole.SUPER_ADMIN, tenantId: tenantId } };
      
      await controller.findAllForUser(superAdminReq);
      
      expect(service.findAllForUser).toHaveBeenCalledWith(userId, UserRole.SUPER_ADMIN);
    });
  });
  
  // --- Test GET /bookings/tenant/:tenantId --- 
  describe('findAllForTenant', () => {
    const targetTenantId = 'target-tenant-id';
    const mockBookings = [{ id: 'b5', tenantId: targetTenantId }];

    it('should call bookingService.findAllForTenant with correct params and return the result', async () => {
      service.findAllForTenant.mockResolvedValue(mockBookings);
      const req = { user: { userId: userId, id: userId, role: UserRole.ADMIN, tenantId: tenantId } }; // Assume ADMIN role needed

      const result = await controller.findAllForTenant(targetTenantId, req);

      expect(service.findAllForTenant).toHaveBeenCalledWith(targetTenantId, userId, UserRole.ADMIN);
      expect(result).toEqual(mockBookings);
    });
    
    // Add test for missing user ID scenario - fixed assertion
    it('should throw ForbiddenException if userId is missing in request', async () => {
      const reqWithoutUser = { user: {} }; // Request without userId
      
      // Correct way to test for exceptions in Jest
      await expect(async () => {
        await controller.findAllForTenant(targetTenantId, reqWithoutUser);
      }).rejects.toThrow(ForbiddenException);
      
      expect(service.findAllForTenant).not.toHaveBeenCalled();
    });
    
    // Add test for SUPER_ADMIN role
    it('should pass SUPER_ADMIN role to service when user is SUPER_ADMIN', async () => {
      service.findAllForTenant.mockResolvedValue(mockBookings);
      const superAdminReq = { user: { userId: userId, id: userId, role: UserRole.SUPER_ADMIN, tenantId: tenantId } };
      
      await controller.findAllForTenant(targetTenantId, superAdminReq);
      
      expect(service.findAllForTenant).toHaveBeenCalledWith(targetTenantId, userId, UserRole.SUPER_ADMIN);
    });
  });

  // --- Test GET /bookings/property/:propertyId --- 
  describe('findAllByProperty', () => {
    const mockBookings = [{ id: 'b3', propertyId: propertyId }];

    it('should call bookingService.findAllByProperty with correct params and return the result', async () => {
      service.findAllByProperty.mockResolvedValue(mockBookings);
      const req = { user: { userId: userId, id: userId, role: UserRole.MANAGER, tenantId: tenantId } };

      const result = await controller.findAllByProperty(propertyId, req);

      expect(service.findAllByProperty).toHaveBeenCalledWith(propertyId, userId, UserRole.MANAGER);
      expect(result).toEqual(mockBookings);
    });
    
    // Add test for missing user ID scenario - fixed assertion
    it('should throw ForbiddenException if userId is missing in request', async () => {
      const reqWithoutUser = { user: {} }; // Request without userId
      
      // Correct way to test for exceptions in Jest
      await expect(async () => {
        await controller.findAllByProperty(propertyId, reqWithoutUser);
      }).rejects.toThrow(ForbiddenException);
      
      expect(service.findAllByProperty).not.toHaveBeenCalled();
    });
  });
  
  // --- Test GET /bookings/room-type/:roomTypeId --- 
  describe('findAllByRoomType', () => {
    const mockBookings = [{ id: 'b4', roomTypeId: roomTypeId }];

    it('should call bookingService.findAllByRoomType with correct params and return the result', async () => {
      service.findAllByRoomType.mockResolvedValue(mockBookings);
      const req = { user: { userId: userId, id: userId, role: UserRole.MANAGER, tenantId: tenantId } };

      const result = await controller.findAllByRoomType(roomTypeId, req);

      expect(service.findAllByRoomType).toHaveBeenCalledWith(roomTypeId, userId, UserRole.MANAGER);
      expect(result).toEqual(mockBookings);
    });
    
    // Add test for missing user ID scenario - fixed assertion
    it('should throw ForbiddenException if userId is missing in request', async () => {
      const reqWithoutUser = { user: {} }; // Request without userId
      
      // Correct way to test for exceptions in Jest
      await expect(async () => {
        await controller.findAllByRoomType(roomTypeId, reqWithoutUser);
      }).rejects.toThrow(ForbiddenException);
      
      expect(service.findAllByRoomType).not.toHaveBeenCalled();
    });
  });

  // --- Test GET /bookings/:id --- 
  describe('findOne', () => {
    const mockBooking = { id: bookingId, guestName: 'Test FindOne' };

    it('should call bookingService.findOne with correct params and return the result', async () => {
      service.findOne.mockResolvedValue(mockBooking);
      const req = { user: { userId: userId, id: userId, role: UserRole.MANAGER, tenantId: tenantId } };

      const result = await controller.findOne(bookingId, req);

      expect(service.findOne).toHaveBeenCalledWith(bookingId, userId, UserRole.MANAGER);
      expect(result).toEqual(mockBooking);
    });
    
    // Add test for missing user ID scenario - fixed assertion
    it('should throw ForbiddenException if userId is missing in request', async () => {
      const reqWithoutUser = { user: {} }; // Request without userId
      
      // Correct way to test for exceptions in Jest
      await expect(async () => {
        await controller.findOne(bookingId, reqWithoutUser);
      }).rejects.toThrow(ForbiddenException);
      
      expect(service.findOne).not.toHaveBeenCalled();
    });
  });

  // --- Test PATCH /bookings/:id --- 
  describe('update', () => {
    const updateDto: UpdateBookingDto = { guestName: 'Updated Name', bookingStatus: BookingStatus.CONFIRMED };
    const updatedBooking = { id: bookingId, guestName: 'Updated Name', bookingStatus: BookingStatus.CONFIRMED };

    it('should call bookingService.update with correct params and return the result', async () => {
      service.update.mockResolvedValue(updatedBooking);
      const req = { user: { userId: userId, id: userId, role: UserRole.MANAGER, tenantId: tenantId } };

      const result = await controller.update(bookingId, updateDto, req);

      expect(service.update).toHaveBeenCalledWith(bookingId, updateDto, userId, UserRole.MANAGER);
      expect(result).toEqual(updatedBooking);
    });
    
    // Add test for missing user ID scenario - fixed assertion
    it('should throw ForbiddenException if userId is missing in request', async () => {
      const reqWithoutUser = { user: {} }; // Request without userId
      
      // Correct way to test for exceptions in Jest
      await expect(async () => {
        await controller.update(bookingId, updateDto, reqWithoutUser);
      }).rejects.toThrow(ForbiddenException);
      
      expect(service.update).not.toHaveBeenCalled();
    });
  });

  // --- Test DELETE /bookings/:id --- 
  describe('remove', () => {
    const removedBooking = { id: bookingId, guestName: 'Deleted Booking' };

    it('should call bookingService.remove with correct params and return the result', async () => {
      service.remove.mockResolvedValue(removedBooking);
      const req = { user: { userId: userId, id: userId, role: UserRole.MANAGER, tenantId: tenantId } };

      const result = await controller.remove(bookingId, req);

      expect(service.remove).toHaveBeenCalledWith(bookingId, userId, UserRole.MANAGER);
      expect(result).toEqual(removedBooking);
    });
    
    // Add test for missing user ID scenario - fixed assertion
    it('should throw ForbiddenException if userId is missing in request', async () => {
      const reqWithoutUser = { user: {} }; // Request without userId
      
      // Correct way to test for exceptions in Jest
      await expect(async () => {
        await controller.remove(bookingId, reqWithoutUser);
      }).rejects.toThrow(ForbiddenException);
      
      expect(service.remove).not.toHaveBeenCalled();
    });
  });

});
