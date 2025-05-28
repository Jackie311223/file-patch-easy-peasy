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
        slug: 'TENANT_A'
      } 
    });
    
    const tenantB = await prisma.tenant.create({ 
      data: { 
        name: 'Partner B',
        slug: 'TENANT_B'
      } 
    });

    // Hash password for test users
    // FIX: Use requested password '123456' for SUPER_ADMIN
    const superAdminPassword = await bcrypt.hash('123456', 10);
    const otherUsersPassword = await bcrypt.hash('password123', 10); // Keep original for other test users

    // Create users
    const superAdmin = await prisma.user.create({
      data: {
        // FIX: Use requested email 'admin@roomrise.io'
        email: 'admin@roomrise.io',
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
        name: 'Super Admin'
        // tenantId is null for SUPER_ADMIN
      }
    });

    const partnerA = await prisma.user.create({
      data: {
        email: 'partnerA@test.com',
        password: otherUsersPassword,
        role: 'PARTNER',
        name: 'Partner A',
        tenantId: tenantA.id
      }
    });

    const partnerB = await prisma.user.create({
      data: {
        email: 'partnerB@test.com',
        password: otherUsersPassword,
        role: 'PARTNER',
        name: 'Partner B',
        tenantId: tenantB.id
      }
    });

    const staffA = await prisma.user.create({
      data: {
        email: 'staffA@test.com',
        password: otherUsersPassword,
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
        // ownerId: partnerA.id, // Assuming owner is the partner
        userId: partnerA.id, // Assuming user managing is the partner
        tenantId: tenantA.id
      }
    });

    const propertyB = await prisma.property.create({
      data: {
        name: 'Property B',
        address: '456 Test Ave',
        // ownerId: partnerB.id,
        userId: partnerB.id,
        tenantId: tenantB.id
      }
    });

    // Create bookings (2 for each property)
    // NOTE: roomTypeId is hardcoded, ensure RoomType exists or adjust logic
    const bookingA1 = await prisma.booking.create({
      data: {
        guestName: 'John Doe',
        contactPhone: '123456789',
        channel: 'DIRECT',
        checkIn: new Date('2025-06-01'),
        checkOut: new Date('2025-06-05'),
        nights: 4,
        adults: 2,
        totalAmount: 500,
        netRevenue: 500,
        outstandingBalance: 0,
        currency: 'VND',
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        amountPaid: 500,
        bookingStatus: 'CONFIRMED',
        propertyId: propertyA.id,
        // roomTypeId: 'REPLACE_WITH_ACTUAL_ROOMTYPE_ID_A', 
        userId: partnerA.id,
        tenantId: tenantA.id
      }
    });

    const bookingA2 = await prisma.booking.create({
      data: {
        guestName: 'Jane Smith',
        contactPhone: '987654321',
        channel: 'BOOKING_COM',
        checkIn: new Date('2025-06-10'),
        checkOut: new Date('2025-06-15'),
        nights: 5,
        adults: 2,
        totalAmount: 750,
        netRevenue: 700,
        outstandingBalance: 0,
        currency: 'VND',
        paymentMethod: 'BANK_TRANSFER',
        paymentStatus: 'PAID',
        amountPaid: 750,
        bookingStatus: 'CONFIRMED',
        propertyId: propertyA.id,
        // roomTypeId: 'REPLACE_WITH_ACTUAL_ROOMTYPE_ID_A', 
        userId: partnerA.id,
        tenantId: tenantA.id
      }
    });

    const bookingB1 = await prisma.booking.create({
      data: {
        guestName: 'Bob Johnson',
        contactPhone: '555123456',
        channel: 'DIRECT',
        checkIn: new Date('2025-06-01'),
        checkOut: new Date('2025-06-03'),
        nights: 2,
        adults: 1,
        totalAmount: 300,
        netRevenue: 300,
        outstandingBalance: 0,
        currency: 'VND',
        paymentMethod: 'CREDIT_CARD',
        paymentStatus: 'PAID',
        amountPaid: 300,
        bookingStatus: 'CONFIRMED',
        propertyId: propertyB.id,
        // roomTypeId: 'REPLACE_WITH_ACTUAL_ROOMTYPE_ID_B', 
        userId: partnerB.id,
        tenantId: tenantB.id
      }
    });

    const bookingB2 = await prisma.booking.create({
      data: {
        guestName: 'Alice Brown',
        contactPhone: '555987654',
        channel: 'EXPEDIA',
        checkIn: new Date('2025-06-05'),
        checkOut: new Date('2025-06-10'),
        nights: 5,
        adults: 2,
        totalAmount: 600,
        netRevenue: 550,
        outstandingBalance: 0,
        currency: 'VND',
        paymentMethod: 'BANK_TRANSFER',
        paymentStatus: 'PAID',
        amountPaid: 600,
        bookingStatus: 'CONFIRMED',
        propertyId: propertyB.id,
        // roomTypeId: 'REPLACE_WITH_ACTUAL_ROOMTYPE_ID_B', 
        userId: partnerB.id,
        tenantId: tenantB.id
      }
    });

    // Create payments (3 HOTEL_COLLECT, 3 OTA_COLLECT)
    // HOTEL_COLLECT payments for Tenant A
    await prisma.payment.create({
      data: {
        amount: 250,
        paymentDate: new Date('2025-05-25'),
        paymentType: 'HOTEL_COLLECT',
        method: 'BANK_TRANSFER',
        status: 'PAID',
        bookingId: bookingA1.id,
        tenantId: tenantA.id,
        collectedById: staffA.id
      }
    });

    await prisma.payment.create({
      data: {
        amount: 250,
        paymentDate: new Date('2025-06-05'),
        paymentType: 'HOTEL_COLLECT',
        method: 'CASH',
        status: 'PAID',
        bookingId: bookingA1.id,
        tenantId: tenantA.id,
        collectedById: staffA.id
      }
    });

    // HOTEL_COLLECT payment for Tenant B
    await prisma.payment.create({
      data: {
        amount: 300,
        paymentDate: new Date('2025-06-03'),
        paymentType: 'HOTEL_COLLECT',
        method: 'BANK_TRANSFER',
        status: 'PAID',
        bookingId: bookingB1.id,
        tenantId: tenantB.id,
        collectedById: partnerB.id
      }
    });

    // OTA_COLLECT payments for Tenant A
    await prisma.payment.create({
      data: {
        amount: 750,
        paymentDate: new Date('2025-06-20'),
        paymentType: 'OTA_COLLECT',
        method: 'BANK_TRANSFER',
        status: 'PAID',
        receivedFrom: 'Booking.com',
        bookingId: bookingA2.id,
        tenantId: tenantA.id
      }
    });

    // OTA_COLLECT payments for Tenant B
    await prisma.payment.create({
      data: {
        amount: 300,
        paymentDate: new Date('2025-06-15'),
        paymentType: 'OTA_COLLECT',
        method: 'BANK_TRANSFER',
        status: 'UNPAID',
        receivedFrom: 'Expedia',
        bookingId: bookingB2.id,
        tenantId: tenantB.id
      }
    });

    await prisma.payment.create({
      data: {
        amount: 300,
        paymentDate: new Date('2025-06-20'),
        paymentType: 'OTA_COLLECT',
        method: 'BANK_TRANSFER',
        status: 'PAID',
        receivedFrom: 'Expedia',
        bookingId: bookingB2.id,
        tenantId: tenantB.id
      }
    });

    // Create 1 invoice for OTA payments
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2025-001',
        totalAmount: 750,
        status: 'PAID',
        tenantId: tenantA.id
      }
    });

    // Connect payment to invoice
    const paymentToConnect = await prisma.payment.findFirst({
      where: {
        bookingId: bookingA2.id,
        paymentType: 'OTA_COLLECT'
      }
    });

    if (paymentToConnect) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          payments: {
            connect: { id: paymentToConnect.id }
          }
        }
      });
    }

    // Create audit logs
    await prisma.auditLog.createMany({
      data: [
        {
          userId: partnerA.id,
          tenantId: tenantA.id,
          action: 'CREATE_BOOKING',
          resourceId: bookingA1.id,
          resource: 'Booking',
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
          resource: 'Payment',
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
          resource: 'Booking',
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
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function if the script is run directly
if (require.main === module) {
  createTestData();
}

