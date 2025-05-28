# API Documentation PMS (Property Management System)

## Tổng quan API

Hệ thống PMS (Property Management System) cung cấp một RESTful API toàn diện để quản lý chỗ nghỉ, loại phòng, đặt phòng và các chức năng liên quan. API được xây dựng trên nền tảng NestJS và tuân thủ các tiêu chuẩn RESTful.

## Base URL

```
https://api.roomrise.com/v1
```

Trong môi trường phát triển:

```
http://localhost:3000/api/v1
```

## Xác thực

Tất cả các API endpoints (ngoại trừ `/auth/login` và `/auth/register`) đều yêu cầu xác thực JWT. Token JWT phải được gửi trong header `Authorization` theo định dạng:

```
Authorization: Bearer <token>
```

### Lấy token xác thực

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "MANAGER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Định dạng phản hồi

Tất cả các phản hồi API đều tuân theo định dạng sau:

### Phản hồi thành công

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Phản hồi lỗi

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## Phân trang

Các endpoints trả về danh sách hỗ trợ phân trang với các tham số query sau:

- `page`: Số trang (bắt đầu từ 1)
- `limit`: Số lượng bản ghi trên mỗi trang
- `sort`: Trường để sắp xếp
- `order`: Thứ tự sắp xếp (`asc` hoặc `desc`)

Ví dụ:

```
GET /bookings?page=2&limit=10&sort=checkIn&order=desc
```

Phản hồi cho các endpoints có phân trang:

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "meta": {
      "page": 2,
      "limit": 10,
      "totalItems": 45,
      "totalPages": 5
    }
  }
}
```

## API Endpoints

### Quản lý người dùng (Users)

#### Lấy danh sách người dùng

**Endpoint:** `GET /users`

**Quyền truy cập:** ADMIN

**Query Parameters:**
- `page`: Số trang
- `limit`: Số lượng bản ghi trên mỗi trang
- `search`: Tìm kiếm theo tên hoặc email

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "MANAGER",
        "createdAt": "2023-01-15T08:30:00Z",
        "updatedAt": "2023-01-15T08:30:00Z"
      },
      ...
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 25,
      "totalPages": 3
    }
  }
}
```

#### Lấy thông tin người dùng

**Endpoint:** `GET /users/:id`

**Quyền truy cập:** ADMIN hoặc chính người dùng đó

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "MANAGER",
    "createdAt": "2023-01-15T08:30:00Z",
    "updatedAt": "2023-01-15T08:30:00Z"
  }
}
```

#### Tạo người dùng mới

**Endpoint:** `POST /users`

**Quyền truy cập:** ADMIN

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Smith",
  "role": "STAFF"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "newuser@example.com",
    "name": "Jane Smith",
    "role": "STAFF",
    "createdAt": "2023-05-20T10:15:00Z",
    "updatedAt": "2023-05-20T10:15:00Z"
  },
  "message": "User created successfully"
}
```

#### Cập nhật thông tin người dùng

**Endpoint:** `PATCH /users/:id`

**Quyền truy cập:** ADMIN hoặc chính người dùng đó

**Request Body:**
```json
{
  "name": "Jane Smith Updated",
  "role": "MANAGER"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "newuser@example.com",
    "name": "Jane Smith Updated",
    "role": "MANAGER",
    "createdAt": "2023-05-20T10:15:00Z",
    "updatedAt": "2023-05-20T11:30:00Z"
  },
  "message": "User updated successfully"
}
```

#### Xóa người dùng

**Endpoint:** `DELETE /users/:id`

**Quyền truy cập:** ADMIN

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Quản lý chỗ nghỉ (Properties)

#### Lấy danh sách chỗ nghỉ

**Endpoint:** `GET /properties`

**Quyền truy cập:** ADMIN, MANAGER, STAFF

**Query Parameters:**
- `page`: Số trang
- `limit`: Số lượng bản ghi trên mỗi trang
- `search`: Tìm kiếm theo tên hoặc địa chỉ
- `status`: Lọc theo trạng thái (`ACTIVE`, `INACTIVE`)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "name": "Seaside Resort",
        "address": "123 Beach Road",
        "city": "Miami",
        "country": "USA",
        "description": "Beautiful beachfront resort",
        "status": "ACTIVE",
        "createdAt": "2023-02-10T09:45:00Z",
        "updatedAt": "2023-02-10T09:45:00Z",
        "userId": "550e8400-e29b-41d4-a716-446655440000"
      },
      ...
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 15,
      "totalPages": 2
    }
  }
}
```

#### Lấy thông tin chỗ nghỉ

**Endpoint:** `GET /properties/:id`

**Quyền truy cập:** ADMIN, MANAGER, STAFF

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Seaside Resort",
    "address": "123 Beach Road",
    "city": "Miami",
    "country": "USA",
    "description": "Beautiful beachfront resort",
    "status": "ACTIVE",
    "createdAt": "2023-02-10T09:45:00Z",
    "updatedAt": "2023-02-10T09:45:00Z",
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### Tạo chỗ nghỉ mới

**Endpoint:** `POST /properties`

**Quyền truy cập:** ADMIN, MANAGER

**Request Body:**
```json
{
  "name": "Mountain Lodge",
  "address": "456 Mountain View",
  "city": "Denver",
  "country": "USA",
  "description": "Cozy mountain retreat",
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "name": "Mountain Lodge",
    "address": "456 Mountain View",
    "city": "Denver",
    "country": "USA",
    "description": "Cozy mountain retreat",
    "status": "ACTIVE",
    "createdAt": "2023-05-25T14:20:00Z",
    "updatedAt": "2023-05-25T14:20:00Z",
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  },
  "message": "Property created successfully"
}
```

#### Cập nhật thông tin chỗ nghỉ

**Endpoint:** `PATCH /properties/:id`

**Quyền truy cập:** ADMIN, MANAGER (chỉ chỗ nghỉ do họ quản lý)

**Request Body:**
```json
{
  "name": "Mountain Lodge Resort",
  "description": "Luxury mountain retreat with stunning views",
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "name": "Mountain Lodge Resort",
    "address": "456 Mountain View",
    "city": "Denver",
    "country": "USA",
    "description": "Luxury mountain retreat with stunning views",
    "status": "ACTIVE",
    "createdAt": "2023-05-25T14:20:00Z",
    "updatedAt": "2023-05-25T15:10:00Z",
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  },
  "message": "Property updated successfully"
}
```

#### Xóa chỗ nghỉ

**Endpoint:** `DELETE /properties/:id`

**Quyền truy cập:** ADMIN, MANAGER (chỉ chỗ nghỉ do họ quản lý)

**Response:**
```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

### Quản lý loại phòng (Room Types)

#### Lấy danh sách loại phòng theo chỗ nghỉ

**Endpoint:** `GET /properties/:propertyId/room-types`

**Quyền truy cập:** ADMIN, MANAGER, STAFF

**Query Parameters:**
- `page`: Số trang
- `limit`: Số lượng bản ghi trên mỗi trang

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440004",
        "name": "Deluxe Ocean View",
        "description": "Spacious room with ocean view",
        "capacity": 2,
        "basePrice": 150.00,
        "propertyId": "550e8400-e29b-41d4-a716-446655440002",
        "createdAt": "2023-02-15T10:30:00Z",
        "updatedAt": "2023-02-15T10:30:00Z"
      },
      ...
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 5,
      "totalPages": 1
    }
  }
}
```

#### Lấy thông tin loại phòng

**Endpoint:** `GET /room-types/:id`

**Quyền truy cập:** ADMIN, MANAGER, STAFF

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "name": "Deluxe Ocean View",
    "description": "Spacious room with ocean view",
    "capacity": 2,
    "basePrice": 150.00,
    "propertyId": "550e8400-e29b-41d4-a716-446655440002",
    "createdAt": "2023-02-15T10:30:00Z",
    "updatedAt": "2023-02-15T10:30:00Z",
    "property": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Seaside Resort"
    }
  }
}
```

#### Tạo loại phòng mới

**Endpoint:** `POST /properties/:propertyId/room-types`

**Quyền truy cập:** ADMIN, MANAGER (chỉ chỗ nghỉ do họ quản lý)

**Request Body:**
```json
{
  "name": "Family Suite",
  "description": "Large suite for families",
  "capacity": 4,
  "basePrice": 250.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "name": "Family Suite",
    "description": "Large suite for families",
    "capacity": 4,
    "basePrice": 250.00,
    "propertyId": "550e8400-e29b-41d4-a716-446655440002",
    "createdAt": "2023-05-25T16:00:00Z",
    "updatedAt": "2023-05-25T16:00:00Z"
  },
  "message": "Room type created successfully"
}
```

#### Cập nhật thông tin loại phòng

**Endpoint:** `PATCH /room-types/:id`

**Quyền truy cập:** ADMIN, MANAGER (chỉ chỗ nghỉ do họ quản lý)

**Request Body:**
```json
{
  "name": "Luxury Family Suite",
  "basePrice": 275.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "name": "Luxury Family Suite",
    "description": "Large suite for families",
    "capacity": 4,
    "basePrice": 275.00,
    "propertyId": "550e8400-e29b-41d4-a716-446655440002",
    "createdAt": "2023-05-25T16:00:00Z",
    "updatedAt": "2023-05-25T16:30:00Z"
  },
  "message": "Room type updated successfully"
}
```

#### Xóa loại phòng

**Endpoint:** `DELETE /room-types/:id`

**Quyền truy cập:** ADMIN, MANAGER (chỉ chỗ nghỉ do họ quản lý)

**Response:**
```json
{
  "success": true,
  "message": "Room type deleted successfully"
}
```

### Quản lý đặt phòng (Bookings)

#### Lấy danh sách đặt phòng

**Endpoint:** `GET /bookings`

**Quyền truy cập:** ADMIN, MANAGER, STAFF

**Query Parameters:**
- `page`: Số trang
- `limit`: Số lượng bản ghi trên mỗi trang
- `propertyId`: Lọc theo chỗ nghỉ
- `roomTypeId`: Lọc theo loại phòng
- `startDate`: Lọc từ ngày (định dạng YYYY-MM-DD)
- `endDate`: Lọc đến ngày (định dạng YYYY-MM-DD)
- `bookingStatus`: Lọc theo trạng thái đặt phòng (`CONFIRMED`, `PENDING`, `CANCELLED`, `NO_SHOW`)
- `paymentStatus`: Lọc theo trạng thái thanh toán (`PAID`, `PARTIALLY_PAID`, `UNPAID`, `REFUNDED`)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440006",
        "guestName": "Alice Johnson",
        "contactEmail": "alice@example.com",
        "contactPhone": "+1234567890",
        "channel": "DIRECT",
        "reference": "BOOK-123",
        "checkIn": "2023-06-10T14:00:00Z",
        "checkOut": "2023-06-15T11:00:00Z",
        "nights": 5,
        "adults": 2,
        "children": 0,
        "totalAmount": 750.00,
        "commission": 0,
        "netRevenue": 750.00,
        "currency": "USD",
        "paymentMethod": "CREDIT_CARD",
        "paymentChannel": "Stripe",
        "paymentStatus": "PAID",
        "amountPaid": 750.00,
        "outstandingBalance": 0,
        "refundedAmount": 0,
        "bookingStatus": "CONFIRMED",
        "createdAt": "2023-05-01T09:00:00Z",
        "updatedAt": "2023-05-01T09:00:00Z",
        "propertyId": "550e8400-e29b-41d4-a716-446655440002",
        "roomTypeId": "550e8400-e29b-41d4-a716-446655440004",
        "property": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "name": "Seaside Resort"
        },
        "roomType": {
          "id": "550e8400-e29b-41d4-a716-446655440004",
          "name": "Deluxe Ocean View"
        }
      },
      ...
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 30,
      "totalPages": 3
    }
  }
}
```

#### Lấy thông tin đặt phòng

**Endpoint:** `GET /bookings/:id`

**Quyền truy cập:** ADMIN, MANAGER, STAFF

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440006",
    "guestName": "Alice Johnson",
    "contactEmail": "alice@example.com",
    "contactPhone": "+1234567890",
    "channel": "DIRECT",
    "reference": "BOOK-123",
    "checkIn": "2023-06-10T14:00:00Z",
    "checkOut": "2023-06-15T11:00:00Z",
    "nights": 5,
    "adults": 2,
    "children": 0,
    "totalAmount": 750.00,
    "commission": 0,
    "netRevenue": 750.00,
    "currency": "USD",
    "paymentMethod": "CREDIT_CARD",
    "paymentChannel": "Stripe",
    "paymentStatus": "PAID",
    "amountPaid": 750.00,
    "outstandingBalance": 0,
    "refundedAmount": 0,
    "invoiceUrl": "https://example.com/invoices/123",
    "assignedStaff": "550e8400-e29b-41d4-a716-446655440001",
    "specialRequests": "Late check-in, around 8 PM",
    "internalNotes": "VIP guest, provide welcome package",
    "bookingStatus": "CONFIRMED",
    "depositAmount": 200.00,
    "depositDate": "2023-05-01T09:00:00Z",
    "depositMethod": "CREDIT_CARD",
    "depositStatus": "PAID",
    "createdAt": "2023-05-01T09:00:00Z",
    "updatedAt": "2023-05-01T09:00:00Z",
    "propertyId": "550e8400-e29b-41d4-a716-446655440002",
    "roomTypeId": "550e8400-e29b-41d4-a716-446655440004",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "property": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Seaside Resort"
    },
    "roomType": {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "name": "Deluxe Ocean View"
    }
  }
}
```

#### Tạo đặt phòng mới

**Endpoint:** `POST /bookings`

**Quyền truy cập:** ADMIN, MANAGER, STAFF

**Request Body:**
```json
{
  "guestName": "Bob Smith",
  "contactEmail": "bob@example.com",
  "contactPhone": "+1987654321",
  "channel": "BOOKING_COM",
  "reference": "BOOK-456",
  "checkIn": "2023-07-05T14:00:00Z",
  "checkOut": "2023-07-10T11:00:00Z",
  "adults": 2,
  "children": 1,
  "totalAmount": 825.00,
  "commission": 82.50,
  "netRevenue": 742.50,
  "currency": "USD",
  "paymentMethod": "OTA_COLLECT",
  "paymentStatus": "PAID",
  "amountPaid": 825.00,
  "bookingStatus": "CONFIRMED",
  "specialRequests": "Need baby crib",
  "propertyId": "550e8400-e29b-41d4-a716-446655440002",
  "roomTypeId": "550e8400-e29b-41d4-a716-446655440004"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440007",
    "guestName": "Bob Smith",
    "contactEmail": "bob@example.com",
    "contactPhone": "+1987654321",
    "channel": "BOOKING_COM",
    "reference": "BOOK-456",
    "checkIn": "2023-07-05T14:00:00Z",
    "checkOut": "2023-07-10T11:00:00Z",
    "nights": 5,
    "adults": 2,
    "children": 1,
    "totalAmount": 825.00,
    "commission": 82.50,
    "netRevenue": 742.50,
    "currency": "USD",
    "paymentMethod": "OTA_COLLECT",
    "paymentChannel": "",
    "paymentStatus": "PAID",
    "amountPaid": 825.00,
    "outstandingBalance": 0,
    "refundedAmount": 0,
    "invoiceUrl": "",
    "assignedStaff": null,
    "specialRequests": "Need baby crib",
    "internalNotes": "",
    "bookingStatus": "CONFIRMED",
    "depositAmount": 0,
    "depositDate": null,
    "depositMethod": null,
    "depositStatus": null,
    "createdAt": "2023-05-25T17:00:00Z",
    "updatedAt": "2023-05-25T17:00:00Z",
    "propertyId": "550e8400-e29b-4
(Content truncated due to size limit. Use line ranges to read in chunks)