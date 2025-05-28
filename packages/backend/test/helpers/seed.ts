import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Helper function to create test data for the test suite
 * Creates tenants, users, properties, bookings, payments, and invoices
 */
export async function createTestData() {
  try {
    // Create 2 tenants
    const tenantA = await prisma.tenant.create({ 
      data: { 
        name: 'Partner A',
        code: 'TENANT_A'
      } 
    });
    
    const tenantB = await prisma.tenant.create({ 
      data: { 
        name: 'Partner B',
        code: 'TENANT_B'
      } 
    });

    // Hash password for test users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create users
    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        name: 'Super Admin'
      }
    });

    const partnerA = await prisma.user.create({
      data: {
        email: 'partnerA@test.com',
        password: hashedPassword,
        role: 'PARTNER',
        name: 'Partner A',
        tenantId: tenantA.id
      }
    });

    const partnerB = await prisma.user.create({
      data: {
        email: 'partnerB@test.com',
        password: hashedPassword,
        role: 'PARTNER',
        name: 'Partner B',
        tenantId: tenantB.id
      }
    });

    const staffA = await prisma.user.create({
      data: {
        email: 'staffA@test.com',
        password: hashedPassword,
        role: 'STAFF',
        name: 'Staff A',
        tenantId: tenantA.id
      }
    });

    // Create properties (1 for each tenant)
    const propertyA = await prisma.property.create({
      data: {
        name: 'Property A',
        address: '123 Test St',
        ownerId: partnerA.id,
        tenantId: tenantA.id,
        rooms: 10
      }
    });

    const propertyB = await prisma.property.create({
      data: {
        name: 'Property B',
        address: '456 Test Ave',
        ownerId: partnerB.id,
        tenantId: tenantB.id,
        rooms: 8
      }
    });

    // Create bookings (2 for each property)
    const bookingA1 = await prisma.booking.create({
      data: {
        guestName: 'John Doe',
        checkIn: new Date('2025-06-01'),
        checkOut: new Date('2025-06-05'),
        propertyId: propertyA.id,
        tenantId: tenantA.id,
        status: 'CONFIRMED',
        totalAmount: 500,
        source: 'DIRECT'
      }
    });

    const bookingA2 = await prisma.booking.create({
      data: {
        guestName: 'Jane Smith',
        checkIn: new Date('2025-06-10'),
        checkOut: new Date('2025-06-15'),
        propertyId: propertyA.id,
        tenantId: tenantA.id,
        status: 'CONFIRMED',
        totalAmount: 750,
        source: 'OTA'
      }
    });

    const bookingB1 = await prisma.booking.create({
      data: {
        guestName: 'Bob Johnson',
        checkIn: new Date('2025-06-01'),
        checkOut: new Date('2025-06-03'),
        propertyId: propertyB.id,
        tenantId: tenantB.id,
        status: 'CONFIRMED',
        totalAmount: 300,
        source: 'DIRECT'
      }
    });

    const bookingB2 = await prisma.booking.create({
      data: {
        guestName: 'Alice Brown',
        checkIn: new Date('2025-06-05'),
        checkOut: new Date('2025-06-10'),
        propertyId: propertyB.id,
        tenantId: tenantB.id,
        status: 'CONFIRMED',
        totalAmount: 600,
        source: 'OTA'
      }
    });

    // Create payments (3 HOTEL_COLLECT, 3 OTA_COLLECT)
    // HOTEL_COLLECT payments for Tenant A
    await prisma.payment.create({
      data: {
        amount: 250,
        method: 'CREDIT_CARD',
        status: 'COMPLETED',
        type: 'HOTEL_COLLECT',
        bookingId: bookingA1.id,
        tenantId: tenantA.id,
        collectedBy: staffA.id,
        paymentDate: new Date('2025-05-25')
      }
    });

    await prisma.payment.create({
      data: {
        amount: 250,
        method: 'CASH',
        status: 'COMPLETED',
        type: 'HOTEL_COLLECT',
        bookingId: bookingA1.id,
        tenantId: tenantA.id,
        collectedBy: staffA.id,
        paymentDate: new Date('2025-06-05')
      }
    });

    // HOTEL_COLLECT payment for Tenant B
    await prisma.payment.create({
      data: {
        amount: 300,
        method: 'CREDIT_CARD',
        status: 'COMPLETED',
        type: 'HOTEL_COLLECT',
        bookingId: bookingB1.id,
        tenantId: tenantB.id,
        collectedBy: partnerB.id,
        paymentDate: new Date('2025-06-03')
      }
    });

    // OTA_COLLECT payments for Tenant A
    await prisma.payment.create({
      data: {
        amount: 750,
        method: 'BANK_TRANSFER',
        status: 'COMPLETED',
        type: 'OTA_COLLECT',
        bookingId: bookingA2.id,
        tenantId: tenantA.id,
        receivedFrom: 'Booking.com',
        paymentDate: new Date('2025-06-20')
      }
    });

    // OTA_COLLECT payments for Tenant B
    await prisma.payment.create({
      data: {
        amount: 300,
        method: 'BANK_TRANSFER',
        status: 'PENDING',
        type: 'OTA_COLLECT',
        bookingId: bookingB2.id,
        tenantId: tenantB.id,
        receivedFrom: 'Expedia',
        paymentDate: new Date('2025-06-15')
      }
    });

    await prisma.payment.create({
      data: {
        amount: 300,
        method: 'BANK_TRANSFER',
        status: 'COMPLETED',
        type: 'OTA_COLLECT',
        bookingId: bookingB2.id,
        tenantId: tenantB.id,
        receivedFrom: 'Expedia',
        paymentDate: new Date('2025-06-20')
      }
    });

    // Create 1 invoice for OTA payments
    const invoice = await prisma.invoice.create({
      data: {
        number: 'INV-2025-001',
        issueDate: new Date('2025-06-25'),
        dueDate: new Date('2025-07-25'),
        status: 'PAID',
        totalAmount: 750,
        tenantId: tenantA.id,
        otaName: 'Booking.com'
      }
    });

    // Connect payment to invoice
    await prisma.payment.update({
      where: {
        bookingId_type: {
          bookingId: bookingA2.id,
          type: 'OTA_COLLECT'
        }
      },
      data: {
        invoiceId: invoice.id
      }
    });

    // Create audit logs
    await prisma.auditLog.createMany({
      data: [
        {
          userId: partnerA.id,
          tenantId: tenantA.id,
          action: 'CREATE_BOOKING',
          resourceId: bookingA1.id,
          resourceType: 'BOOKING',
          metadata: JSON.stringify({
            guestName: 'John Doe',
            checkIn: '2025-06-01',
            checkOut: '2025-06-05'
          })
        },
        {
          userId: staffA.id,
          tenantId: tenantA.id,
          action: 'COLLECT_PAYMENT',
          resourceId: bookingA1.id,
          resourceType: 'PAYMENT',
          metadata: JSON.stringify({
            amount: 250,
            method: 'CREDIT_CARD'
          })
        },
        {
          userId: partnerB.id,
          tenantId: tenantB.id,
          action: 'CREATE_BOOKING',
          resourceId: bookingB1.id,
          resourceType: 'BOOKING',
          metadata: JSON.stringify({
            guestName: 'Bob Johnson',
            checkIn: '2025-06-01',
            checkOut: '2025-06-03'
          })
        }
      ]
    });

    console.log('Test data created successfully');
    return {
      tenants: { tenantA, tenantB },
      users: { superAdmin, partnerA, partnerB, staffA },
      properties: { propertyA, propertyB },
      bookings: { bookingA1, bookingA2, bookingB1, bookingB2 },
      invoice
    };
  } catch (error) {
    console.error('Error creating test data:', error);
    throw error;
  }
}
