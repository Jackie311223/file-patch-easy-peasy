import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createTestData } from './helpers/seed';
import { resetDatabase } from './helpers/reset';
import { getAuthHeader } from './helpers/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Messages Module Tests', () => {
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

  describe('GET /messages', () => {
    // Create test messages before running tests
    beforeEach(async () => {
      // Create SYSTEM message for tenant A
      await prisma.message.create({
        data: {
          title: 'System Announcement A',
          content: 'This is a system announcement for Tenant A',
          type: 'SYSTEM',
          tenantId: testData.tenants.tenantA.id,
          senderId: testData.users.superAdmin.id,
          isRead: false
        }
      });

      // Create PRIVATE message for PARTNER_A
      await prisma.message.create({
        data: {
          title: 'Private Message for Partner A',
          content: 'This is a private message for Partner A',
          type: 'PRIVATE',
          tenantId: testData.tenants.tenantA.id,
          senderId: testData.users.superAdmin.id,
          recipientId: testData.users.partnerA.id,
          isRead: false
        }
      });

      // Create SYSTEM message for tenant B
      await prisma.message.create({
        data: {
          title: 'System Announcement B',
          content: 'This is a system announcement for Tenant B',
          type: 'SYSTEM',
          tenantId: testData.tenants.tenantB.id,
          senderId: testData.users.superAdmin.id,
          isRead: false
        }
      });

      // Create PRIVATE message for PARTNER_B
      await prisma.message.create({
        data: {
          title: 'Private Message for Partner B',
          content: 'This is a private message for Partner B',
          type: 'PRIVATE',
          tenantId: testData.tenants.tenantB.id,
          senderId: testData.users.superAdmin.id,
          recipientId: testData.users.partnerB.id,
          isRead: false
        }
      });
    });

    it('should return messages for the user\'s tenant', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      const response = await request(app.getHttpServer())
        .get('/messages')
        .set(authHeader);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All messages should belong to PARTNER_A's tenant
      response.body.forEach(message => {
        expect(message.tenantId).toBe(testData.tenants.tenantA.id);
      });
      
      // Should include both SYSTEM messages and PRIVATE messages for PARTNER_A
      const systemMessages = response.body.filter(message => message.type === 'SYSTEM');
      const privateMessages = response.body.filter(message => 
        message.type === 'PRIVATE' && message.recipientId === testData.users.partnerA.id
      );
      
      expect(systemMessages.length).toBeGreaterThan(0);
      expect(privateMessages.length).toBeGreaterThan(0);
    });

    it('should filter messages by type', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Get only SYSTEM messages
      const systemResponse = await request(app.getHttpServer())
        .get('/messages')
        .query({ type: 'SYSTEM' })
        .set(authHeader);
      
      expect(systemResponse.status).toBe(200);
      expect(Array.isArray(systemResponse.body)).toBe(true);
      
      // All messages should be SYSTEM type
      systemResponse.body.forEach(message => {
        expect(message.type).toBe('SYSTEM');
      });
      
      // Get only PRIVATE messages
      const privateResponse = await request(app.getHttpServer())
        .get('/messages')
        .query({ type: 'PRIVATE' })
        .set(authHeader);
      
      expect(privateResponse.status).toBe(200);
      expect(Array.isArray(privateResponse.body)).toBe(true);
      
      // All messages should be PRIVATE type
      privateResponse.body.forEach(message => {
        expect(message.type).toBe('PRIVATE');
      });
    });

    it('should filter messages by read status', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Get only unread messages
      const unreadResponse = await request(app.getHttpServer())
        .get('/messages')
        .query({ isRead: false })
        .set(authHeader);
      
      expect(unreadResponse.status).toBe(200);
      expect(Array.isArray(unreadResponse.body)).toBe(true);
      
      // All messages should be unread
      unreadResponse.body.forEach(message => {
        expect(message.isRead).toBe(false);
      });
      
      // Mark one message as read
      if (unreadResponse.body.length > 0) {
        const messageId = unreadResponse.body[0].id;
        
        await request(app.getHttpServer())
          .patch(`/messages/${messageId}/read`)
          .set(authHeader)
          .send();
        
        // Get only read messages
        const readResponse = await request(app.getHttpServer())
          .get('/messages')
          .query({ isRead: true })
          .set(authHeader);
        
        expect(readResponse.status).toBe(200);
        expect(Array.isArray(readResponse.body)).toBe(true);
        expect(readResponse.body.length).toBeGreaterThan(0);
        
        // All messages should be read
        readResponse.body.forEach(message => {
          expect(message.isRead).toBe(true);
        });
        
        // The marked message should be in the read messages
        const markedMessage = readResponse.body.find(message => message.id === messageId);
        expect(markedMessage).toBeDefined();
      }
    });

    it('PARTNER should only see messages from their tenant', async () => {
      // Get auth header for PARTNER_A
      const authHeaderA = await getAuthHeader('PARTNER_A');
      
      // Get messages for PARTNER_A
      const responseA = await request(app.getHttpServer())
        .get('/messages')
        .set(authHeaderA);
      
      expect(responseA.status).toBe(200);
      
      // All messages should belong to PARTNER_A's tenant
      responseA.body.forEach(message => {
        expect(message.tenantId).toBe(testData.tenants.tenantA.id);
      });
      
      // Get auth header for PARTNER_B
      const authHeaderB = await getAuthHeader('PARTNER_B');
      
      // Get messages for PARTNER_B
      const responseB = await request(app.getHttpServer())
        .get('/messages')
        .set(authHeaderB);
      
      expect(responseB.status).toBe(200);
      
      // All messages should belong to PARTNER_B's tenant
      responseB.body.forEach(message => {
        expect(message.tenantId).toBe(testData.tenants.tenantB.id);
      });
      
      // PARTNER_A should not see PARTNER_B's messages and vice versa
      const messageIdsA = responseA.body.map(message => message.id);
      const messageIdsB = responseB.body.map(message => message.id);
      
      // Check for no overlap between the two sets
      const intersection = messageIdsA.filter(id => messageIdsB.includes(id));
      expect(intersection.length).toBe(0);
    });

    it('STAFF should only see messages from their tenant', async () => {
      // Get auth header for STAFF
      const authHeader = await getAuthHeader('STAFF');
      
      const response = await request(app.getHttpServer())
        .get('/messages')
        .set(authHeader);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All messages should belong to STAFF's tenant
      response.body.forEach(message => {
        expect(message.tenantId).toBe(testData.tenants.tenantA.id);
      });
    });

    it('SUPER_ADMIN should see messages from all tenants', async () => {
      // Get auth header for SUPER_ADMIN
      const authHeader = await getAuthHeader('SUPER_ADMIN');
      
      const response = await request(app.getHttpServer())
        .get('/messages')
        .set(authHeader);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Should include messages from both tenants
      const tenantAMessages = response.body.filter(message => message.tenantId === testData.tenants.tenantA.id);
      const tenantBMessages = response.body.filter(message => message.tenantId === testData.tenants.tenantB.id);
      
      expect(tenantAMessages.length).toBeGreaterThan(0);
      expect(tenantBMessages.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /messages/:id/read', () => {
    it('should mark message as read', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Create an unread message for PARTNER_A
      const message = await prisma.message.create({
        data: {
          title: 'Test Message',
          content: 'This is a test message',
          type: 'SYSTEM',
          tenantId: testData.tenants.tenantA.id,
          senderId: testData.users.superAdmin.id,
          isRead: false
        }
      });
      
      // Mark the message as read
      const response = await request(app.getHttpServer())
        .patch(`/messages/${message.id}/read`)
        .set(authHeader)
        .send();
      
      expect(response.status).toBe(200);
      expect(response.body.isRead).toBe(true);
      
      // Verify the message is marked as read in the database
      const updatedMessage = await prisma.message.findUnique({
        where: { id: message.id }
      });
      
      expect(updatedMessage.isRead).toBe(true);
    });

    it('PARTNER cannot mark messages from another tenant as read', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Create an unread message for PARTNER_B's tenant
      const message = await prisma.message.create({
        data: {
          title: 'Test Message for Tenant B',
          content: 'This is a test message for Tenant B',
          type: 'SYSTEM',
          tenantId: testData.tenants.tenantB.id,
          senderId: testData.users.superAdmin.id,
          isRead: false
        }
      });
      
      // Try to mark the message as read
      const response = await request(app.getHttpServer())
        .patch(`/messages/${message.id}/read`)
        .set(authHeader)
        .send();
      
      expect(response.status).toBe(403);
      
      // Verify the message is still unread in the database
      const updatedMessage = await prisma.message.findUnique({
        where: { id: message.id }
      });
      
      expect(updatedMessage.isRead).toBe(false);
    });

    it('PARTNER cannot mark private messages for other users as read', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      // Create a private message for STAFF in the same tenant
      const message = await prisma.message.create({
        data: {
          title: 'Private Message for Staff',
          content: 'This is a private message for Staff',
          type: 'PRIVATE',
          tenantId: testData.tenants.tenantA.id,
          senderId: testData.users.superAdmin.id,
          recipientId: testData.users.staffA.id,
          isRead: false
        }
      });
      
      // Try to mark the message as read
      const response = await request(app.getHttpServer())
        .patch(`/messages/${message.id}/read`)
        .set(authHeader)
        .send();
      
      expect(response.status).toBe(403);
      
      // Verify the message is still unread in the database
      const updatedMessage = await prisma.message.findUnique({
        where: { id: message.id }
      });
      
      expect(updatedMessage.isRead).toBe(false);
    });
  });

  describe('POST /messages', () => {
    it('SUPER_ADMIN should create SYSTEM message for a tenant', async () => {
      // Get auth header for SUPER_ADMIN
      const authHeader = await getAuthHeader('SUPER_ADMIN');
      
      const messageData = {
        title: 'New System Announcement',
        content: 'This is a new system announcement',
        type: 'SYSTEM',
        tenantId: testData.tenants.tenantA.id
      };
      
      const response = await request(app.getHttpServer())
        .post('/messages')
        .set(authHeader)
        .send(messageData);
      
      expect(response.status).toBe(201);
      expect(response.body.title).toBe(messageData.title);
      expect(response.body.content).toBe(messageData.content);
      expect(response.body.type).toBe('SYSTEM');
      expect(response.body.tenantId).toBe(testData.tenants.tenantA.id);
      expect(response.body.senderId).toBe(testData.users.superAdmin.id);
      expect(response.body.isRead).toBe(false);
    });

    it('SUPER_ADMIN should create PRIVATE message for a user', async () => {
      // Get auth header for SUPER_ADMIN
      const authHeader = await getAuthHeader('SUPER_ADMIN');
      
      const messageData = {
        title: 'New Private Message',
        content: 'This is a new private message',
        type: 'PRIVATE',
        tenantId: testData.tenants.tenantA.id,
        recipientId: testData.users.partnerA.id
      };
      
      const response = await request(app.getHttpServer())
        .post('/messages')
        .set(authHeader)
        .send(messageData);
      
      expect(response.status).toBe(201);
      expect(response.body.title).toBe(messageData.title);
      expect(response.body.content).toBe(messageData.content);
      expect(response.body.type).toBe('PRIVATE');
      expect(response.body.tenantId).toBe(testData.tenants.tenantA.id);
      expect(response.body.senderId).toBe(testData.users.superAdmin.id);
      expect(response.body.recipientId).toBe(testData.users.partnerA.id);
      expect(response.body.isRead).toBe(false);
    });

    it('PARTNER should create PRIVATE message within their tenant', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      const messageData = {
        title: 'Message from Partner to Staff',
        content: 'This is a message from Partner to Staff',
        type: 'PRIVATE',
        recipientId: testData.users.staffA.id
      };
      
      const response = await request(app.getHttpServer())
        .post('/messages')
        .set(authHeader)
        .send(messageData);
      
      expect(response.status).toBe(201);
      expect(response.body.title).toBe(messageData.title);
      expect(response.body.content).toBe(messageData.content);
      expect(response.body.type).toBe('PRIVATE');
      expect(response.body.tenantId).toBe(testData.tenants.tenantA.id);
      expect(response.body.senderId).toBe(testData.users.partnerA.id);
      expect(response.body.recipientId).toBe(testData.users.staffA.id);
      expect(response.body.isRead).toBe(false);
    });

    it('PARTNER cannot create SYSTEM messages', async () => {
      // Get auth header for PARTNER_A
      const authHeader = await getAuthHeader('PARTNER_A');
      
      const messageData = {
        title: 'Attempted System Message',
        content: 'This is an attempted system message',
        type: 'SYS
(Content truncated due to size limit. Use line ranges to read in chunks)