import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createTestData } from './helpers/seed';
import { resetDatabase } from './helpers/reset';
import { getAuthHeader } from './helpers/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Payments Module Tests', () => {
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

  describe('POST /payments', () => {
    it('should create HOTEL_COLLECT payment with collectedBy field', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      const paymentData = {
        amount: 200,
        method: 'CASH',
        status: 'COMPLETED',
        type: 'HOTEL_COLLECT',
        bookingId: testData.bookings.bookingA1.id,
        collectedBy: testData.users.partnerA.id,
        paymentDate: new Date().toISOString()
      };
      
      const response = await request(app.getHttpServer())
        .post('/payments')
        .set(authHeader)
        .send(paymentData);
      
      expect(response.status).toBe(201);
      expect(response.body.type).toBe('HOTEL_COLLECT');
      expect(response.body.collectedBy).toBe(testData.users.partnerA.id);
      expect(response.body.amount).toBe(200);
    });

    it('should create OTA_COLLECT payment with receivedFrom field and valid paymentDate', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Get checkout date for booking
      const booking = await prisma.booking.findUnique({
        where: { id: testData.bookings.bookingA2.id }
      });
      
      // Payment date must be >= checkout date for OTA_COLLECT
      const paymentDate = new Date(booking.checkOut);
      paymentDate.setDate(paymentDate.getDate() + 5); // 5 days after checkout
      
      const paymentData = {
        amount: 300,
        method: 'BANK_TRANSFER',
        status: 'COMPLETED',
        type: 'OTA_COLLECT',
        bookingId: testData.bookings.bookingA2.id,
        receivedFrom: 'Booking.com',
        paymentDate: paymentDate.toISOString()
      };
      
      const response = await request(app.getHttpServer())
        .post('/payments')
        .set(authHeader)
        .send(paymentData);
      
      expect(response.status).toBe(201);
      expect(response.body.type).toBe('OTA_COLLECT');
      expect(response.body.receivedFrom).toBe('Booking.com');
      expect(response.body.amount).toBe(300);
    });

    it('should return 400 when creating HOTEL_COLLECT payment without collectedBy', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      const paymentData = {
        amount: 200,
        method: 'CASH',
        status: 'COMPLETED',
        type: 'HOTEL_COLLECT',
        bookingId: testData.bookings.bookingA1.id,
        // Missing collectedBy field
        paymentDate: new Date().toISOString()
      };
      
      const response = await request(app.getHttpServer())
        .post('/payments')
        .set(authHeader)
        .send(paymentData);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('collectedBy');
    });

    it('should return 400 when creating OTA_COLLECT payment without receivedFrom', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Get checkout date for booking
      const booking = await prisma.booking.findUnique({
        where: { id: testData.bookings.bookingA2.id }
      });
      
      // Payment date must be >= checkout date for OTA_COLLECT
      const paymentDate = new Date(booking.checkOut);
      paymentDate.setDate(paymentDate.getDate() + 5); // 5 days after checkout
      
      const paymentData = {
        amount: 300,
        method: 'BANK_TRANSFER',
        status: 'COMPLETED',
        type: 'OTA_COLLECT',
        bookingId: testData.bookings.bookingA2.id,
        // Missing receivedFrom field
        paymentDate: paymentDate.toISOString()
      };
      
      const response = await request(app.getHttpServer())
        .post('/payments')
        .set(authHeader)
        .send(paymentData);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('receivedFrom');
    });

    it('should return 400 when creating OTA_COLLECT payment with paymentDate before checkOut', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Get checkout date for booking
      const booking = await prisma.booking.findUnique({
        where: { id: testData.bookings.bookingA2.id }
      });
      
      // Payment date before checkout date (invalid)
      const paymentDate = new Date(booking.checkOut);
      paymentDate.setDate(paymentDate.getDate() - 1); // 1 day before checkout
      
      const paymentData = {
        amount: 300,
        method: 'BANK_TRANSFER',
        status: 'COMPLETED',
        type: 'OTA_COLLECT',
        bookingId: testData.bookings.bookingA2.id,
        receivedFrom: 'Booking.com',
        paymentDate: paymentDate.toISOString()
      };
      
      const response = await request(app.getHttpServer())
        .post('/payments')
        .set(authHeader)
        .send(paymentData);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('paymentDate');
    });
  });

  describe('GET /payments', () => {
    it('should return payments filtered by method', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      const response = await request(app.getHttpServer())
        .get('/payments')
        .query({ method: 'CREDIT_CARD' })
        .set(authHeader);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All returned payments should have method CREDIT_CARD
      response.body.forEach(payment => {
        expect(payment.method).toBe('CREDIT_CARD');
      });
    });

    it('should return payments filtered by type', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      const response = await request(app.getHttpServer())
        .get('/payments')
        .query({ type: 'HOTEL_COLLECT' })
        .set(authHeader);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All returned payments should have type HOTEL_COLLECT
      response.body.forEach(payment => {
        expect(payment.type).toBe('HOTEL_COLLECT');
      });
    });

    it('should return payments filtered by status', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      const response = await request(app.getHttpServer())
        .get('/payments')
        .query({ status: 'COMPLETED' })
        .set(authHeader);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All returned payments should have status COMPLETED
      response.body.forEach(payment => {
        expect(payment.status).toBe('COMPLETED');
      });
    });

    it('should return payments filtered by ownerId', async () => {
      // Get auth header for SUPER_ADMIN (to see all payments)
      const authHeader = await getAuthHeader('SUPER_ADMIN');
      
      const response = await request(app.getHttpServer())
        .get('/payments')
        .query({ ownerId: testData.users.partnerA.id })
        .set(authHeader);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Verify all returned payments are associated with properties owned by partnerA
      // This would require additional logic to check booking -> property -> owner relationship
    });

    it('PARTNER should only see payments from their tenant', async () => {
      // Get auth header for PARTNER_A
      const authHeaderA = await getAuthHeader('PARTNER_A');
      
      // Get payments for PARTNER_A
      const responseA = await request(app.getHttpServer())
        .get('/payments')
        .set(authHeaderA);
      
      expect(responseA.status).toBe(200);
      expect(Array.isArray(responseA.body)).toBe(true);
      
      // All payments should belong to PARTNER_A's tenant
      responseA.body.forEach(payment => {
        expect(payment.tenantId).toBe(testData.tenants.tenantA.id);
      });
      
      // Get auth header for PARTNER_B
      const authHeaderB = await getAuthHeader('PARTNER_B');
      
      // Get payments for PARTNER_B
      const responseB = await request(app.getHttpServer())
        .get('/payments')
        .set(authHeaderB);
      
      expect(responseB.status).toBe(200);
      expect(Array.isArray(responseB.body)).toBe(true);
      
      // All payments should belong to PARTNER_B's tenant
      responseB.body.forEach(payment => {
        expect(payment.tenantId).toBe(testData.tenants.tenantB.id);
      });
    });
  });

  describe('PATCH /payments/:id', () => {
    it('should update payment amount, method, and status', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Find a payment from PARTNER_A's tenant
      const payment = await prisma.payment.findFirst({
        where: {
          tenantId: testData.tenants.tenantA.id,
          type: 'HOTEL_COLLECT'
        }
      });
      
      const updateData = {
        amount: 275,
        method: 'BANK_TRANSFER',
        status: 'REFUNDED'
      };
      
      const response = await request(app.getHttpServer())
        .patch(`/payments/${payment.id}`)
        .set(authHeader)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.amount).toBe(275);
      expect(response.body.method).toBe('BANK_TRANSFER');
      expect(response.body.status).toBe('REFUNDED');
    });

    it('PARTNER cannot update payments from another tenant', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Find a payment from PARTNER_B's tenant
      const payment = await prisma.payment.findFirst({
        where: {
          tenantId: testData.tenants.tenantB.id
        }
      });
      
      const updateData = {
        amount: 350,
        status: 'REFUNDED'
      };
      
      const response = await request(app.getHttpServer())
        .patch(`/payments/${payment.id}`)
        .set(authHeader)
        .send(updateData);
      
      expect(response.status).toBe(403);
    });

    it('STAFF cannot update payments', async () => {
      // Get auth header for STAFF
      const authHeader = await getAuthHeader('STAFF');
      
      // Find a payment from PARTNER_A's tenant (same as STAFF)
      const payment = await prisma.payment.findFirst({
        where: {
          tenantId: testData.tenants.tenantA.id
        }
      });
      
      const updateData = {
        amount: 300,
        status: 'REFUNDED'
      };
      
      const response = await request(app.getHttpServer())
        .patch(`/payments/${payment.id}`)
        .set(authHeader)
        .send(updateData);
      
      expect(response.status).toBe(403);
    });

    it('SUPER_ADMIN can update any payment', async () => {
      // Get auth header for SUPER_ADMIN
      const authHeader = await getAuthHeader('SUPER_ADMIN');
      
      // Find a payment from PARTNER_B's tenant
      const payment = await prisma.payment.findFirst({
        where: {
          tenantId: testData.tenants.tenantB.id
        }
      });
      
      const updateData = {
        amount: 325,
        method: 'CREDIT_CARD',
        status: 'COMPLETED'
      };
      
      const response = await request(app.getHttpServer())
        .patch(`/payments/${payment.id}`)
        .set(authHeader)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.amount).toBe(325);
      expect(response.body.method).toBe('CREDIT_CARD');
      expect(response.body.status).toBe('COMPLETED');
    });
  });
});
