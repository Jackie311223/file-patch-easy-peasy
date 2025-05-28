import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client'; // Import UserRole enum from Prisma client

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

