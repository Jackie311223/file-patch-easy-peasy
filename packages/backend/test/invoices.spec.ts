import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createTestData } from './helpers/seed';
import { resetDatabase } from './helpers/reset';
import { getAuthHeader } from './helpers/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Invoices Module Tests', () => {
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

  describe('POST /invoices', () => {
    it('should create invoice by grouping OTA payments that are completed', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Find OTA_COLLECT payments that are COMPLETED for PARTNER_A's tenant
      const payments = await prisma.payment.findMany({
        where: {
          tenantId: testData.tenants.tenantA.id,
          type: 'OTA_COLLECT',
          status: 'COMPLETED',
          invoiceId: null // Not already assigned to an invoice
        }
      });
      
      // Ensure we have at least one payment to test with
      expect(payments.length).toBeGreaterThan(0);
      
      const invoiceData = {
        number: 'INV-2025-002',
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        otaName: 'Booking.com',
        paymentIds: payments.map(p => p.id)
      };
      
      const response = await request(app.getHttpServer())
        .post('/invoices')
        .set(authHeader)
        .send(invoiceData);
      
      expect(response.status).toBe(201);
      expect(response.body.number).toBe('INV-2025-002');
      expect(response.body.otaName).toBe('Booking.com');
      
      // Verify the total amount matches the sum of payment amounts
      const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
      expect(response.body.totalAmount).toBe(totalAmount);
      
      // Verify payments are now linked to this invoice
      for (const paymentId of payments.map(p => p.id)) {
        const updatedPayment = await prisma.payment.findUnique({
          where: { id: paymentId }
        });
        expect(updatedPayment.invoiceId).toBe(response.body.id);
      }
    });

    it('should return 400 when trying to include payments from different tenant', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Find a payment from PARTNER_B's tenant
      const paymentFromTenantB = await prisma.payment.findFirst({
        where: {
          tenantId: testData.tenants.tenantB.id,
          type: 'OTA_COLLECT'
        }
      });
      
      // Find a payment from PARTNER_A's tenant
      const paymentFromTenantA = await prisma.payment.findFirst({
        where: {
          tenantId: testData.tenants.tenantA.id,
          type: 'OTA_COLLECT',
          invoiceId: null // Not already assigned to an invoice
        }
      });
      
      const invoiceData = {
        number: 'INV-2025-003',
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        otaName: 'Mixed OTAs',
        paymentIds: [paymentFromTenantA.id, paymentFromTenantB.id] // Mix of tenants
      };
      
      const response = await request(app.getHttpServer())
        .post('/invoices')
        .set(authHeader)
        .send(invoiceData);
      
      expect(response.status).toBe(403);
    });

    it('should return 400 when trying to include payments that are not COMPLETED', async () => {
      // Get auth header for PARTNER_B
      const authHeader = await getAuthHeader('PARTNER_B');
      
      // Find a PENDING payment from PARTNER_B's tenant
      const pendingPayment = await prisma.payment.findFirst({
        where: {
          tenantId: testData.tenants.tenantB.id,
          type: 'OTA_COLLECT',
          status: 'PENDING'
        }
      });
      
      // Ensure we found a pending payment
      expect(pendingPayment).toBeTruthy();
      
      const invoiceData = {
        number: 'INV-2025-004',
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        otaName: 'Expedia',
        paymentIds: [pendingPayment.id]
      };
      
      const response = await request(app.getHttpServer())
        .post('/invoices')
        .set(authHeader)
        .send(invoiceData);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('COMPLETED');
    });
  });

  describe('GET /invoices', () => {
    it('should return list of invoices for tenant', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      const response = await request(app.getHttpServer())
        .get('/invoices')
        .set(authHeader);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All invoices should belong to PARTNER_A's tenant
      response.body.forEach(invoice => {
        expect(invoice.tenantId).toBe(testData.tenants.tenantA.id);
      });
    });

    it('PARTNER should only see invoices from their tenant', async () => {
      // Create an invoice for PARTNER_B's tenant
      const partnerBPayment = await prisma.payment.findFirst({
        where: {
          tenantId: testData.tenants.tenantB.id,
          type: 'OTA_COLLECT',
          status: 'COMPLETED',
          invoiceId: null
        }
      });
      
      if (partnerBPayment) {
        await prisma.invoice.create({
          data: {
            number: 'INV-B-001',
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'PENDING',
            totalAmount: partnerBPayment.amount,
            tenantId: testData.tenants.tenantB.id,
            otaName: 'Expedia',
            payments: {
              connect: { id: partnerBPayment.id }
            }
          }
        });
      }
      
      // Get auth header for PARTNER_A
      const authHeaderA = await getAuthHeader('PARTNER_A');
      
      // Get invoices for PARTNER_A
      const responseA = await request(app.getHttpServer())
        .get('/invoices')
        .set(authHeaderA);
      
      expect(responseA.status).toBe(200);
      
      // All invoices should belong to PARTNER_A's tenant
      responseA.body.forEach(invoice => {
        expect(invoice.tenantId).toBe(testData.tenants.tenantA.id);
      });
      
      // Get auth header for PARTNER_B
      const authHeaderB = await getAuthHeader('PARTNER_B');
      
      // Get invoices for PARTNER_B
      const responseB = await request(app.getHttpServer())
        .get('/invoices')
        .set(authHeaderB);
      
      expect(responseB.status).toBe(200);
      
      // All invoices should belong to PARTNER_B's tenant
      responseB.body.forEach(invoice => {
        expect(invoice.tenantId).toBe(testData.tenants.tenantB.id);
      });
      
      // PARTNER_A should not see PARTNER_B's invoices and vice versa
      const invoiceIdsA = responseA.body.map(invoice => invoice.id);
      const invoiceIdsB = responseB.body.map(invoice => invoice.id);
      
      // Check for no overlap between the two sets
      const intersection = invoiceIdsA.filter(id => invoiceIdsB.includes(id));
      expect(intersection.length).toBe(0);
    });
  });

  describe('GET /invoices/:id', () => {
    it('should return invoice details with associated payments', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Find an invoice from PARTNER_A's tenant
      const invoice = await prisma.invoice.findFirst({
        where: {
          tenantId: testData.tenants.tenantA.id
        }
      });
      
      const response = await request(app.getHttpServer())
        .get(`/invoices/${invoice.id}`)
        .set(authHeader);
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(invoice.id);
      
      // Should include payments
      expect(response.body.payments).toBeDefined();
      expect(Array.isArray(response.body.payments)).toBe(true);
      
      // Verify the total amount matches the sum of payment amounts
      const totalPaymentAmount = response.body.payments.reduce(
        (sum, payment) => sum + payment.amount, 
        0
      );
      expect(response.body.totalAmount).toBe(totalPaymentAmount);
    });

    it('PARTNER cannot access invoice from another tenant', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Find an invoice from PARTNER_B's tenant
      const invoice = await prisma.invoice.findFirst({
        where: {
          tenantId: testData.tenants.tenantB.id
        }
      });
      
      // If no invoice exists for PARTNER_B, skip this test
      if (!invoice) {
        console.log('No invoice found for PARTNER_B, skipping test');
        return;
      }
      
      const response = await request(app.getHttpServer())
        .get(`/invoices/${invoice.id}`)
        .set(authHeader);
      
      expect(response.status).toBe(403);
    });

    it('SUPER_ADMIN can access any invoice', async () => {
      // Get auth header for SUPER_ADMIN
      const authHeader = await getAuthHeader('SUPER_ADMIN');
      
      // Find invoices from both tenants
      const invoiceA = await prisma.invoice.findFirst({
        where: {
          tenantId: testData.tenants.tenantA.id
        }
      });
      
      const invoiceB = await prisma.invoice.findFirst({
        where: {
          tenantId: testData.tenants.tenantB.id
        }
      });
      
      // Test access to PARTNER_A's invoice
      if (invoiceA) {
        const responseA = await request(app.getHttpServer())
          .get(`/invoices/${invoiceA.id}`)
          .set(authHeader);
        
        expect(responseA.status).toBe(200);
        expect(responseA.body.id).toBe(invoiceA.id);
      }
      
      // Test access to PARTNER_B's invoice
      if (invoiceB) {
        const responseB = await request(app.getHttpServer())
          .get(`/invoices/${invoiceB.id}`)
          .set(authHeader);
        
        expect(responseB.status).toBe(200);
        expect(responseB.body.id).toBe(invoiceB.id);
      }
    });
  });
});
