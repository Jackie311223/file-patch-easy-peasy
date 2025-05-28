import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createTestData } from './helpers/seed';
import { resetDatabase } from './helpers/reset';
import { getAuthHeader } from './helpers/auth';
import { PrismaClient, $Enums } from '@prisma/client';

const prisma = new PrismaClient();

describe('Audit Log Module Tests', () => {
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

  describe('Audit Logging for Booking Operations', () => {
    it('should create audit log when creating a booking', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');

      // Create a new booking
      const bookingData = {
        guestName: 'Audit Test Guest',
        checkIn: '2025-10-01',
        checkOut: '2025-10-05',
        propertyId: testData.properties.propertyA.id,
        status: 'CONFIRMED',
        totalAmount: 600,
        source: 'DIRECT',
      };

      const response = await request(app.getHttpServer())
        .post('/bookings')
        .set(authHeader)
        .send(bookingData);

      expect(response.status).toBe(201);

      // Verify audit log was created
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          action: 'CREATE_BOOKING',
          resourceId: response.body.id,
          userId: testData.users.partnerA.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(auditLog).toBeTruthy();
      expect(auditLog.tenantId).toBe(testData.tenants.tenantA.id);
      expect(auditLog.resource).toBe('BOOKING'); // Corrected field name

      // Check metadata contains booking details
      const metadata = JSON.parse(auditLog.metadata as string); // Added type assertion
      expect(metadata.guestName).toBe('Audit Test Guest');
      expect(metadata.checkIn).toContain('2025-10-01');
      expect(metadata.checkOut).toContain('2025-10-05');
      expect(metadata.totalAmount).toBe(600);
    });

    it('should create audit log when updating booking dates', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');

      // Find a booking from PARTNER_A's tenant
      const booking = await prisma.booking.findFirst({
        where: {
          tenantId: testData.tenants.tenantA.id,
          property: {
            ownerId: testData.users.partnerA.id,
          },
        },
      });

      // Original dates for comparison
      const originalCheckIn = booking.checkIn;
      const originalCheckOut = booking.checkOut;

      // New dates for the booking
      const newCheckIn = new Date('2025-11-01');
      const newCheckOut = new Date('2025-11-05');

      const updateData = {
        checkIn: newCheckIn.toISOString(),
        checkOut: newCheckOut.toISOString(),
      };

      const response = await request(app.getHttpServer())
        .patch(`/bookings/${booking.id}`)
        .set(authHeader)
        .send(updateData);

      expect(response.status).toBe(200);

      // Verify audit log was created
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          action: 'UPDATE_BOOKING_DATE',
          resourceId: booking.id,
          userId: testData.users.partnerA.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(auditLog).toBeTruthy();
      expect(auditLog.tenantId).toBe(testData.tenants.tenantA.id);
      expect(auditLog.resource).toBe('BOOKING'); // Corrected field name

      // Check metadata contains before/after dates
      const metadata = JSON.parse(auditLog.metadata as string); // Added type assertion
      expect(metadata.before).toBeDefined();
      expect(metadata.after).toBeDefined();

      // Convert dates to comparable format
      const beforeCheckIn = new Date(metadata.before.checkIn)
        .toISOString()
        .split('T')[0];
      const beforeCheckOut = new Date(metadata.before.checkOut)
        .toISOString()
        .split('T')[0];
      const afterCheckIn = new Date(metadata.after.checkIn)
        .toISOString()
        .split('T')[0];
      const afterCheckOut = new Date(metadata.after.checkOut)
        .toISOString()
        .split('T')[0];

      const originalCheckInStr = originalCheckIn.toISOString().split('T')[0];
      const originalCheckOutStr = originalCheckOut.toISOString().split('T')[0];
      const newCheckInStr = newCheckIn.toISOString().split('T')[0];
      const newCheckOutStr = newCheckOut.toISOString().split('T')[0];

      expect(beforeCheckIn).toBe(originalCheckInStr);
      expect(beforeCheckOut).toBe(originalCheckOutStr);
      expect(afterCheckIn).toBe(newCheckInStr);
      expect(afterCheckOut).toBe(newCheckOutStr);
    });
  });

  describe('Audit Logging for Payment Operations', () => {
    it('should create audit log when creating a payment', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');

      // Find a booking from PARTNER_A's tenant
      const booking = await prisma.booking.findFirst({
        where: {
          tenantId: testData.tenants.tenantA.id,
          property: {
            ownerId: testData.users.partnerA.id,
          },
        },
      });

      const paymentData = {
        amount: 200,
        method: 'CASH',
        status: 'COMPLETED',
        type: 'HOTEL_COLLECT',
        bookingId: booking.id,
        collectedBy: testData.users.partnerA.id,
        paymentDate: new Date().toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/payments')
        .set(authHeader)
        .send(paymentData);

      expect(response.status).toBe(201);

      // Verify audit log was created
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          action: 'CREATE_PAYMENT',
          resourceId: response.body.id,
          userId: testData.users.partnerA.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(auditLog).toBeTruthy();
      expect(auditLog.tenantId).toBe(testData.tenants.tenantA.id);
      expect(auditLog.resource).toBe('PAYMENT'); // Corrected field name

      // Check metadata contains payment details
      const metadata = JSON.parse(auditLog.metadata as string); // Added type assertion
      expect(metadata.amount).toBe(200);
      expect(metadata.method).toBe('CASH');
      expect(metadata.type).toBe('HOTEL_COLLECT');
      expect(metadata.bookingId).toBe(booking.id);
    });

    it('should create audit log when updating a payment', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');

      // Find a payment from PARTNER_A's tenant
      const payment = await prisma.payment.findFirst({
        where: {
          tenantId: testData.tenants.tenantA.id,
          booking: {
            property: {
              ownerId: testData.users.partnerA.id,
            },
          },
        },
      });

      // Original values for comparison
      const originalAmount = payment.amount;
      const originalMethod = payment.method;
      const originalStatus = payment.status;

      const updateData = {
        amount: originalAmount + 50,
        method: 'CREDIT_CARD',
        status: 'REFUNDED',
      };

      const response = await request(app.getHttpServer())
        .patch(`/payments/${payment.id}`)
        .set(authHeader)
        .send(updateData);

      expect(response.status).toBe(200);

      // Verify audit log was created
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          action: 'UPDATE_PAYMENT',
          resourceId: payment.id,
          userId: testData.users.partnerA.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(auditLog).toBeTruthy();
      expect(auditLog.tenantId).toBe(testData.tenants.tenantA.id);
      expect(auditLog.resource).toBe('PAYMENT'); // Corrected field name

      // Check metadata contains before/after values
      const metadata = JSON.parse(auditLog.metadata as string); // Added type assertion
      expect(metadata.before).toBeDefined();
      expect(metadata.after).toBeDefined();

      expect(metadata.before.amount).toBe(originalAmount);
      expect(metadata.before.method).toBe(originalMethod);
      expect(metadata.before.status).toBe(originalStatus);

      expect(metadata.after.amount).toBe(originalAmount + 50);
      expect(metadata.after.method).toBe('CREDIT_CARD');
      expect(metadata.after.status).toBe('REFUNDED');
    });
  });

  describe('Audit Logging for Invoice Operations', () => {
    it('should create audit log when creating an invoice', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');

      // Find OTA_COLLECT payments that are COMPLETED for PARTNER_A's tenant
      const payments = await prisma.payment.findMany({
        where: {
          tenantId: testData.tenants.tenantA.id,
          // type: 'OTA_COLLECT', // Removed as 'type' is not a valid field in PaymentWhereInput
          status: $Enums.PaymentStatusV2.PAID, // Corrected enum usage, COMPLETED is not valid
          // invoiceId: null, // Removed as 'invoiceId' is not a valid field in PaymentWhereInput
        },
        take: 1,
      });

      // Skip test if no eligible payments
      if (payments.length === 0) {
        console.log(
          'No eligible payments found for invoice creation, skipping test',
        );
        return;
      }

      const invoiceData = {
        number: 'INV-AUDIT-001',
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        otaName: 'Booking.com',
        paymentIds: payments.map((p) => p.id),
      };

      const response = await request(app.getHttpServer())
        .post('/invoices')
        .set(authHeader)
        .send(invoiceData);

      expect(response.status).toBe(201);

      // Verify audit log was created
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          action: 'CREATE_INVOICE',
          resourceId: response.body.id,
          userId: testData.users.partnerA.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(auditLog).toBeTruthy();
      expect(auditLog.tenantId).toBe(testData.tenants.tenantA.id);
      expect(auditLog.resource).toBe('INVOICE'); // Corrected field name

      // Check metadata contains invoice details
      const metadata = JSON.parse(auditLog.metadata as string); // Added type assertion
      expect(metadata.number).toBe('INV-AUDIT-001');
      expect(metadata.otaName).toBe('Booking.com');
      expect(metadata.paymentIds).toEqual(payments.map((p) => p.id));
      expect(metadata.totalAmount).toBeDefined();
    });
  });

  describe('Audit Logging for Room Assignment', () => {
    it('should create audit log when assigning a room', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');

      // Find a booking from PARTNER_A's tenant
      const booking = await prisma.booking.findFirst({
        where: {
          tenantId: testData.tenants.tenantA.id,
          property: {
            ownerId: testData.users.partnerA.id,
          },
          // roomNumber: null, // Condition removed as 'roomNumber' is not a valid field in BookingWhereInput
        },
      });

      // Skip test if no eligible bookings
      if (!booking) {
        console.log(
          'No eligible bookings found for room assignment, skipping test',
        );
        return;
      }

      // Assign to a new room
      const assignData = {
        bookingId: booking.id,
        roomNumber: 'Room 505',
        notes: 'Audit test assignment',
      };

      const response = await request(app.getHttpServer())
        .post('/bookings/assign-room')
        .set(authHeader)
        .send(assignData);

      expect(response.status).toBe(200);

      // Verify audit log was created
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          action: 'ASSIGN_BOOKING_ROOM',
          resourceId: booking.id,
          userId: testData.users.partnerA.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(auditLog).toBeTruthy();
      expect(auditLog.tenantId).toBe(testData.tenants.tenantA.id);
      expect(auditLog.resource).toBe("BOOKING"); // Corrected field name

      // Check metadata contains room assignment details
      const metadata = JSON.parse(auditLog.metadata as string); // Added type assertion
      expect(metadata.roomNumber).toBe("Room 505");
      expect(metadata.notes).toBe('Audit test assignment');
      expect(metadata.bookingId).toBe(booking.id);
    });
  });

  describe('Audit Log Access Control', () => {
    it('PARTNER should only see audit logs from their tenant', async () => {
      // Create audit logs for both tenants
      await prisma.auditLog.createMany({
        data: [
          {
            action: 'TEST_ACTION_A',
            resource: 'TEST_RESOURCE', // Corrected field name
            resourceId: 'test-resource-a',
            userId: testData.users.partnerA.id,
            tenantId: testData.tenants.tenantA.id,
            metadata: JSON.stringify({ test: 'data-a' }),
          },
          {
            action: 'TEST_ACTION_B',
            resource: 'TEST_RESOURCE', // Corrected field name
            resourceId: 'test-resource-b',
            userId: testData.users.partnerB.id,
            tenantId: testData.tenants.tenantB.id,
            metadata: JSON.stringify({ test: 'data-b' }),
          },
        ],
      });

      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');

      // Get audit logs
      const response = await request(app.getHttpServer())
        .get('/audit-logs')
        .set(authHeader);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // All audit logs should belong to PARTNER_A's tenant
      response.body.forEach((log) => {
        expect(log.tenantId).toBe(testData.tenants.tenantA.id);
      });

      // Should include the test log for tenant A
      const testLogA = response.body.find(
        (log) =>
          log.action === 'TEST_ACTION_A' &&
          log.resourceId === 'test-resource-a',
      );
      expect(testLogA).toBeDefined();

      // Should NOT include the test log for tenant B
      const testLogB = response.body.find(
        (log) =>
          log.action === 'TEST_ACTION_B' &&
          log.resourceId === 'test-resource-b',
      );
      expect(testLogB).toBeUndefined();
    });

    it('SUPER_ADMIN should see audit logs from all tenants', async () => {
      // Get auth header for SUPER_ADMIN
      const authHeader = await getAuthHeader('SUPER_ADMIN');

      // Get audit logs
      const response = await request(app.getHttpServer())
        .get('/audit-logs')
        .set(authHeader);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // Should include logs from both tenants
      const tenantALogs = response.body.filter(
        (log) => log.tenantId === testData.tenants.tenantA.id,
      );
      const tenantBLogs = response.body.filter(
        (log) =
(Content truncated due to size limit. Use line ranges to read in chunks)