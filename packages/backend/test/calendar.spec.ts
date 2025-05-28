import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createTestData } from './helpers/seed';
import { resetDatabase } from './helpers/reset';
import { getAuthHeader } from './helpers/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Calendar/Booking Module Tests', () => {
  let app: INestApplication;
  let testData: any;

  beforeAll(async () => {
    // Create the testing module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Reset database and create fresh test data
    await resetDatabase();
    testData = await createTestData();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('PATCH /bookings/:id (Update Booking Dates)', () => {
    it('should update booking check-in and check-out dates', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Find a booking from PARTNER_A's tenant
      const booking = await prisma.booking.findFirst({
        where: {
          tenantId: testData.tenants.tenantA.id,
          property: {
            ownerId: testData.users.partnerA.id
          }
        }
      });
      
      // New dates for the booking
      const newCheckIn = new Date('2025-07-01');
      const newCheckOut = new Date('2025-07-05');
      
      const updateData = {
        checkIn: newCheckIn.toISOString(),
        checkOut: newCheckOut.toISOString()
      };
      
      const response = await request(app.getHttpServer())
        .patch(`/bookings/${booking.id}`)
        .set(authHeader)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(new Date(response.body.checkIn).toISOString().split('T')[0]).toBe(newCheckIn.toISOString().split('T')[0]);
      expect(new Date(response.body.checkOut).toISOString().split('T')[0]).toBe(newCheckOut.toISOString().split('T')[0]);
      
      // Verify audit log was created for this action
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          action: 'UPDATE_BOOKING_DATE',
          resourceId: booking.id,
          userId: testData.users.partnerA.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      expect(auditLog).toBeTruthy();
      expect(auditLog.resource).toBe("BOOKING"); // Corrected field name
      
      // Check metadata contains before/after dates
      const metadata = JSON.parse(auditLog.metadata as string); // Added type assertion
      expect(metadata.before).toBeDefined();
      expect(metadata.after).toBeDefined();
      expect(metadata.after.checkIn).toContain('2025-07-01');
      expect(metadata.after.checkOut).toContain('2025-07-05');
    });

    it('PARTNER cannot update booking dates for property they do not own', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Create a property owned by someone else but in the same tenant
      const newProperty = await prisma.property.create({
        data: {
          name: 'Property C',
          address: '789 Test Blvd',
          owner: { connect: { id: testData.users.staffA.id } }, // Connect owner relation
          tenant: { connect: { id: testData.tenants.tenantA.id } }, // Connect tenant relation
          // userId is missing, assuming it should be staffA? Let's add it.
          user: { connect: { id: testData.users.staffA.id } } // Connect managing user relation
          // Removed ownerId, tenantId, userId as they are inferred from connect
        }
      });
      
      // Create a booking for this property
      const newBooking = await prisma.booking.create({
        data: {
          guestName: 'Test Guest',
          contactPhone: '0123456789', // Added missing required field
          checkIn: new Date('2025-07-01'),
          checkOut: new Date('2025-07-05'),
          nights: 4, // Added missing required field (calculated)
          adults: 2, // Added missing required field
          property: { connect: { id: newProperty.id } }, // Connect property relation
          tenant: { connect: { id: testData.tenants.tenantA.id } }, // Connect tenant relation
          user: { connect: { id: testData.users.partnerA.id } }, // Connect user relation (assuming partnerA created it)
          roomType: { connect: { id: testData.roomTypes.roomTypeA.id } }, // Added missing required field
          // Removed propertyId, tenantId, userId, roomTypeId
          totalAmount: 400,
          netRevenue: 400, // Added missing required field (assuming 0 commission)
          outstandingBalance: 400, // Added missing required field (assuming 0 paid)
          channel: 'DIRECT', // Added missing required field
          paymentMethod: 'HOTEL_COLLECT', // Added missing required field
          // Removed status and source as they are invalid
        }
      });
      
      // Try to update the booking dates
      const updateData = {
        checkIn: new Date('2025-07-10').toISOString(),
        checkOut: new Date('2025-07-15').toISOString()
      };
      
      const response = await request(app.getHttpServer())
        .patch(`/bookings/${newBooking.id}`)
        .set(authHeader)
        .send(updateData);
      
      expect(response.status).toBe(403);
    });

    it('STAFF cannot update booking dates', async () => {
      // Get auth header for STAFF
      const authHeader = await getAuthHeader('STAFF');
      
      // Find a booking from STAFF's tenant
      const booking = await prisma.booking.findFirst({
        where: {
          tenantId: testData.tenants.tenantA.id
        }
      });
      
      // Try to update the booking dates
      const updateData = {
        checkIn: new Date('2025-07-10').toISOString(),
        checkOut: new Date('2025-07-15').toISOString()
      };
      
      const response = await request(app.getHttpServer())
        .patch(`/bookings/${booking.id}`)
        .set(authHeader)
        .send(updateData);
      
      expect(response.status).toBe(403);
    });

    it('SUPER_ADMIN can update any booking dates', async () => {
      // Get auth header for SUPER_ADMIN
      const authHeader = await getAuthHeader('SUPER_ADMIN');
      
      // Find a booking from PARTNER_B's tenant
      const booking = await prisma.booking.findFirst({
        where: {
          tenantId: testData.tenants.tenantB.id
        }
      });
      
      // New dates for the booking
      const newCheckIn = new Date('2025-08-01');
      const newCheckOut = new Date('2025-08-05');
      
      const updateData = {
        checkIn: newCheckIn.toISOString(),
        checkOut: newCheckOut.toISOString()
      };
      
      const response = await request(app.getHttpServer())
        .patch(`/bookings/${booking.id}`)
        .set(authHeader)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(new Date(response.body.checkIn).toISOString().split('T')[0]).toBe(newCheckIn.toISOString().split('T')[0]);
      expect(new Date(response.body.checkOut).toISOString().split('T')[0]).toBe(newCheckOut.toISOString().split('T')[0]);
      
      // Verify audit log was created for this action
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          action: 'UPDATE_BOOKING_DATE',
          resourceId: booking.id,
          userId: testData.users.superAdmin.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      expect(auditLog).toBeTruthy();
    });
  });

  describe('POST /bookings/assign-room', () => {
    it('should assign booking to a different room', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Find a booking from PARTNER_A's tenant
      const booking = await prisma.booking.findFirst({
        where: {
          tenantId: testData.tenants.tenantA.id,
          property: {
            ownerId: testData.users.partnerA.id
          }
        }
      });
      
      // Assign to a new room
      const assignData = {
        bookingId: booking.id,
        roomNumber: 'Room 101',
        notes: 'Guest requested a room with a view'
      };
      
      const response = await request(app.getHttpServer())
        .post('/bookings/assign-room')
        .set(authHeader)
        .send(assignData);
      
      expect(response.status).toBe(200);
      expect(response.body.roomNumber).toBe('Room 101');
      
      // Verify audit log was created for this action
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          action: 'ASSIGN_BOOKING_ROOM',
          resourceId: booking.id,
          userId: testData.users.partnerA.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      expect(auditLog).toBeTruthy();
      expect(auditLog.resource).toBe("BOOKING"); // Corrected field name
      
      // Check metadata contains room assignment details
      const metadata = JSON.parse(auditLog.metadata as string); // Added type assertion
      expect(metadata.roomNumber).toBe("Room 101");
      expect(metadata.notes).toBe('Guest requested a room with a view');
    });

    it('PARTNER cannot assign room for booking they do not own', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Create a property owned by someone else but in the same tenant
      const newProperty = await prisma.property.create({
        data: {
          name: 'Property D',
          address: '101 Test Circle',
          owner: { connect: { id: testData.users.staffA.id } }, // Connect owner relation
          tenant: { connect: { id: testData.tenants.tenantA.id } }, // Connect tenant relation
          user: { connect: { id: testData.users.staffA.id } } // Connect managing user relation
          // Removed ownerId, tenantId, userId
        }
      });
      
      // Create a booking for this property
      const newBooking = await prisma.booking.create({
            data: {
          guestName: 'Another Guest',
          contactPhone: '0987654321', // Added missing required field
          checkIn: new Date('2025-08-01'),
          checkOut: new Date('2025-08-03'),
          nights: 2, // Added missing required field (calculated)
          adults: 1, // Added missing required field
          property: { connect: { id: newProperty.id } }, // Connect property relation
          tenant: { connect: { id: testData.tenants.tenantA.id } }, // Connect tenant relation
          user: { connect: { id: testData.users.staffA.id } }, // Connect user relation (assuming staffA created it)
          roomType: { connect: { id: testData.roomTypes.roomTypeA.id } }, // Connect roomType relation (assuming testData has roomTypeA)
          // Removed propertyId, tenantId, userId, roomTypeId
          totalAmount: 350,
          netRevenue: 350, // Added missing required field (assuming 0 commission)
          outstandingBalance: 350, // Added missing required field (assuming 0 paid)
          channel: 'DIRECT', // Added missing required field
          paymentMethod: 'HOTEL_COLLECT', // Added missing required field
          // Removed status and source as they are invalid
        }
      });;
      
      // Try to assign a room
      const assignData = {
        bookingId: newBooking.id,
        roomNumber: 'Room 202',
        notes: 'Test assignment'
      };
      
      const response = await request(app.getHttpServer())
        .post('/bookings/assign-room')
        .set(authHeader)
        .send(assignData);
      
      expect(response.status).toBe(403);
    });

    it('STAFF cannot assign rooms', async () => {
      // Get auth header for STAFF
      const authHeader = await getAuthHeader('STAFF');
      
      // Find a booking from STAFF's tenant
      const booking = await prisma.booking.findFirst({
        where: {
          tenantId: testData.tenants.tenantA.id
        }
      });
      
      // Try to assign a room
      const assignData = {
        bookingId: booking.id,
        roomNumber: 'Room 303',
        notes: 'Staff assignment attempt'
      };
      
      const response = await request(app.getHttpServer())
        .post('/bookings/assign-room')
        .set(authHeader)
        .send(assignData);
      
      expect(response.status).toBe(403);
    });

    it('SUPER_ADMIN can assign room for any booking', async () => {
      // Get auth header for SUPER_ADMIN
      const authHeader = await getAuthHeader('SUPER_ADMIN');
      
      // Find a booking from PARTNER_B's tenant
      const booking = await prisma.booking.findFirst({
        where: {
          tenantId: testData.tenants.tenantB.id
        }
      });
      
      // Assign to a new room
      const assignData = {
        bookingId: booking.id,
        roomNumber: 'Room 505',
        notes: 'Admin assignment'
      };
      
      const response = await request(app.getHttpServer())
        .post('/bookings/assign-room')
        .set(authHeader)
        .send(assignData);
      
      expect(response.status).toBe(200);
      expect(response.body.roomNumber).toBe('Room 505');
      
      // Verify audit log was created for this action
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          action: 'ASSIGN_BOOKING_ROOM',
          resourceId: booking.id,
          userId: testData.users.superAdmin.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      expect(auditLog).toBeTruthy();
    });
  });
});
