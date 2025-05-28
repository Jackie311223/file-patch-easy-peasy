# Tài liệu dự án PMS (Property Management System)

## Tổng quan dự án

Dự án PMS (Property Management System) là một hệ thống quản lý chỗ nghỉ được phát triển cho Roomrise Solutions. Hệ thống này cho phép quản lý các chỗ nghỉ (properties), loại phòng (room types), đặt phòng (bookings) và các chức năng liên quan khác.

## Công nghệ sử dụng

### Frontend
- **Framework**: React với TypeScript
- **Routing**: React Router v6
- **State Management**: React Context API
- **Form Handling**: React Hook Form với Zod validation
- **UI Components**: Tailwind CSS và shadcn/ui
- **Icons**: Heroicons
- **Build Tool**: Vite

### Backend
- **Framework**: NestJS với TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL (được cấu hình qua Prisma)
- **API**: RESTful API
- **Authentication**: JWT (JSON Web Tokens)

## Cấu trúc dự án

### Frontend

```
/frontend
├── public/                # Static assets
├── src/
│   ├── api/               # API client setup
│   ├── components/        # Reusable components
│   │   ├── Bookings/      # Booking-related components
│   │   ├── Properties/    # Property-related components
│   │   ├── RoomTypes/     # Room type-related components
│   │   ├── common/        # Common UI components
│   │   └── layout/        # Layout components (Sidebar, Header)
│   ├── contexts/          # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── mock/              # Mock data for demo mode
│   ├── pages/             # Page components
│   │   ├── Bookings/      # Booking pages
│   │   ├── Calendar/      # Calendar pages
│   │   ├── Dashboard/     # Dashboard pages
│   │   ├── Inbox/         # Inbox pages
│   │   ├── Payments/      # Payments pages
│   │   ├── Properties/    # Property pages
│   │   ├── Reports/       # Reports pages
│   │   ├── RoomTypes/     # Room type pages
│   │   └── Settings/      # Settings pages
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── vite-env.d.ts      # Vite environment types
├── .eslintrc.cjs          # ESLint configuration
├── index.html             # HTML template
├── package.json           # Project dependencies
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

### Backend

```
/pms_backend
├── prisma/
│   ├── migrations/        # Database migrations
│   └── schema.prisma      # Prisma schema
├── src/
│   ├── booking/           # Booking module
│   │   ├── dto/           # Data Transfer Objects
│   │   ├── booking.controller.ts
│   │   ├── booking.module.ts
│   │   ├── booking.service.ts
│   │   └── booking.entity.ts
│   ├── property/          # Property module
│   ├── room-type/         # Room type module
│   ├── user/              # User module
│   ├── auth/              # Authentication module
│   ├── common/            # Common utilities and middleware
│   ├── app.module.ts      # Main application module
│   └── main.ts            # Application entry point
├── test/                  # Test files
├── .env                   # Environment variables
├── nest-cli.json          # NestJS CLI configuration
├── package.json           # Project dependencies
└── tsconfig.json          # TypeScript configuration
```

## Mô hình dữ liệu

### Các entity chính

#### User (Người dùng)
- id: string
- email: string
- password: string (hashed)
- name: string
- role: enum (ADMIN, MANAGER, STAFF)
- createdAt: DateTime
- updatedAt: DateTime

#### Property (Chỗ nghỉ)
- id: string
- name: string
- address: string
- city: string
- country: string
- description: string
- status: enum (ACTIVE, INACTIVE)
- createdAt: DateTime
- updatedAt: DateTime
- userId: string (owner)

#### RoomType (Loại phòng)
- id: string
- name: string
- description: string
- capacity: number
- basePrice: number
- propertyId: string
- createdAt: DateTime
- updatedAt: DateTime

#### Booking (Đặt phòng)
- id: string
- guestName: string
- contactEmail: string
- contactPhone: string
- channel: enum (AIRBNB, AGODA, BOOKING_COM, CTRIP, EXPEDIA, TRAVELOKA, KLOOK, DIRECT, OTHER)
- reference: string
- checkIn: Date
- checkOut: Date
- nights: number
- adults: number
- children: number
- totalAmount: number
- commission: number
- netRevenue: number
- currency: string
- paymentMethod: enum (OTA_COLLECT, HOTEL_COLLECT, UPC, CASH, BANK_TRANSFER, CREDIT_CARD, MOMO)
- paymentChannel: string
- paymentStatus: enum (PAID, PARTIALLY_PAID, UNPAID, REFUNDED)
- amountPaid: number
- outstandingBalance: number
- refundedAmount: number
- invoiceUrl: string
- assignedStaff: string
- specialRequests: string
- internalNotes: string
- bookingStatus: enum (CONFIRMED, PENDING, CANCELLED, NO_SHOW)
- depositAmount: number
- depositDate: Date
- depositMethod: enum (CASH, BANK_TRANSFER, MOMO, UPC, CREDIT_CARD)
- depositStatus: enum (PENDING, PAID, REFUNDED, FORFEITED)
- createdAt: DateTime
- updatedAt: DateTime
- propertyId: string
- roomTypeId: string
- userId: string

## Các chức năng chính

### Quản lý chỗ nghỉ (Properties)
- Xem danh sách chỗ nghỉ
- Thêm/sửa/xóa chỗ nghỉ
- Xem chi tiết chỗ nghỉ
- Xem các loại phòng của chỗ nghỉ
- Xem các đặt phòng của chỗ nghỉ

### Quản lý loại phòng (Room Types)
- Xem danh sách loại phòng theo chỗ nghỉ
- Thêm/sửa/xóa loại phòng
- Xem chi tiết loại phòng
- Xem các đặt phòng của loại phòng

### Quản lý đặt phòng (Bookings)
- Xem danh sách đặt phòng (tất cả hoặc theo chỗ nghỉ/loại phòng)
- Thêm/sửa/xóa đặt phòng
- Xem chi tiết đặt phòng
- Lọc đặt phòng theo nhiều tiêu chí (chỗ nghỉ, loại phòng, trạng thái, ngày)
- Cập nhật trạng thái đặt phòng

### Các chức năng khác (đang phát triển)
- Dashboard: Tổng quan về hoạt động kinh doanh
- Calendar: Lịch đặt phòng
- Payments: Quản lý thanh toán
- Reports: Báo cáo và thống kê
- Inbox: Hệ thống tin nhắn nội bộ
- Settings: Cài đặt hệ thống

## Hướng dẫn triển khai

### Frontend

1. Cài đặt dependencies:
```bash
cd frontend
npm install
```

2. Chạy môi trường development:
```bash
npm run dev
```

3. Build cho production:
```bash
npm run build
```

### Backend

1. Cài đặt dependencies:
```bash
cd pms_backend
npm install
```

2. Cấu hình database trong file `.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/pms_db"
```

3. Chạy migration:
```bash
npx prisma migrate dev
```

4. Chạy môi trường development:
```bash
npm run start:dev
```

5. Build cho production:
```bash
npm run build
```

## Chế độ Demo

Hệ thống có chế độ demo cho phép chạy frontend mà không cần backend. Trong chế độ này:

1. Dữ liệu được lấy từ mock data trong thư mục `src/mock/`
2. Các API call được mô phỏng với độ trễ giả lập
3. Các thao tác CRUD được thực hiện trên bộ nhớ tạm

Chế độ demo được kích hoạt tự động khi:
- Hostname chứa `manus.space`
- Hostname là `localhost`

## Tính năng đang phát triển

1. **Liên kết dữ liệu giữa Properties, Room Types và Bookings**:
   - Từ Properties có thể xem và điều hướng đến Room Types của property đó
   - Từ Properties có thể xem và điều hướng đến Bookings của property đó
   - Từ Room Types có thể xem các Bookings liên quan đến room type đó

2. **Đồng bộ các bộ lọc**:
   - Khi chọn một property, các bộ lọc room type sẽ chỉ hiển thị room types của property đó
   - Khi chọn một room type, các bookings sẽ được lọc theo room type đó

3. **Popup modal cho các tác vụ phổ biến**:
   - Popup xác nhận khi xóa dữ liệu
   - Popup xem nhanh thông tin chi tiết
   - Popup form tạo/chỉnh sửa thay vì chuyển trang

## Các vấn đề đang gặp phải

1. Lỗi TypeScript trong việc tích hợp các modal component
2. Cần cập nhật BookingFilters để hỗ trợ lọc theo roomTypeId
3. Cần đồng bộ các bộ lọc giữa các trang
4. Cần hoàn thiện việc liên kết dữ liệu giữa Properties, Room Types và Bookings

## Hướng giải quyết

1. Tái cấu trúc các context providers để quản lý dữ liệu xuyên suốt ứng dụng
2. Thiết kế lại các component modal với khả năng tái sử dụng cao
3. Triển khai liên kết dữ liệu hai chiều giữa Properties, Room Types và Bookings
4. Đồng bộ các bộ lọc giữa các trang để tạo trải nghiệm người dùng mượt mà
