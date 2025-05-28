import { Test, TestingModule } from '@nestjs/testing';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { GetCalendarDto } from './dto/get-calendar.dto';
import { UpdateBookingDatesDto } from './dto/update-booking-dates.dto';
import { AssignRoomDto } from './dto/assign-room.dto';

describe('CalendarController', () => {
  let controller: CalendarController;
  let service: CalendarService;

  const mockUser = {
    id: 'user-id-1',
    tenantId: 'tenant-id-1',
    role: UserRole.ADMIN,
  };

  const mockRequest = {
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarController],
      providers: [
        {
          provide: CalendarService,
          useValue: {
            getCalendarData: jest.fn(),
            updateBookingDates: jest.fn(),
            assignRoom: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CalendarController>(CalendarController);
    service = module.get<CalendarService>(CalendarService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCalendarData', () => {
    it('should call service.getCalendarData with correct parameters', async () => {
      const query: GetCalendarDto = {
        propertyId: 'property-id-1',
        startDate: '2025-05-01',
        endDate: '2025-05-31',
      };

      await controller.getCalendarData(query, mockRequest as any);
      expect(service.getCalendarData).toHaveBeenCalledWith(query, mockUser);
    });
  });

  describe('updateBookingDates', () => {
    it('should call service.updateBookingDates with correct parameters', async () => {
      const bookingId = 'booking-id-1';
      const dto: UpdateBookingDatesDto = {
        checkIn: '2025-05-10',
        checkOut: '2025-05-15',
      };

      await controller.updateBookingDates(bookingId, dto, mockRequest as any);
      expect(service.updateBookingDates).toHaveBeenCalledWith(bookingId, dto, mockUser);
    });
  });

  describe('assignRoom', () => {
    it('should call service.assignRoom with correct parameters', async () => {
      const dto: AssignRoomDto = {
        bookingId: 'booking-id-1',
        roomId: 'room-id-1',
      };

      await controller.assignRoom(dto, mockRequest as any);
      expect(service.assignRoom).toHaveBeenCalledWith(dto, mockUser);
    });
  });
});
