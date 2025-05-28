import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module'; // Adjust path to your main AppModule
import { Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service'; // Adjust path
import * as bcrypt from 'bcrypt'; // Import bcrypt for password hashing

// Helper function to generate JWT tokens for testing
const generateToken = (jwtService: JwtService, role: Role, userId: string, tenantId: string | null): string => {
  const payload = {
    email: `${role.toLowerCase()}@test.com`,
    sub: userId,
    role: role,
    tenantId: tenantId,
  };
  return jwtService.sign(payload);
};

describe('RBAC (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let prisma: PrismaService;
  let superAdminToken: string;
  let partnerToken: string;
  let staffToken: string;

  // Store created entity IDs for cleanup or use in tests
  let createdTenantId: string;
  let createdSuperAdminId: string;
  let createdPartnerId: string;
  let createdStaffId: string;
  let createdPropertyId: string;
  let createdRoomTypeId: string;
  let createdBookingId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Import your main AppModule
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // Apply validation pipe like in main.ts
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // --- Clean up database before seeding ---
    // Order matters due to foreign key constraints
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.roomType.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.tenant.deleteMany({});

    // --- Seed Data ---
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Partner Tenant',
        slug: 'test-partner-tenant',
      },
    });
    createdTenantId = tenant.id;

    // 2. Create Users
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@test.com',
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
        name: 'Super Admin',
        // No tenantId for SUPER_ADMIN
      },
    });
    createdSuperAdminId = superAdmin.id;

    const partner = await prisma.user.create({
      data: {
        email: 'partner@test.com',
        password: hashedPassword,
        role: Role.PARTNER,
        name: 'Test Partner',
        tenantId: createdTenantId,
      },
    });
    createdPartnerId = partner.id;

    const staff = await prisma.user.create({
      data: {
        email: 'staff@test.com',
        password: hashedPassword,
        role: Role.STAFF,
        name: 'Test Staff',
        tenantId: createdTenantId,
      },
    });
    createdStaffId = staff.id;

    // 3. Create Property (owned by Partner)
    const property = await prisma.property.create({
      data: {
        name: 'Test Property',
        address: '123 Test St',
        city: 'Test City',
        ownerId: createdPartnerId, // Owned by partner
        userId: createdPartnerId, // Managed by partner initially
        tenantId: createdTenantId,
      },
    });
    createdPropertyId = property.id;

    // 4. Create Room Type
    const roomType = await prisma.roomType.create({
      data: {
        name: 'Standard Room',
        maxOccupancy: 2,
        price: 100.0,
        propertyId: createdPropertyId,
        tenantId: createdTenantId,
      },
    });
    createdRoomTypeId = roomType.id;

    // 5. Create a sample Booking (needed for invoice test)
    const booking = await prisma.booking.create({
        data: {
            guestName: 'Invoice Test Guest',
            contactPhone: '555-1234',
            channel: 'DIRECT',
            checkIn: new Date('2025-06-01T14:00:00Z'),
            checkOut: new Date('2025-06-03T11:00:00Z'),
            nights: 2,
            adults: 2,
            totalAmount: 200.0,
            netRevenue: 200.0,
            paymentMethod: 'HOTEL_COLLECT',
            paymentType: 'HOTEL_COLLECT', // Important for invoice test
            paymentStatus: 'UNPAID',
            outstandingBalance: 200.0,
            bookingStatus: 'CONFIRMED',
            isInvoiced: false, // Important for invoice test
            propertyId: createdPropertyId,
            roomTypeId: createdRoomTypeId,
            userId: createdPartnerId, // Associated with partner
            tenantId: createdTenantId,
        }
    });
    createdBookingId = booking.id;


    // --- Generate Tokens using created user IDs ---
    superAdminToken = generateToken(jwtService, Role.SUPER_ADMIN, createdSuperAdminId, null);
    partnerToken = generateToken(jwtService, Role.PARTNER, createdPartnerId, createdTenantId);
    staffToken = generateToken(jwtService, Role.STAFF, createdStaffId, createdTenantId);

  });

  afterAll(async () => {
    // Optional: Clean up database after tests if needed
    // await prisma.invoiceItem.deleteMany({});
    // await prisma.invoice.deleteMany({});
    // await prisma.payment.deleteMany({});
    // await prisma.booking.deleteMany({});
    // await prisma.roomType.deleteMany({});
    // await prisma.property.deleteMany({});
    // await prisma.auditLog.deleteMany({});
    // await prisma.message.deleteMany({});
    // await prisma.user.deleteMany({});
    // await prisma.tenant.deleteMany({});
    await app.close();
  });

  // --- Test Cases ---

  describe('/users endpoint', () => {
    it('GET /users should be forbidden for STAFF', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403); // Forbidden
    });

    it('GET /users should be allowed for SUPER_ADMIN', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200); // OK
    });

     it('GET /users/me should return current user profile', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toEqual('partner@test.com');
          expect(res.body.role).toEqual(Role.PARTNER);
          // Check if sub is returned or id
          // Depending on your JwtStrategy, 'sub' might be the user ID
          expect(res.body.id).toEqual(createdPartnerId);
        });
    });
  });

  describe('/finance/invoices endpoint', () => {
    it('GET /finance/invoices should be allowed for STAFF', () => {
      // Note: This assumes STAFF can *view* invoices within their tenant. Adjust if needed.
      return request(app.getHttpServer())
        .get('/finance/invoices') // Assuming the endpoint is /finance/invoices
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200); // OK
    });

    it('POST /finance/invoices should be forbidden for STAFF', () => {
      const createInvoiceDto = { bookingIds: [createdBookingId], paymentType: 'HOTEL_COLLECT' };
      return request(app.getHttpServer())
        .post('/finance/invoices') // Assuming the endpoint is /finance/invoices
        .set('Authorization', `Bearer ${staffToken}`)
        .send(createInvoiceDto)
        .expect(403); // Forbidden
    });

    it('POST /finance/invoices should be allowed for PARTNER', () => {
      const createInvoiceDto = { bookingIds: [createdBookingId], paymentType: 'HOTEL_COLLECT' };
      return request(app.getHttpServer())
        .post('/finance/invoices') // Assuming the endpoint is /finance/invoices
        .set('Authorization', `Bearer ${partnerToken}`)
        .send(createInvoiceDto)
        .expect(201); // Expect 201 Created
    });
  });

  describe('/bookings endpoint', () => {
    it('POST /bookings should be forbidden for STAFF', () => {
      const createBookingDto = {
          guestName: 'Staff Forbidden Guest',
          checkIn: new Date('2025-07-01T14:00:00Z'),
          checkOut: new Date('2025-07-02T11:00:00Z'),
          adults: 1,
          propertyId: createdPropertyId, // Use seeded property
          roomTypeId: createdRoomTypeId, // Use seeded room type
          paymentType: 'HOTEL_COLLECT',
          contactPhone: '111222',
          channel: 'DIRECT',
          totalAmount: 150,
          userId: createdStaffId // Correct user ID
      };
      return request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(createBookingDto)
        .expect(403); // Forbidden
    });

    it('POST /bookings should be allowed for PARTNER', () => {
      const createBookingDto = {
          guestName: 'Partner Allowed Guest',
          checkIn: new Date('2025-08-01T14:00:00Z'),
          checkOut: new Date('2025-08-03T11:00:00Z'),
          adults: 2,
          propertyId: createdPropertyId, // Use seeded property
          roomTypeId: createdRoomTypeId, // Use seeded room type
          paymentType: 'OTA_COLLECT',
          contactPhone: '333444',
          channel: 'BOOKING_COM',
          totalAmount: 300,
          userId: createdPartnerId // Correct user ID
      };
      return request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${partnerToken}`)
        .send(createBookingDto)
        .expect(201); // Created
    });
  });

  // Add more tests, including tenant isolation checks if applicable
  // describe('Tenant Isolation', () => {
  //   it('PARTNER should not access bookings from another tenant', async () => {
  //     // 1. Create a booking belonging to a different tenant (e.g., staffTenantId)
  //     // 2. Try to GET /bookings/:bookingId using partnerToken
  //     // 3. Expect 403 or 404
  //   });
  // });

});

