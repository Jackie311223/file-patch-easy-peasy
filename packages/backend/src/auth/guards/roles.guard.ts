import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true; // Không yêu cầu role cụ thể
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // Kiểm tra user có role phù hợp không
    if (!requiredRoles.includes(user.role)) {
      return false;
    }
    
    // Nếu là PARTNER, cần kiểm tra thêm quyền sở hữu
    if (user.role === 'PARTNER') {
      const request = context.switchToHttp().getRequest();
      const resourceId = request.params.id;
      
      if (!resourceId) {
        return true; // Không có resource ID, không thể kiểm tra
      }
      
      // Xác định loại resource từ path
      const path = request.route.path;
      
      // Kiểm tra quyền sở hữu cho booking
      if (path.includes('/bookings')) {
        const booking = await this.prisma.booking.findUnique({
          where: { id: resourceId },
          include: { property: true },
        });
        
        if (!booking) {
          throw new ForbiddenException('Resource not found');
        }
        
        return booking.property.ownerId === user.id;
      }
      
      // Kiểm tra quyền sở hữu cho property
      if (path.includes('/properties')) {
        const property = await this.prisma.property.findUnique({
          where: { id: resourceId },
        });
        
        if (!property) {
          throw new ForbiddenException('Resource not found');
        }
        
        return property.ownerId === user.id;
      }
      
      // Kiểm tra quyền sở hữu cho payment
      if (path.includes('/payments')) {
        const payment = await this.prisma.payment.findUnique({
          where: { id: resourceId },
          include: { booking: { include: { property: true } } },
        });
        
        if (!payment) {
          throw new ForbiddenException('Resource not found');
        }
        
        return payment.booking.property.ownerId === user.id;
      }
      
      // Kiểm tra quyền sở hữu cho invoice (phức tạp hơn vì invoice có nhiều payment)
      if (path.includes('/invoices')) {
        // Lấy tất cả payment của invoice
        const invoice = await this.prisma.invoice.findUnique({
          where: { id: resourceId },
          include: { 
            payments: { 
              include: { 
                booking: { 
                  include: { 
                    property: true 
                  } 
                } 
              } 
            } 
          },
        });
        
        if (!invoice) {
          throw new ForbiddenException('Resource not found');
        }
        
        // Kiểm tra tất cả payment có thuộc property của user không
        return invoice.payments.every(payment => 
          payment.booking.property.ownerId === user.id
        );
      }
    }
    
    return true;
  }
}
