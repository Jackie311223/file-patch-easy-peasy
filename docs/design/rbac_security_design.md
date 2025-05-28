# Thiết kế hệ thống RBAC và bảo mật cho PMS Roomrise

## 1. Tổng quan

Tài liệu này mô tả thiết kế chi tiết cho hệ thống phân quyền và bảo mật của PMS Roomrise theo kiến trúc SaaS multi-tenant, bao gồm:

- Hệ thống phân quyền RBAC (Role-Based Access Control)
- JWT Authentication
- Tenant Isolation
- Middleware và Guard

## 2. Cập nhật Prisma Schema

### UserRole Enum

```prisma
enum UserRole {
  SUPER_ADMIN
  PARTNER
  STAFF
}
```

### User Model

```prisma
model User {
  id          String     @id @default(uuid())
  email       String     @unique
  name        String?
  password    String     // Hashed password
  role        UserRole   // Sử dụng enum UserRole mới
  tenantId    String?    // Optional: SUPER_ADMIN có thể không thuộc tenant nào
  
  // Relations
  tenant      Tenant?    @relation(fields: [tenantId], references: [id])
  ownedProperties Property[] @relation("OwnedProperties") // Properties owned by this user
  // Các relation khác giữ nguyên
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```

## 3. JWT Authentication

### JWT Strategy

```typescript
// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Lấy thông tin user từ database để đảm bảo user vẫn tồn tại và active
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Trả về object user sẽ được gắn vào request.user
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
  }
}
```

### JWT Auth Guard

```typescript
// src/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Kiểm tra nếu route được đánh dấu là public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    // Xác thực JWT token
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // Xử lý lỗi xác thực
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}
```

### Public Decorator

```typescript
// src/auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

## 4. Tenant Guard

```typescript
// src/auth/guards/tenant.guard.ts
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
    
    // Lấy tenantId từ request params hoặc body
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
```

## 5. Role Guard và Decorator

### Roles Decorator

```typescript
// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

### Roles Guard

```typescript
// src/auth/guards/roles.guard.ts
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
```

## 6. Tích hợp vào App Module

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { TenantGuard } from './auth/guards/tenant.guard';
// ... other imports

@Module({
  imports: [
    // ... other modules
    AuthModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Áp dụng JwtAuthGuard toàn cục
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Áp dụng RolesGuard toàn cục
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Áp dụng TenantGuard toàn cục
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
})
export class AppModule {}
```

## 7. Sử dụng trong Controller

```typescript
// Ví dụ sử dụng trong BookingsController
import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER, UserRole.STAFF)
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER, UserRole.STAFF)
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER)
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER)
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER)
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
```

## 8. Quy tắc phân quyền chi tiết

### SUPER_ADMIN
- Toàn quyền với mọi tenant và dữ liệu
- Có thể thực hiện mọi thao tác trên tất cả các resource

### PARTNER
- Chỉ truy cập và thao tác với property hoặc booking có `property.ownerId = user.id`
- Có thể xem, tạo, sửa, xóa các resource liên quan đến property của mình
- Có thể xem danh sách và chi tiết booking, payment, invoice liên quan đến property của mình
- Có thể tạo và cập nhật booking, payment, invoice liên quan đến property của mình

### STAFF
- Chỉ có quyền đọc (GET) booking, payment, invoice
- Không có quyền tạo, sửa, xóa bất kỳ resource nào

## 9. Luồng xác thực và phân quyền

1. **Xác thực JWT**:
   - Client gửi request với JWT token trong header
   - JwtAuthGuard xác thực token và giải mã thông tin user
   - Thông tin user được gắn vào `request.user`

2. **Kiểm tra Tenant**:
   - TenantGuard kiểm tra tenantId của resource có khớp với tenantId của user
   - SUPER_ADMIN được phép truy cập mọi tenant
   - Các role khác chỉ được truy cập resource trong tenant của mình

3. **Kiểm tra Role**:
   - RolesGuard kiểm tra user có role phù hợp với yêu cầu của endpoint không
   - Nếu là PARTNER, kiểm tra thêm quyền sở hữu với resource
   - STAFF chỉ được phép thực hiện các thao tác GET

4. **Xử lý Business Logic**:
   - Sau khi vượt qua các guard, request được chuyển đến controller và service
   - Service thực hiện business logic và trả về kết quả

## 10. Kết luận

Thiết kế này cung cấp một hệ thống phân quyền và bảo mật toàn diện cho PMS Roomrise, đảm bảo:

- Xác thực người dùng thông qua JWT
- Phân quyền dựa trên vai trò (RBAC)
- Cách ly dữ liệu giữa các tenant
- Kiểm soát quyền sở hữu cho PARTNER
- Giới hạn quyền truy cập cho STAFF

Hệ thống này có thể dễ dàng mở rộng trong tương lai với các role và permission mới khi cần thiết.
