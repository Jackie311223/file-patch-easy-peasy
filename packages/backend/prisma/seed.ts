import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Helper function to create test data for the test suite
 * Creates tenants, users, properties, bookings, payments, and invoices
 */
export async function createTestData() {
  try {
    // QUAN TRỌNG: Các lệnh prisma.modelName.create(...) dưới đây sẽ chỉ hoạt động
    // nếu bạn đã định nghĩa đúng các model (Tenant, User, Property, Booking, Payment, Invoice, AuditLog)
    // trong file schema.prisma và đã chạy 'npx prisma generate' thành công.

    const tenantA = await prisma.tenant.create({ 
      data: { 
        name: 'Partner A',
        slug: 'TENANT_A_SLUG' // Đảm bảo slug là duy nhất
      } 
    });
    
    const tenantB = await prisma.tenant.create({ 
      data: { 
        name: 'Partner B',
        slug: 'TENANT_B_SLUG' // Đảm bảo slug là duy nhất
      } 
    });

    const superAdminPassword = await bcrypt.hash('123456', 10);
    const otherUsersPassword = await bcrypt.hash('password123', 10);

    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@roomrise.io',
        password: superAdminPassword,
        roles: ['SUPER_ADMIN'], 
        name: 'Super Admin'
      }
    });

    const partnerA = await prisma.user.create({
      data: {
        email: 'partnerA@test.com',
        password: otherUsersPassword,
        roles: ['PARTNER'], 
        name: 'Partner A',
        tenantId: tenantA.id
      }
    });

    const partnerB = await prisma.user.create({
      data: {
        email: 'partnerB@test.com',
        password: otherUsersPassword,
        roles: ['PARTNER'], 
        name: 'Partner B',
        tenantId: tenantB.id
      }
    });

    const staffA = await prisma.user.create({
      data: {
        email: 'staffA@test.com',
        password: otherUsersPassword,
        roles: ['STAFF'], 
        name: 'Staff A',
        tenantId: tenantA.id
      }
    });

    const propertyA = await prisma.property.create({
      data: {
        name: 'Property A',
        address: '123 Test St',
        userId: partnerA.id, 
        tenantId: tenantA.id
      }
    });

    const propertyB = await prisma.property.create({
      data: {
        name: 'Property B',
        address: '456 Test Ave',
        userId: partnerB.id,
        tenantId: tenantB.id
      }
    });
    
    // Placeholder cho roomTypeIds. Bạn cần tạo RoomType trước và lấy ID của chúng.
    // Hoặc nếu roomTypeId là optional và bạn có thể tạo booking không cần nó ban đầu.
    const placeholderRoomTypeIdA = "placeholder_room_type_id_a"; // Thay bằng ID thực hoặc logic tạo RoomType
    const placeholderRoomTypeIdB = "placeholder_room_type_id_b";


    const bookingA1 = await prisma.booking.create({
      data: {
        guestName: 'John Doe',
        contactPhone: '123456789',
        channel: 'DIRECT',
        checkIn: new Date('2025-06-01T14:00:00Z'), 
        checkOut: new Date('2025-06-05T12:00:00Z'),
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
        roomTypeId: placeholderRoomTypeIdA, 
        userId: partnerA.id,
        tenantId: tenantA.id
      }
    });

    const bookingA2 = await prisma.booking.create({
      data: {
        guestName: 'Jane Smith',
        contactPhone: '987654321',
        channel: 'BOOKING_COM',
        checkIn: new Date('2025-06-10T14:00:00Z'),
        checkOut: new Date('2025-06-15T12:00:00Z'),
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
        roomTypeId: placeholderRoomTypeIdA,
        userId: partnerA.id,
        tenantId: tenantA.id
      }
    });

    // Giả sử bạn đã có bookingB1 và bookingB2 được tạo tương tự bookingA1, bookingA2
    // và có các biến bookingB1.id, bookingB2.id, bookingB1.totalAmount, bookingB1.checkIn, bookingB1.checkOut
    // Ví dụ:
    const bookingB1 = await prisma.booking.create({ 
        data: { /* ...dữ liệu cho bookingB1 tương tự như bookingA1 nhưng với propertyB, tenantB, partnerB và roomTypeIdB ... */
            guestName: 'Bob Johnson', contactPhone: '555123456', channel: 'DIRECT',
            checkIn: new Date('2025-07-01T14:00:00Z'), checkOut: new Date('2025-07-03T12:00:00Z'),
            nights: 2, adults: 1, totalAmount: 300, netRevenue: 300, outstandingBalance: 0, currency: 'VND',
            paymentMethod: 'CREDIT_CARD', paymentStatus: 'PAID', amountPaid: 300, bookingStatus: 'CONFIRMED',
            propertyId: propertyB.id, roomTypeId: placeholderRoomTypeIdB, userId: partnerB.id, tenantId: tenantB.id
        }
    });


    const paymentA1_1 = await prisma.payment.create({
      data: {
        amount: 250,
        paymentDate: new Date('2025-05-25T10:00:00Z'),
        paymentType: 'HOTEL_COLLECT',
        method: 'BANK_TRANSFER',
        status: 'PAID',
        bookingId: bookingA1.id,
        tenantId: tenantA.id,
        collectedById: staffA.id
      }
    });
    // ... (Thêm các payment khác) ...

    const invoiceForA1 = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2025-001', 
        totalAmount: bookingA1.totalAmount, // Hoặc tính tổng từ các payment items
        status: 'PAID', 
        dueDate: bookingA1.checkOut, 
        issueDate: bookingA1.checkIn, 
        tenantId: tenantA.id,
        bookingId: bookingA1.id, // Gán invoice cho booking nếu mối quan hệ là 1-1 hoặc 1-n
        payments: { connect: [{ id: paymentA1_1.id }] } 
      }
    });

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
          resourceId: paymentA1_1.id, 
          resource: 'Payment',
          metadata: JSON.stringify({
            amount: 250,
            method: 'BANK_TRANSFER', 
            bookingId: bookingA1.id 
          })
        },
        // ... (Thêm các audit log khác tương tự) ...
      ]
    });

    console.log('Test data created successfully');
    return {
      tenants: { tenantA, tenantB },
      users: { superAdmin, partnerA, partnerB, staffA },
      properties: { propertyA, propertyB },
      bookings: { bookingA1, bookingA2, bookingB1, /* bookingB2 */ }, // Thêm bookingB1 vào return
      invoices: { invoiceForA1 }
    };
  } catch (error) {
    console.error('Error creating test data:', error);
    // Ném lỗi lại để quá trình seed biết là đã thất bại
    throw error; // Quan trọng: Ném lỗi để script gọi biết
  } finally {
    // Đảm bảo $disconnect được gọi ngay cả khi có lỗi
    // Tuy nhiên, nếu createTestData là một phần của script lớn hơn, việc disconnect ở đây có thể quá sớm.
    // await prisma.$disconnect(); // Cân nhắc việc $disconnect ở cấp cao nhất của script
  }
}

async function seedSuperAdmin() { 
  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@roomrise.io' }, 
  });
  if (!existingUser) {
    const password = await bcrypt.hash('123456', 10); 
    await prisma.user.create({
      data: {
        email: 'admin@roomrise.io',
        name: 'Super Admin',
        password,
        roles: ['SUPER_ADMIN'], 
      },
    });
    console.log('Seeded Super Admin user (admin@roomrise.io)');
  } else {
    console.log('Super Admin user (admin@roomrise.io) already exists.');
  }
}

// Hàm main để chạy seed
async function main() {
    try {
        await seedSuperAdmin();
        console.log('Super admin check/seed complete.');
        
        // Bỏ comment dòng dưới nếu bạn muốn tạo data test sau khi seed admin
        // await createTestData();
    } catch (error) {
        console.error('Error in seed script:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Gọi hàm main
main();