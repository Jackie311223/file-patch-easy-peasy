import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Helper function to run tests within a transaction that will be rolled back
 * This ensures database isolation between tests
 * 
 * @param testFn Function containing test logic that receives transaction client
 */
export async function withTestTransaction(
  testFn: (tx: Prisma.TransactionClient) => Promise<void>
): Promise<void> {
  try {
    // Start a transaction
    await prisma.$transaction(async (tx) => {
      // Run the test function with the transaction client
      await testFn(tx);
      
      // Always throw an error to force rollback
      // This ensures the transaction is rolled back regardless of test outcome
      throw new Error('ROLLBACK_TRANSACTION');
    });
  } catch (error) {
    // Ignore the rollback error
    if (error.message !== 'ROLLBACK_TRANSACTION') {
      throw error;
    }
  }
}

/**
 * Helper function to setup a test module with transaction support
 * Use this in beforeAll/beforeEach hooks
 * 
 * @param setupFn Function to run before tests with transaction client
 */
export async function setupTestModule(
  setupFn: (tx: Prisma.TransactionClient) => Promise<void>
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await setupFn(tx);
  });
}
