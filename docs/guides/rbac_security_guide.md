# Hướng dẫn sử dụng hệ thống phân quyền và bảo mật PMS Roomrise

## 1. Tổng quan

Tài liệu này hướng dẫn cách sử dụng hệ thống phân quyền và bảo mật đã được triển khai cho PMS Roomrise theo kiến trúc SaaS multi-tenant. Hệ thống bao gồm:

- **RBAC (Role-Based Access Control)**: Phân quyền dựa trên vai trò người dùng
- **JWT Authentication**: Xác thực người dùng thông qua token
- **Tenant Isolation**: Cách ly dữ liệu giữa các tenant
- **Guards & Middleware**: Kiểm soát quyền truy cập vào các endpoint API

## 2. Cấu trúc phân quyền

### 2.1. Vai trò người dùng (UserRole)

Hệ thống định nghĩa 3 vai trò chính:

- **SUPER_ADMIN**: Toàn quyền với mọi tenant và dữ liệu
- **PARTNER**: Chỉ truy cập và thao tác với property hoặc booking có `property.ownerId = user.id`
- **STAFF**: Chỉ có quyền đọc (GET) booking, payment, invoice

### 2.2. Quyền hạn chi tiết

| Tài nguyên | Hành động | SUPER_ADMIN | PARTNER | STAFF |
|------------|-----------|-------------|---------|-------|
| Booking    | GET       | ✅          | ✅ (*)   | ✅     |
| Booking    | POST      | ✅          | ✅ (*)   | ❌     |
| Booking    | PATCH     | ✅          | ✅ (*)   | ❌     |
| Booking    | DELETE    | ✅          | ✅ (*)   | ❌     |
| Payment    | GET       | ✅          | ✅ (*)   | ✅     |
| Payment    | POST      | ✅          | ✅ (*)   | ❌     |
| Payment    | PATCH     | ✅          | ✅ (*)   | ❌     |
| Payment    | DELETE    | ✅          | ❌       | ❌     |
| Invoice    | GET       | ✅          | ✅ (*)   | ✅     |
| Invoice    | POST      | ✅          | ✅ (*)   | ❌     |
| Invoice    | PATCH     | ✅          | ✅ (*)   | ❌     |
| Message    | GET       | ✅          | ✅       | ✅     |
| Message    | POST      | ✅          | ✅       | ❌     |
| Message    | PATCH     | ✅          | ✅       | ✅     |

(*) PARTNER chỉ có quyền với tài nguyên thuộc property của họ

## 3. Sử dụng JWT Authentication

### 3.1. Đăng nhập và lấy token

```typescript
// Ví dụ request đăng nhập
const response = await axios.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// Lưu token
const token = response.data.access_token;
```

### 3.2. Sử dụng token trong request

```typescript
// Thêm token vào header của request
const config = {
  headers: {
    Authorization: `Bearer ${token}`
  }
};

// Gọi API với token
const response = await axios.get('/bookings', config);
```

### 3.3. Xử lý token hết hạn

Token JWT có thời hạn 30 phút. Khi token hết hạn, bạn cần đăng nhập lại để lấy token mới.

## 4. Sử dụng Roles Decorator

### 4.1. Áp dụng Roles Decorator trong controller

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('bookings')
export class BookingsController {
  // Chỉ SUPER_ADMIN, PARTNER và STAFF có thể xem danh sách booking
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER, UserRole.STAFF)
  findAll() {
    // ...
  }

  // Chỉ SUPER_ADMIN và PARTNER có thể tạo booking mới
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER)
  create(@Body() createBookingDto: CreateBookingDto) {
    // ...
  }
}
```

### 4.2. Áp dụng Public Decorator cho route không cần xác thực

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('public')
export class PublicController {
  @Get()
  @Public()
  findAll() {
    // Route này không yêu cầu xác thực
    // ...
  }
}
```

## 5. Tenant Isolation

### 5.1. Nguyên tắc cách ly tenant

- Mỗi user thuộc về một tenant (trừ SUPER_ADMIN có thể không thuộc tenant nào)
- Mỗi tài nguyên (booking, payment, invoice, property) thuộc về một tenant
- User chỉ có thể truy cập tài nguyên thuộc tenant của mình
- SUPER_ADMIN có thể truy cập tài nguyên của mọi tenant

### 5.2. Cách TenantGuard hoạt động

TenantGuard tự động kiểm tra tenantId của tài nguyên và so sánh với tenantId của user đang đăng nhập. Nếu không khớp, request sẽ bị từ chối với lỗi 403 Forbidden.

## 6. Quy tắc phân quyền cho PARTNER

### 6.1. Kiểm tra quyền sở hữu

Đối với PARTNER, hệ thống sẽ kiểm tra thêm quyền sở hữu:

- Đối với booking: `booking.property.ownerId === user.id`
- Đối với property: `property.ownerId === user.id`
- Đối với payment: `payment.booking.property.ownerId === user.id`
- Đối với invoice: Tất cả payment trong invoice phải thuộc property của PARTNER

### 6.2. Ví dụ logic kiểm tra quyền sở hữu

```typescript
// Kiểm tra quyền sở hữu cho booking
if (path.includes('/bookings')) {
  const booking = await prisma.booking.findUnique({
    where: { id: resourceId },
    include: { property: true },
  });
  
  return booking.property.ownerId === user.id;
}
```

## 7. Tích hợp vào Frontend

### 7.1. Lưu trữ và quản lý token

```typescript
// Lưu token vào localStorage
const saveToken = (token) => {
  localStorage.setItem('access_token', token);
};

// Lấy token từ localStorage
const getToken = () => {
  return localStorage.getItem('access_token');
};

// Xóa token khi đăng xuất
const removeToken = () => {
  localStorage.removeItem('access_token');
};
```

### 7.2. Tạo axios instance với interceptor

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Thêm token vào header của mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token hết hạn, chuyển hướng về trang đăng nhập
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 7.3. Kiểm tra quyền trong component

```typescript
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const BookingActions = ({ booking }) => {
  const { user } = useAuth();
  
  // Kiểm tra quyền chỉnh sửa booking
  const canEdit = 
    user.role === 'SUPER_ADMIN' || 
    (user.role === 'PARTNER' && booking.property.ownerId === user.id);
  
  return (
    <div>
      {canEdit && (
        <button onClick={() => handleEdit(booking.id)}>
          Edit
        </button>
      )}
      {/* Các action khác */}
    </div>
  );
};
```

## 8. Mở rộng và tùy chỉnh

### 8.1. Thêm role mới

Để thêm role mới, bạn cần:

1. Cập nhật enum `UserRole` trong Prisma schema
2. Chạy migration để cập nhật database
3. Cập nhật logic trong RolesGuard nếu cần

### 8.2. Thêm permission mới

Hệ thống hiện tại dựa trên role-based access control. Nếu cần permission-based access control chi tiết hơn:

1. Tạo model Permission trong Prisma schema
2. Tạo bảng trung gian RolePermission để liên kết Role và Permission
3. Cập nhật RolesGuard để kiểm tra permission thay vì role

## 9. Khắc phục sự cố

### 9.1. Lỗi 401 Unauthorized

- Kiểm tra token có hợp lệ không
- Kiểm tra token có hết hạn không
- Đảm bảo token được gửi đúng định dạng trong header

### 9.2. Lỗi 403 Forbidden

- Kiểm tra user có role phù hợp không
- Đối với PARTNER, kiểm tra quyền sở hữu với tài nguyên
- Kiểm tra tenantId của user và tài nguyên

### 9.3. Debug JWT token

Để debug JWT token, bạn có thể sử dụng công cụ online như [jwt.io](https://jwt.io/) để giải mã và kiểm tra nội dung token.

## 10. Kết luận

Hệ thống phân quyền và bảo mật PMS Roomrise cung cấp một giải pháp toàn diện cho việc xác thực, phân quyền và cách ly dữ liệu trong kiến trúc SaaS multi-tenant. Bằng cách tuân thủ các hướng dẫn trong tài liệu này, bạn có thể đảm bảo ứng dụng của mình an toàn và quản lý quyền truy cập một cách hiệu quả.
