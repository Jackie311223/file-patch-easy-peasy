import { User as PrismaUser, UserRole } from '@prisma/client';

// Define a proper User interface that matches what the calendar service expects
export interface User {
  id: string;
  tenantId: string;
  role: UserRole;
  email?: string;
  name?: string;
}

// Helper function to convert from Request.user to our expected User interface
export function createUserContext(user: any): User {
  return {
    id: user.id || '',
    tenantId: user.tenantId || '',
    role: user.role || UserRole.STAFF,
    email: user.email,
    name: user.name
  };
}
