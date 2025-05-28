import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Helper function to reset the database by deleting all records
 * This ensures tests start with a clean slate
 */
export async function resetDatabase() {
  try {
    // Delete all records in reverse order of dependencies
    await prisma.auditLog.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.tenant.deleteMany({});
    
    console.log('Database reset successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}
