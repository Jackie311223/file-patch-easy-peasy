import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

/**
 * Helper function to get a JWT token for a specific user role
 * @param role The role of the user to login as
 * @returns JWT token
 */
export async function loginAs(role: 'SUPER_ADMIN' | 'PARTNER_A' | 'PARTNER_B' | 'STAFF'): Promise<string> {
  let user;
  
  if (role === 'SUPER_ADMIN') {
    user = await prisma.user.findFirst({ 
      where: { role: 'SUPER_ADMIN' } 
    });
  } else if (role === 'PARTNER_A') {
    user = await prisma.user.findFirst({ 
      where: { 
        role: 'PARTNER',
        email: 'partnerA@test.com'
      } 
    });
  } else if (role === 'PARTNER_B') {
    user = await prisma.user.findFirst({ 
      where: { 
        role: 'PARTNER',
        email: 'partnerB@test.com'
      } 
    });
  } else if (role === 'STAFF') {
    user = await prisma.user.findFirst({ 
      where: { 
        role: 'STAFF',
        email: 'staffA@test.com'
      } 
    });
  }

  if (!user) {
    throw new Error(`User with role ${role} not found. Make sure to run createTestData() first.`);
  }

  // Create JWT token with user id, role, and tenantId
  const token = jwt.sign(
    { 
      id: user.id, 
      role: user.role, 
      tenantId: user.tenantId 
    }, 
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return token;
}

/**
 * Helper function to get authorization header with JWT token
 * @param role The role of the user to login as
 * @returns Authorization header object
 */
export async function getAuthHeader(role: 'SUPER_ADMIN' | 'PARTNER_A' | 'PARTNER_B' | 'STAFF'): Promise<{ Authorization: string }> {
  const token = await loginAs(role);
  return { Authorization: `Bearer ${token}` };
}
