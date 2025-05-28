import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client'; // Import UserRole enum
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const routePath = request.route?.path || request.url; // Get route path

    this.logger.log(`RolesGuard activated for route: ${routePath}`);

    if (!requiredRoles) {
      this.logger.log(`No specific roles required for route ${routePath}. Access granted.`);
      return true;
    }

    this.logger.log(`Required roles for route ${routePath}: ${requiredRoles.join(', ')}`);

    if (!user || !user.role) {
      this.logger.warn(`User not authenticated or role missing for route ${routePath}. Access denied.`);
      return false;
    }

    this.logger.log(`User ID: ${user.id}, User Role: ${user.role} attempting to access route ${routePath}`);

    const hasRequiredRole = requiredRoles.some((role) => user.role === role);

    if (hasRequiredRole) {
      this.logger.log(`User ${user.id} with role ${user.role} has required role. Access granted to ${routePath}.`);
      return true;
    } else {
      this.logger.warn(`User ${user.id} with role ${user.role} does not have required role (${requiredRoles.join(', ')}). Access denied to ${routePath}.`);
      return false;
    }
  }
}
