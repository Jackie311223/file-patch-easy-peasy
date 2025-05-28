import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // SUPER_ADMIN có thể truy cập mọi tenant
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }
    
    // Lấy resourceId từ request params hoặc body
    const resourceId = request.params.id;
    if (!resourceId) {
      return true; // Không có resource ID, không thể kiểm tra
    }
    
    // Xác định loại resource từ path
    const path = request.route.path;
    let resourceType: string;
    
    if (path.includes('/bookings')) {
      resourceType = 'booking';
    } else if (path.includes('/properties')) {
      resourceType = 'property';
    } else if (path.includes('/payments')) {
      resourceType = 'payment';
    } else if (path.includes('/invoices')) {
      resourceType = 'invoice';
    } else {
      return true; // Không phải resource cần kiểm tra tenant
    }
    
    // Lấy thông tin resource từ database
    let resource;
    switch (resourceType) {
      case 'booking':
        resource = await this.prisma.booking.findUnique({
          where: { id: resourceId },
          select: { tenantId: true },
        });
        break;
      case 'property':
        resource = await this.prisma.property.findUnique({
          where: { id: resourceId },
          select: { tenantId: true },
        });
        break;
      case 'payment':
        resource = await this.prisma.payment.findUnique({
          where: { id: resourceId },
          select: { tenantId: true },
        });
        break;
      case 'invoice':
        resource = await this.prisma.invoice.findUnique({
          where: { id: resourceId },
          select: { tenantId: true },
        });
        break;
    }
    
    if (!resource) {
      throw new ForbiddenException('Resource not found');
    }
    
    // Kiểm tra tenantId của resource có khớp với tenantId của user
    return resource.tenantId === user.tenantId;
  }
}
