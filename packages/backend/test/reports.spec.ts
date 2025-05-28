import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createTestData } from './helpers/seed';
import { resetDatabase } from './helpers/reset';
import { getAuthHeader } from './helpers/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Reports Module Tests', () => {
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

  describe('GET /reports/revenue', () => {
    it('should return revenue report with correct totals', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Query parameters for the report
      const queryParams = {
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        groupBy: 'month'
      };
      
      const response = await request(app.getHttpServer())
        .get('/reports/revenue')
        .query(queryParams)
        .set(authHeader);
      
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.totalRevenue).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Verify the total revenue matches the sum of all payments for PARTNER_A's tenant
      const payments = await prisma.payment.findMany({
        where: {
          tenantId: testData.tenants.tenantA.id,
          status: 'COMPLETED',
          paymentDate: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-12-31')
          }
        }
      });
      
      const expectedTotalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
      expect(response.body.totalRevenue).toBe(expectedTotalRevenue);
    });

    it('should filter revenue report by propertyId', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Query parameters for the report
      const queryParams = {
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        propertyId: testData.properties.propertyA.id,
        groupBy: 'month'
      };
      
      const response = await request(app.getHttpServer())
        .get('/reports/revenue')
        .query(queryParams)
        .set(authHeader);
      
      expect(response.status).toBe(200);
      
      // Verify the total revenue matches the sum of all payments for the specified property
      const payments = await prisma.payment.findMany({
        where: {
          booking: {
            propertyId: testData.properties.propertyA.id
          },
          status: 'COMPLETED',
          paymentDate: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-12-31')
          }
        }
      });
      
      const expectedTotalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
      expect(response.body.totalRevenue).toBe(expectedTotalRevenue);
    });

    it('should filter revenue report by ownerId', async () => {
      // Get auth header for SUPER_ADMIN (to test ownerId filter)
      const authHeader = await getAuthHeader('SUPER_ADMIN');
      
      // Query parameters for the report
      const queryParams = {
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        ownerId: testData.users.partnerA.id,
        groupBy: 'month'
      };
      
      const response = await request(app.getHttpServer())
        .get('/reports/revenue')
        .query(queryParams)
        .set(authHeader);
      
      expect(response.status).toBe(200);
      
      // Verify the total revenue matches the sum of all payments for properties owned by PARTNER_A
      const payments = await prisma.payment.findMany({
        where: {
          booking: {
            property: {
              ownerId: testData.users.partnerA.id
            }
          },
          status: 'COMPLETED',
          paymentDate: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-12-31')
          }
        }
      });
      
      const expectedTotalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
      expect(response.body.totalRevenue).toBe(expectedTotalRevenue);
    });

    it('PARTNER should only see revenue from their tenant', async () => {
      // Get auth header for PARTNER_A
      const authHeaderA = await getAuthHeader('PARTNER_A');
      
      // Get revenue report for PARTNER_A
      const responseA = await request(app.getHttpServer())
        .get('/reports/revenue')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          groupBy: 'month'
        })
        .set(authHeaderA);
      
      expect(responseA.status).toBe(200);
      
      // Get auth header for PARTNER_B
      const authHeaderB = await getAuthHeader('PARTNER_B');
      
      // Get revenue report for PARTNER_B
      const responseB = await request(app.getHttpServer())
        .get('/reports/revenue')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          groupBy: 'month'
        })
        .set(authHeaderB);
      
      expect(responseB.status).toBe(200);
      
      // The two reports should have different total revenues
      expect(responseA.body.totalRevenue).not.toBe(responseB.body.totalRevenue);
    });
  });

  describe('GET /reports/occupancy', () => {
    it('should return occupancy report with correct rates', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Query parameters for the report
      const queryParams = {
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        propertyId: testData.properties.propertyA.id,
        groupBy: 'month'
      };
      
      const response = await request(app.getHttpServer())
        .get('/reports/occupancy')
        .query(queryParams)
        .set(authHeader);
      
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.averageOccupancy).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Each data point should have a period and occupancyRate
      response.body.data.forEach(dataPoint => {
        expect(dataPoint.period).toBeDefined();
        expect(dataPoint.occupancyRate).toBeDefined();
        expect(typeof dataPoint.occupancyRate).toBe('number');
        expect(dataPoint.occupancyRate).toBeGreaterThanOrEqual(0);
        expect(dataPoint.occupancyRate).toBeLessThanOrEqual(100);
      });
    });

    it('PARTNER should only see occupancy from their properties', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Try to get occupancy for PARTNER_B's property
      const response = await request(app.getHttpServer())
        .get('/reports/occupancy')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          propertyId: testData.properties.propertyB.id,
          groupBy: 'month'
        })
        .set(authHeader);
      
      // Should return 403 Forbidden
      expect(response.status).toBe(403);
    });

    it('SUPER_ADMIN can see occupancy for any property', async () => {
      // Get auth header for SUPER_ADMIN
      const authHeader = await getAuthHeader('SUPER_ADMIN');
      
      // Get occupancy for PARTNER_A's property
      const responseA = await request(app.getHttpServer())
        .get('/reports/occupancy')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          propertyId: testData.properties.propertyA.id,
          groupBy: 'month'
        })
        .set(authHeader);
      
      expect(responseA.status).toBe(200);
      
      // Get occupancy for PARTNER_B's property
      const responseB = await request(app.getHttpServer())
        .get('/reports/occupancy')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          propertyId: testData.properties.propertyB.id,
          groupBy: 'month'
        })
        .set(authHeader);
      
      expect(responseB.status).toBe(200);
    });
  });

  describe('GET /reports/source', () => {
    it('should return booking source analysis with correct distribution', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Query parameters for the report
      const queryParams = {
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        propertyId: testData.properties.propertyA.id
      };
      
      const response = await request(app.getHttpServer())
        .get('/reports/source')
        .query(queryParams)
        .set(authHeader);
      
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.sources).toBeDefined();
      expect(Array.isArray(response.body.sources)).toBe(true);
      
      // Each source should have a name, count, and percentage
      response.body.sources.forEach(source => {
        expect(source.name).toBeDefined();
        expect(source.count).toBeDefined();
        expect(source.percentage).toBeDefined();
        expect(typeof source.percentage).toBe('number');
        expect(source.percentage).toBeGreaterThanOrEqual(0);
        expect(source.percentage).toBeLessThanOrEqual(100);
      });
      
      // Verify the total percentage adds up to 100%
      const totalPercentage = response.body.sources.reduce((sum, source) => sum + source.percentage, 0);
      expect(Math.round(totalPercentage)).toBe(100);
      
      // Verify the source distribution matches the actual bookings
      const bookings = await prisma.booking.findMany({
        where: {
          propertyId: testData.properties.propertyA.id,
          checkIn: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-12-31')
          }
        }
      });
      
      const sourceCounts = {};
      bookings.forEach(booking => {
        sourceCounts[booking.source] = (sourceCounts[booking.source] || 0) + 1;
      });
      
      const totalBookings = bookings.length;
      
      // Check that each source in the response matches the actual data
      response.body.sources.forEach(source => {
        const actualCount = sourceCounts[source.name] || 0;
        expect(source.count).toBe(actualCount);
        
        const expectedPercentage = (actualCount / totalBookings) * 100;
        expect(source.percentage).toBeCloseTo(expectedPercentage, 1); // Allow small rounding differences
      });
    });

    it('PARTNER should only see source analysis from their properties', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Try to get source analysis for PARTNER_B's property
      const response = await request(app.getHttpServer())
        .get('/reports/source')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          propertyId: testData.properties.propertyB.id
        })
        .set(authHeader);
      
      // Should return 403 Forbidden
      expect(response.status).toBe(403);
    });

    it('STAFF can view source analysis for their tenant', async () => {
      // Get auth header for STAFF
      const authHeader = await getAuthHeader('STAFF');
      
      // Get source analysis for a property in STAFF's tenant
      const response = await request(app.getHttpServer())
        .get('/reports/source')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          propertyId: testData.properties.propertyA.id
        })
        .set(authHeader);
      
      expect(response.status).toBe(200);
      expect(response.body.sources).toBeDefined();
    });
  });
});
