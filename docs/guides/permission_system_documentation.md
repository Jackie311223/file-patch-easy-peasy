# Hệ thống phân quyền và kiểm soát truy cập PMS

## Tổng quan

Hệ thống phân quyền của PMS (Property Management System) được thiết kế theo mô hình RBAC (Role-Based Access Control), cho phép kiểm soát quyền truy cập dựa trên vai trò của người dùng trong hệ thống. Mô hình này đảm bảo rằng mỗi người dùng chỉ có thể truy cập và thực hiện các thao tác phù hợp với vai trò của họ.

## Các vai trò (Roles)

Hệ thống PMS định nghĩa ba vai trò chính:

1. **ADMIN**: Quản trị viên hệ thống
   - Có toàn quyền truy cập và quản lý tất cả các tính năng
   - Có thể tạo, xem, sửa, xóa tất cả dữ liệu
   - Quản lý người dùng và phân quyền

2. **MANAGER**: Quản lý chỗ nghỉ
   - Quản lý các chỗ nghỉ được giao
   - Tạo, xem, sửa, xóa thông tin về chỗ nghỉ, loại phòng, đặt phòng
   - Xem báo cáo và thống kê

3. **STAFF**: Nhân viên
   - Xem thông tin về chỗ nghỉ, loại phòng
   - Tạo và xem đặt phòng
   - Cập nhật trạng thái đặt phòng
   - Không có quyền xóa dữ liệu

## Ma trận quyền truy cập

| Tính năng/Tài nguyên | ADMIN | MANAGER | STAFF |
|----------------------|-------|---------|-------|
| **Quản lý người dùng** |
| Xem danh sách người dùng | ✓ | ✗ | ✗ |
| Tạo người dùng mới | ✓ | ✗ | ✗ |
| Chỉnh sửa người dùng | ✓ | ✗ | ✗ |
| Xóa người dùng | ✓ | ✗ | ✗ |
| **Quản lý chỗ nghỉ (Properties)** |
| Xem tất cả chỗ nghỉ | ✓ | ✓ | ✓ |
| Tạo chỗ nghỉ mới | ✓ | ✓ | ✗ |
| Chỉnh sửa chỗ nghỉ | ✓ | ✓ | ✗ |
| Xóa chỗ nghỉ | ✓ | ✓ | ✗ |
| **Quản lý loại phòng (Room Types)** |
| Xem loại phòng | ✓ | ✓ | ✓ |
| Tạo loại phòng mới | ✓ | ✓ | ✗ |
| Chỉnh sửa loại phòng | ✓ | ✓ | ✗ |
| Xóa loại phòng | ✓ | ✓ | ✗ |
| **Quản lý đặt phòng (Bookings)** |
| Xem đặt phòng | ✓ | ✓ | ✓ |
| Tạo đặt phòng mới | ✓ | ✓ | ✓ |
| Chỉnh sửa đặt phòng | ✓ | ✓ | ✓ |
| Xóa đặt phòng | ✓ | ✓ | ✗ |
| **Quản lý thanh toán (Payments)** |
| Xem thanh toán | ✓ | ✓ | ✓ |
| Tạo thanh toán mới | ✓ | ✓ | ✓ |
| Chỉnh sửa thanh toán | ✓ | ✓ | ✗ |
| Xóa thanh toán | ✓ | ✓ | ✗ |
| **Báo cáo và thống kê (Reports)** |
| Xem báo cáo | ✓ | ✓ | ✓ |
| Tạo báo cáo mới | ✓ | ✓ | ✗ |
| Xuất báo cáo | ✓ | ✓ | ✓ |
| **Cài đặt hệ thống (Settings)** |
| Xem cài đặt | ✓ | ✓ | ✗ |
| Thay đổi cài đặt | ✓ | ✗ | ✗ |

## Triển khai phân quyền trong Backend

### 1. Định nghĩa Role Enum

```typescript
// src/common/enums/role.enum.ts
export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}
```

### 2. Định nghĩa User Entity với Role

```typescript
// src/user/entities/user.entity.ts
import { Role } from '../common/enums/role.enum';

export class User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Tạo Guard để kiểm tra quyền

```typescript
// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### 4. Tạo Decorator để đánh dấu quyền

```typescript
// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

### 5. Sử dụng trong Controller

```typescript
// src/booking/booking.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('booking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  findAll() {
    return this.bookingService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id') id: string) {
    return this.bookingService.remove(id);
  }
}
```

## Triển khai phân quyền trong Frontend

### 1. Định nghĩa Role Type

```typescript
// src/types/user.ts
export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}
```

### 2. Tạo Auth Context

```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types/user';
import axios from '../api/axios';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRoles: Role[]) => boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  hasPermission: () => false,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user data or validate token
      axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUser(response.data);
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axios.post('/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (requiredRoles: Role[]) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. Tạo Protected Route Component

```typescript
// src/components/common/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types/user';

interface ProtectedRouteProps {
  requiredRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles = [] }) => {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !hasPermission(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
```

### 4. Sử dụng trong Routes

```typescript
// src/App.routes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import PropertiesPage from './pages/Properties/PropertiesPage';
import RoomTypesPage from './pages/RoomTypes/RoomTypesPage';
import BookingsPage from './pages/Bookings/BookingsPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Role } from './types/user';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:propertyId/room-types" element={<RoomTypesPage />} />
          
          <Route path="/bookings" element={<BookingsPage />} />
          
          {/* Admin only routes */}
          <Route element={<ProtectedRoute requiredRoles={[Role.ADMIN]} />}>
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
```

### 5. Tạo Permission Hook

```typescript
// src/hooks/usePermission.ts
import { useAuth } from './useAuth';
import { Role } from '../types/user';

export const usePermission = () => {
  const { user, hasPermission } = useAuth();

  const canCreateProperty = () => hasPermission([Role.ADMIN, Role.MANAGER]);
  const canEditProperty = () => hasPermission([Role.ADMIN, Role.MANAGER]);
  const canDeleteProperty = () => hasPermission([Role.ADMIN, Role.MANAGER]);

  const canCreateRoomType = () => hasPermission([Role.ADMIN, Role.MANAGER]);
  const canEditRoomType = () => hasPermission([Role.ADMIN, Role.MANAGER]);
  const canDeleteRoomType = () => hasPermission([Role.ADMIN, Role.MANAGER]);

  const canCreateBooking = () => hasPermission([Role.ADMIN, Role.MANAGER, Role.STAFF]);
  const canEditBooking = () => hasPermission([Role.ADMIN, Role.MANAGER, Role.STAFF]);
  const canDeleteBooking = () => hasPermission([Role.ADMIN, Role.MANAGER]);

  const canAccessSettings = () => hasPermission([Role.ADMIN]);
  const canManageUsers = () => hasPermission([Role.ADMIN]);

  return {
    canCreateProperty,
    canEditProperty,
    canDeleteProperty,
    canCreateRoomType,
    canEditRoomType,
    canDeleteRoomType,
    canCreateBooking,
    canEditBooking,
    canDeleteBooking,
    canAccessSettings,
    canManageUsers,
  };
};
```

### 6. Sử dụng trong Component

```typescript
// src/components/Properties/PropertyTable.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Property } from '../../types/property';
import Button from '../common/Button';
import { usePermission } from '../../hooks/usePermission';

interface PropertyTableProps {
  properties: Property[];
}

const PropertyTable: React.FC<PropertyTableProps> = ({ properties }) => {
  const navigate = useNavigate();
  const { canEditProperty, canDeleteProperty } = usePermission();

  const handleEdit = (id: string) => {
    navigate(`/properties/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    // Delete logic
  };

  return (
    <div className="overflow-x-auto bg-background rounded-lg shadow-md">
      <table className="min-w-full divide-y divide-background-muted">
        {/* Table header */}
        <thead className="bg-background-muted">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Address</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        {/* Table body */}
        <tbody className="bg-background divide-y divide-background-muted">
          {properties.map((property) => (
            <tr key={property.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{property.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-muted">{property.address}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-muted">{property.status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <Button
                    onClick={() => navigate(`/properties/${property.id}`)}
                    variant="outline"
                    size="sm"
                  >
                    View
                  </Button>
                  
                  {canEditProperty() && (
                    <Button
                      onClick={() => handleEdit(property.id)}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                  )}
                  
                  {canDeleteProperty() && (
                    <Button
                      onClick={() => handleDelete(property.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PropertyTable;
```

## Kiểm soát truy cập dựa trên dữ liệu (Data-based Access Control)

Ngoài kiểm soát truy cập dựa trên vai trò, hệ thống PMS còn triển khai kiểm soát truy cập dựa trên dữ liệu, đảm bảo rằng người dùng chỉ có thể truy cập dữ liệu thuộc về họ hoặc được chia sẻ với họ.

### 1. Triển khai trong Backend

```typescript
// src/booking/booking.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto, userId: string) {
    return this.prisma.booking.create({
      data: {
        ...createBookingDto,
        userId,
      },
    });
  }

  async findAll(userId: string, userRole: Role) {
    // Admin can see all bookings
    if (userRole === Role.ADMIN) {
      return this.prisma.booking.findMany({
        include: {
          property: true,
          roomType: true,
        },
      });
    }
    
    // Manager can see bookings for properties they manage
    if (userRole === Role.MANAGER) {
      const managedProperties = await this.prisma.property.findMany({
        where: { userId },
        select: { id: true },
      });
      
      const propertyIds = managedProperties.map(p => p.id);
      
      return this.prisma.booking.findMany({
        where: {
          propertyId: { in: propertyIds },
        },
        include: {
          property: true,
          roomType: true,
        },
      });
    }
    
    // Staff can only see bookings assigned to them
    return this.prisma.booking.findMany({
      where: {
        OR: [
          { userId },
          { assignedStaff: userId },
        ],
      },
      include: {
        property: true,
        roomType: true,
      },
    });
  }

  async findOne(id: string, userId: string, userRole: Role) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        property: true,
        roomType: true,
      },
    });
    
    if (!booking) {
      return null;
    }
    
    // Admin can access any booking
    if (userRole === Role.ADMIN) {
      return booking;
    }
    
    // Manager can access bookings for properties they manage
    if (userRole === Role.MANAGER) {
      const isManager = await this.prisma.property.findFirst({
        where: {
          id: booking.propertyId,
          userId,
        },
      });
      
      if (isManager) {
        return booking;
      }
    }
    
    // Staff can only access bookings assigned to them
    if (booking.userId === userId || booking.assignedStaff === userId) {
      return booking;
    }
    
    throw new ForbiddenException('You do not have permission to access this booking');
  }

  async update(id: string, updateBookingDto: UpdateBookingDto, userId: string, userRole: Role) {
    // Check if user has permission to update this booking
    await this.findOne(id, userId, userRole);
    
    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
    });
  }

  async remove(id: string, userId: string, userRole: Role) {
    // Only Admin and Manager can delete bookings
    if (userRole === Role.STAFF) {
      throw new ForbiddenException('Staff members cannot delete bookings');
    }
    
    // Check if user has permission to access this booking
    await this.findOne(id, userId, userRole);
    
    return this.prisma.booking.delete({
      where: { id },
    });
  }
}
```

### 2. Triển khai trong Frontend

```typescript
// src/contexts/BookingsContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from '../api/axios';
import { Booking } from '../types/booking';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types/user';

interface BookingsContextType {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  getBooking: (id: string) => Promise<Booking | null>;
  createBooking: (bookingData: any) => Promise<Booking>;
  updateBooking: (id: string, bookingData: any) => Promise<Booking>;
  deleteBooking: (id: string) => Promise<void>;
}

export const BookingsContext = createContext<BookingsContextType>({
  bookings: [],
  loading: false,
  error: null,
  fetchBookings: async () => {},
  getBooking: async () => null,
  createBooking: async () => ({ id: '' } as Booking),
  updateBooking: async () => ({ id: '' } as Booking),
  deleteBooking: async () => {},
});

export const BookingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/bookings');
      setBookings(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const getBooking = async (id: string): Promise<Booking | null> => {
    try {
      const response = await axios.get(`/bookings/${id}`);
      return response.data;
    } catch (err) {
      return null;
    }
  };

  const createBooking = async (bookingData: any): Promise<Booking> => {
    const response = await axios.post('/bookings', bookingData);
    setBookings([...bookings, response.data]);
    return response.data;
  };

  const updateBooking = async (id: string, bookingData: any): Promise<Booking> => {
    const response = await axios.patch(`/bookings/${id}`, bookingData);
    setBookings(bookings.map(booking => booking.id === id ? response.data : booking));
    return response.data;
  };

  const deleteBooking = async (id: string): Promise<void> => {
    // Check if user has permission to delete bookings
    if (user?.role === Role.STAFF) {
      throw new Error('You do not have permission to delete bookings');
    }
    
    await axios.delete(`/bookings/${id}`);
    setBookings(bookings.filter(booking => booking.id !== id));
  };

  return (
    <BookingsContext.Provider value={{
      bookings,
      loading,
      error,
      fetchBookings,
      getBooking,
      createBooking,
      updateBooking,
      deleteBooking,
    }}>
      {children}
    </BookingsContext.Provider>
  );
};
```

## Bảo mật và xác thực

### 1. JWT Authentication

Hệ thống PMS sử dụng JWT (JSON Web Tokens) để xác thực người dùng và duy trì phiên đăng nhập.

```typescript
// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token: this.jwtService.sign(payload),
    };
  }
}
```

### 2. JWT Strategy

```typescript
// src/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
```

### 3. JWT Auth Guard

```typescript
// src/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

## Tổng kết

Hệ thống phân quyền và kiểm soát truy cập của PMS được thiết kế để đảm bảo:

1. **Bảo mật**: Chỉ người dùng đã xác thực mới có thể truy cập hệ thống
2. **Phân quyền dựa trên vai trò**: Mỗi người dùng chỉ có thể thực hiện các thao tác phù hợp với vai trò của họ
3. **Kiểm soát truy cập dựa trên dữ liệu**: Người dùng chỉ có thể truy cập dữ liệu thuộc về họ hoặc được chia sẻ với họ
4. **Tính linh hoạt**: Hệ thống có thể dễ dàng mở rộng với các vai trò và quyền mới

Mô hình RBAC kết hợp với kiểm soát truy cập dựa trên dữ liệu tạo nên một hệ thống phân quyền mạnh mẽ và linh hoạt, đáp ứng đầy đủ nhu cầu của một hệ thống quản lý chỗ nghỉ hiện đại.
