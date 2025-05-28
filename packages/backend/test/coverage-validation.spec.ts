import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createTestData } from './helpers/seed';
import { resetDatabase } from './helpers/reset';
import { getAuthHeader } from './helpers/auth';

import { PrismaService } from '../src/prisma/prisma.service';

describe('Test Suite Coverage Validation', () => {
  let app: INestApplication;
  let testData: any;
  let prisma: PrismaService; // Declare prisma variable

  beforeAll(async () => {
    // Create the testing module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get PrismaService instance
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Reset database and create fresh test data
    await resetDatabase();
    testData = await createTestData();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('HTTP Status Code Validation', () => {
    it('should return 404 for non-existent resources', async () => {
      // Get auth header for SUPER_ADMIN
      const authHeader = await getAuthHeader('SUPER_ADMIN');
      
      // Test non-existent booking
      const bookingResponse = await request(app.getHttpServer())
        .get('/bookings/non-existent-id')
        .set(authHeader);
      
      expect(bookingResponse.status).toBe(404);
      
      // Test non-existent payment
      const paymentResponse = await request(app.getHttpServer())
        .get('/payments/non-existent-id')
        .set(authHeader);
      
      expect(paymentResponse.status).toBe(404);
      
      // Test non-existent invoice
      const invoiceResponse = await request(app.getHttpServer())
        .get('/invoices/non-existent-id')
        .set(authHeader);
      
      expect(invoiceResponse.status).toBe(404);
    });

    it('should return 400 for invalid input data', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Test invalid booking data (missing required fields)
      const bookingResponse = await request(app.getHttpServer())
        .post('/bookings')
        .set(authHeader)
        .send({
          // Missing required fields
          guestName: 'Test Guest'
          // No checkIn, checkOut, propertyId, etc.
        });
      
      expect(bookingResponse.status).toBe(400);
      
      // Test invalid payment data (negative amount)
      const paymentResponse = await request(app.getHttpServer())
        .post('/payments')
        .set(authHeader)
        .send({
          amount: -100, // Negative amount
          method: 'CASH',
          status: 'COMPLETED',
          type: 'HOTEL_COLLECT',
          bookingId: 'some-booking-id',
          collectedBy: 'some-user-id',
          paymentDate: new Date().toISOString()
        });
      
      expect(paymentResponse.status).toBe(400);
    });

    it('should return 401 for unauthenticated requests', async () => {
      // No auth header
      
      // Test accessing protected route without authentication
      const response = await request(app.getHttpServer())
        .get('/bookings');
      
      expect(response.status).toBe(401);
    });

    it('should return 403 for unauthorized access', async () => {
      // Already covered in RBAC tests, but adding a simple check here for completeness
      
      // Get auth header for STAFF
      const authHeader = await getAuthHeader('STAFF');
      
      // STAFF trying to create a booking (not allowed)
      const response = await request(app.getHttpServer())
        .post('/bookings')
        .set(authHeader)
        .send({
          guestName: 'Test Guest',
          checkIn: '2025-10-01',
          checkOut: '2025-10-05',
          propertyId: 'some-property-id',
          status: 'CONFIRMED',
          totalAmount: 500,
          source: 'DIRECT'
        });
      
      expect(response.status).toBe(403);
    });
  });

  describe('Edge Case Validation', () => {
    it('should handle concurrent operations correctly', async () => {
      // This is a simplified test for concurrent operations
      // In a real environment, this would be more complex with actual concurrent requests
      
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
      
      // Simulate concurrent updates to the same booking
      const updateData1 = {
        guestName: 'Concurrent Update 1'
      };
      
      const updateData2 = {
        guestName: 'Concurrent Update 2'
      };
      
      // Send both updates (almost) simultaneously
      const [response1, response2] = await Promise.all([
        request(app.getHttpServer())
          .patch(`/bookings/${booking.id}`)
          .set(authHeader)
          .send(updateData1),
        request(app.getHttpServer())
          .patch(`/bookings/${booking.id}`)
          .set(authHeader)
          .send(updateData2)
      ]);
      
      // Both should succeed, but the final state should be one of the two updates
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      // Check final state
      const finalBooking = await prisma.booking.findUnique({
        where: { id: booking.id }
      });
      
      expect(
        finalBooking.guestName === 'Concurrent Update 1' || 
        finalBooking.guestName === 'Concurrent Update 2'
      ).toBe(true);
    });

    it('should handle large result sets efficiently', async () => {
      // Get auth header for SUPER_ADMIN
      const authHeader = await getAuthHeader('SUPER_ADMIN');
      
      // Test pagination for a potentially large result set
      const response = await request(app.getHttpServer())
        .get('/bookings')
        .query({ 
          page: 1,
          limit: 10
        })
        .set(authHeader);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(10);
      
      // Check for pagination metadata in headers or response
      expect(response.headers['x-total-count'] || response.body.meta?.totalCount).toBeDefined();
    });
  });
});
