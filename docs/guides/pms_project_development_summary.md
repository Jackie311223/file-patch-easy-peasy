# Tổng quan phát triển dự án PMS (Property Management System)

## 1. Giới thiệu dự án

Dự án PMS (Property Management System) là một hệ thống quản lý chỗ nghỉ toàn diện được phát triển cho Roomrise Solutions. Hệ thống này được thiết kế để giúp các chủ sở hữu và quản lý chỗ nghỉ quản lý hiệu quả các hoạt động hàng ngày, bao gồm quản lý chỗ nghỉ, loại phòng, đặt phòng, thanh toán và báo cáo.

### Mục tiêu dự án
- Xây dựng một hệ thống quản lý chỗ nghỉ hiện đại, dễ sử dụng và linh hoạt
- Tự động hóa các quy trình quản lý đặt phòng và thanh toán
- Cung cấp giao diện người dùng trực quan và responsive
- Hỗ trợ quản lý nhiều chỗ nghỉ từ một nền tảng duy nhất
- Tích hợp với các kênh đặt phòng trực tuyến (OTA)

## 2. Kiến trúc hệ thống

### Kiến trúc tổng thể
Dự án PMS được xây dựng theo kiến trúc client-server hiện đại, với frontend và backend tách biệt:

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │ <──> │    API      │ <──> │  Database   │
│   (React)   │      │  (NestJS)   │      │ (PostgreSQL)│
└─────────────┘      └─────────────┘      └─────────────┘
```

### Frontend
- **Framework**: React với TypeScript
- **State Management**: React Context API
- **Routing**: React Router
- **Form Handling**: React Hook Form với Zod validation
- **UI Components**: Tailwind CSS và shadcn/ui
- **HTTP Client**: Axios

### Backend
- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful API
- **Testing**: Jest

## 3. Quá trình phát triển

### Giai đoạn 1: Thiết kế và triển khai Sidebar
- Triển khai sidebar bên trái theo đặc tả UI/UX
- Thiết kế Sidebar component với đầy đủ các mục menu, icon và trạng thái active/hover
- Tích hợp sidebar vào layout chính và cập nhật cấu trúc route
- Thêm trang Dashboard làm trang mặc định
- Triển khai responsive design (thu gọn trên desktop, overlay trên mobile)
- Cải thiện accessibility với aria-label và keyboard navigation

### Giai đoạn 2: Phát triển tính năng Booking
- Thiết kế và triển khai các model dữ liệu cho Booking
- Phát triển backend API cho quản lý booking với NestJS và Prisma
- Tạo các DTO (Data Transfer Objects) cho create-booking và update-booking
- Triển khai BookingService và BookingController với đầy đủ CRUD operations
- Viết unit tests cho BookingService và BookingController

### Giai đoạn 3: Phát triển frontend cho Booking
- Tạo các types TypeScript cho Booking
- Thiết kế và triển khai BookingContext để quản lý state
- Phát triển các component UI: BookingTable, BookingFilters, BookingForm
- Tạo các trang: AllBookingsPage, BookingDetailPage, CreateBookingPage, EditBookingPage
- Tích hợp với API thông qua axios client
- Thêm mock data cho chế độ demo

### Giai đoạn 4: Tích hợp và liên kết dữ liệu
- Tích hợp các trang vào sidebar
- Tạo các trang placeholder cho Calendar, Payments, Reports, Inbox, Settings
- Cải thiện BookingFilters để hỗ trợ lọc theo roomTypeId
- Phát triển các modal component: BookingsModal, ConfirmationModal, FormModal
- Triển khai liên kết dữ liệu giữa Properties, Room Types và Bookings

### Giai đoạn 5: Cải thiện trải nghiệm người dùng
- Thêm các popup modal cho xem chi tiết, xác nhận xóa, và form tạo/chỉnh sửa
- Đồng bộ các bộ lọc giữa Properties, Room Types và Bookings
- Cải thiện UI/UX với các animation và transition
- Tối ưu hóa hiệu suất và responsive design

## 4. Cấu trúc dự án

### Frontend

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   └── axios.ts
│   ├── components/
│   │   ├── Bookings/
│   │   │   ├── BookingFilters.tsx
│   │   │   ├── BookingForm.tsx
│   │   │   └── BookingTable.tsx
│   │   ├── Properties/
│   │   │   ├── PropertyForm.tsx
│   │   │   ├── PropertySearch.tsx
│   │   │   └── PropertyTable.tsx
│   │   ├── RoomTypes/
│   │   │   ├── RoomTypeBookingsLink.tsx
│   │   │   ├── RoomTypeBookingsModal.tsx
│   │   │   └── RoomTypeForm.tsx
│   │   ├── common/
│   │   │   ├── BookingsModal.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── ConfirmationModal.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── FormModal.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── PlaceholderPage.tsx
│   │   ├── Layout.tsx
│   │   └── layout/
│   │       └── Sidebar.tsx
│   ├── contexts/
│   │   ├── BookingsContext.tsx
│   │   ├── PropertiesContext.tsx
│   │   └── RoomTypesContext.tsx
│   ├── hooks/
│   │   ├── useAuth.tsx
│   │   └── useBookings.ts
│   ├── mock/
│   │   └── mockData.ts
│   ├── pages/
│   │   ├── Bookings/
│   │   │   ├── AllBookingsPage.tsx
│   │   │   ├── BookingDetailPage.tsx
│   │   │   ├── BookingsPage.tsx
│   │   │   ├── CreateBookingPage.tsx
│   │   │   └── EditBookingPage.tsx
│   │   ├── Calendar/
│   │   │   └── CalendarPage.tsx
│   │   ├── Dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── Inbox/
│   │   │   └── InboxPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── Payments/
│   │   │   └── PaymentsPage.tsx
│   │   ├── Properties/
│   │   │   ├── PropertiesPage.tsx
│   │   │   └── PropertyDetailPage.tsx
│   │   ├── Reports/
│   │   │   └── ReportsPage.tsx
│   │   ├── RoomTypes/
│   │   │   ├── RoomTypeDetailPage.tsx
│   │   │   └── RoomTypesPage.tsx
│   │   └── Settings/
│   │       └── SettingsPage.tsx
│   ├── types/
│   │   ├── booking.ts
│   │   ├── property.ts
│   │   └── roomType.ts
│   ├── App.routes.tsx
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

### Backend

```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── decorators/
│   │   │   └── roles.decorator.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   ├── booking/
│   │   ├── booking.controller.ts
│   │   ├── booking.module.ts
│   │   ├── booking.service.ts
│   │   ├── dto/
│   │   │   ├── create-booking.dto.ts
│   │   │   └── update-booking.dto.ts
│   │   └── entities/
│   │       └── booking.entity.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   └── public.decorator.ts
│   │   ├── dto/
│   │   │   └── pagination.dto.ts
│   │   ├── enums/
│   │   │   └── role.enum.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── interceptors/
│   │       └── transform.interceptor.ts
│   ├── property/
│   │   ├── dto/
│   │   │   ├── create-property.dto.ts
│   │   │   └── update-property.dto.ts
│   │   ├── entities/
│   │   │   └── property.entity.ts
│   │   ├── property.controller.ts
│   │   ├── property.module.ts
│   │   └── property.service.ts
│   ├── room-type/
│   │   ├── dto/
│   │   │   ├── create-room-type.dto.ts
│   │   │   └── update-room-type.dto.ts
│   │   ├── entities/
│   │   │   └── room-type.entity.ts
│   │   ├── room-type.controller.ts
│   │   ├── room-type.module.ts
│   │   └── room-type.service.ts
│   ├── user/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── user.controller.ts
│   │   ├── user.module.ts
│   │   └── user.service.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── package.json
└── tsconfig.json
```

## 5. Mô hình dữ liệu

### Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  MANAGER
  STAFF
}

enum BookingStatus {
  CONFIRMED
  PENDING
  CANCELLED
  NO_SHOW
}

enum PaymentStatus {
  PAID
  PARTIALLY_PAID
  UNPAID
  REFUNDED
}

enum PaymentMethod {
  CREDIT_CARD
  BANK_TRANSFER
  CASH
  OTA_COLLECT
}

enum BookingChannel {
  DIRECT
  BOOKING_COM
  AIRBNB
  EXPEDIA
  OTHER
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(STAFF)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  properties Property[]
  bookings   Booking[]
}

model Property {
  id          String   @id @default(uuid())
  name        String
  address     String
  city        String
  country     String
  description String?
  status      String   @default("ACTIVE")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String

  user      User       @relation(fields: [userId], references: [id])
  roomTypes RoomType[]
  bookings  Booking[]
}

model RoomType {
  id          String   @id @default(uuid())
  name        String
  description String?
  capacity    Int
  basePrice   Float
  propertyId  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  property Property  @relation(fields: [propertyId], references: [id])
  bookings Booking[]
}

model Booking {
  id                String        @id @default(uuid())
  guestName         String
  contactEmail      String?
  contactPhone      String?
  channel           BookingChannel @default(DIRECT)
  reference         String?
  checkIn           DateTime
  checkOut          DateTime
  nights            Int
  adults            Int
  children          Int           @default(0)
  totalAmount       Float
  commission        Float         @default(0)
  netRevenue        Float
  currency          String        @default("USD")
  paymentMethod     PaymentMethod?
  paymentChannel    String?
  paymentStatus     PaymentStatus @default(UNPAID)
  amountPaid        Float         @default(0)
  outstandingBalance Float        @default(0)
  refundedAmount    Float         @default(0)
  invoiceUrl        String?
  assignedStaff     String?
  specialRequests   String?
  internalNotes     String?
  bookingStatus     BookingStatus @default(PENDING)
  depositAmount     Float?
  depositDate       DateTime?
  depositMethod     PaymentMethod?
  depositStatus     PaymentStatus?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  propertyId        String
  roomTypeId        String
  userId            String

  property Property @relation(fields: [propertyId], references: [id])
  roomType RoomType @relation(fields: [roomTypeId], references: [id])
  user     User     @relation(fields: [userId], references: [id])
}
```

## 6. Tính năng chính

### Quản lý chỗ nghỉ (Properties)
- Thêm, sửa, xóa thông tin chỗ nghỉ
- Xem danh sách tất cả chỗ nghỉ
- Lọc và tìm kiếm chỗ nghỉ theo nhiều tiêu chí
- Xem chi tiết từng chỗ nghỉ

### Quản lý loại phòng (Room Types)
- Thêm, sửa, xóa thông tin loại phòng
- Xem danh sách loại phòng theo chỗ nghỉ
- Thiết lập giá cơ bản và sức chứa
- Liên kết với đặt phòng

### Quản lý đặt phòng (Bookings)
- Tạo, sửa, xóa đặt phòng
- Xem danh sách tất cả đặt phòng
- Lọc đặt phòng theo chỗ nghỉ, loại phòng, trạng thái, ngày
- Quản lý trạng thái đặt phòng và thanh toán
- Xem chi tiết từng đặt phòng

### Dashboard
- Xem tổng quan về doanh thu, tỷ lệ lấp đầy
- Thống kê đặt phòng theo trạng thái
- Biểu đồ doanh thu theo thời gian
- Thông tin về đặt phòng sắp tới

### Phân quyền và bảo mật
- Hệ thống phân quyền dựa trên vai trò (RBAC)
- Xác thực JWT
- Kiểm soát truy cập dựa trên dữ liệu
- Bảo mật API

## 7. Các thách thức và giải pháp

### Thách thức 1: Liên kết dữ liệu giữa các trang
**Vấn đề**: Cần đảm bảo dữ liệu được liên kết chặt chẽ giữa Properties, Room Types và Bookings.

**Giải pháp**: 
- Sử dụng React Context API để quản lý state xuyên suốt ứng dụng
- Tạo các hooks tùy chỉnh để truy cập dữ liệu từ context
- Triển khai các bộ lọc đồng bộ giữa các trang

### Thách thức 2: Trải nghiệm người dùng mượt mà
**Vấn đề**: Cần cung cấp trải nghiệm người dùng mượt mà và responsive.

**Giải pháp**:
- Sử dụng Tailwind CSS và shadcn/ui để xây dựng giao diện nhất quán
- Triển khai các modal popup thay vì chuyển trang cho các tác vụ phổ biến
- Thiết kế responsive cho cả desktop và mobile

### Thách thức 3: Quản lý state phức tạp
**Vấn đề**: Quản lý state phức tạp trong ứng dụng React.

**Giải pháp**:
- Sử dụng React Context API để quản lý state toàn cục
- Tách biệt logic nghiệp vụ và UI
- Sử dụng React Hook Form và Zod để quản lý form và validation

### Thách thức 4: Hiệu suất với dữ liệu lớn
**Vấn đề**: Đảm bảo hiệu suất khi xử lý lượng lớn dữ liệu đặt phòng.

**Giải pháp**:
- Triển khai phân trang cho các danh sách dài
- Sử dụng các bộ lọc phía server để giảm tải dữ liệu
- Tối ưu hóa các truy vấn database với Prisma

## 8. Kế hoạch phát triển tiếp theo

### Giai đoạn ngắn hạn
- Hoàn thiện liên kết dữ liệu giữa Properties, Room Types và Bookings
- Cải thiện các modal popup cho xem chi tiết, xác nhận xóa, và form tạo/chỉnh sửa
- Đồng bộ các bộ lọc giữa các trang
- Tối ưu hóa hiệu suất và responsive design

### Giai đoạn trung hạn
- Phát triển đầy đủ các tính năng Calendar, Payments, Reports
- Tích hợp với các kênh đặt phòng trực tuyến (OTA)
- Thêm tính năng thông báo và nhắc nhở
- Cải thiện báo cáo và thống kê

### Giai đoạn dài hạn
- Phát triển ứng dụng di động
- Tích hợp với các hệ thống thanh toán
- Thêm tính năng quản lý kho và dịch vụ
- Mở rộng hỗ trợ đa ngôn ngữ và đa tiền tệ

## 9. Kết luận

Dự án PMS (Property Management System) đã được phát triển với mục tiêu cung cấp một hệ thống quản lý chỗ nghỉ toàn diện, dễ sử dụng và linh hoạt. Dự án đã đạt được nhiều mốc quan trọng, bao gồm:

- Triển khai thành công sidebar và layout chính
- Phát triển đầy đủ tính năng quản lý đặt phòng
- Tạo các trang và component UI cho Properties, Room Types và Bookings
- Thiết kế hệ thống phân quyền dựa trên vai trò
- Xây dựng API RESTful với NestJS và Prisma

Dự án hiện đang trong giai đoạn hoàn thiện việc liên kết dữ liệu giữa các trang và cải thiện trải nghiệm người dùng. Với kiến trúc hiện đại và công nghệ tiên tiến, PMS có tiềm năng trở thành một giải pháp quản lý chỗ nghỉ mạnh mẽ và linh hoạt cho Roomrise Solutions.
