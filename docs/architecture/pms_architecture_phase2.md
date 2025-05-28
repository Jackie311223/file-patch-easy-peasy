# Kiến trúc tổng thể PMS Roomrise - Giai đoạn 2

## 1. Tổng quan hệ thống

PMS Roomrise là hệ thống quản lý khách sạn toàn diện với kiến trúc 3 lớp:
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: NestJS, Prisma ORM
- **Database**: PostgreSQL

Giai đoạn 2 bổ sung các module quan trọng:
1. **Payments**: Quản lý thanh toán (Hotel Collect/OTA Collect)
2. **Invoice**: Quản lý hóa đơn
3. **Message**: Hệ thống tin nhắn nội bộ
4. **Auth & RBAC**: Phân quyền và bảo mật nâng cao
5. **UI/UX Optimization**: Tối ưu trải nghiệm người dùng

## 2. Kiến trúc module

### 2.1. Module Payments

#### 2.1.1. Frontend
- **PaymentsPage**: Container chính, quản lý state và API calls
- **PaymentTabs**: Tabs Hotel Collect/OTA Collect
- **PaymentFilters**: Bộ lọc (paymentType, method, status, property, ownerId)
- **PaymentTable**: Hiển thị danh sách payment
- **PaymentFormModal**: Form tạo/sửa payment (thay đổi theo paymentType)

#### 2.1.2. Backend
- **PaymentsController**: Xử lý HTTP requests
- **PaymentsService**: Business logic
- **PaymentDTO**: Data Transfer Objects
- **Payment Model**: Prisma schema

#### 2.1.3. API Endpoints
- `GET /payments`: Lấy danh sách payment với filter
- `POST /payments`: Tạo payment mới
- `PATCH /payments/:id`: Cập nhật payment
- `GET /payments/:id`: Chi tiết payment

### 2.2. Module Invoice

#### 2.2.1. Frontend
- **InvoiceListPage**: Danh sách invoice với filter
- **InvoiceDetailPage**: Chi tiết invoice và danh sách payment
- **InvoiceCreateModal**: Chọn payment để tạo invoice

#### 2.2.2. Backend
- **InvoicesController**: Xử lý HTTP requests
- **InvoicesService**: Business logic
- **InvoiceDTO**: Data Transfer Objects
- **Invoice Model**: Prisma schema

#### 2.2.3. API Endpoints
- `GET /invoices`: Lấy danh sách invoice với filter
- `POST /invoices`: Tạo invoice mới từ các payment
- `GET /invoices/:id`: Chi tiết invoice

### 2.3. Module Message

#### 2.3.1. Frontend
- **InboxPage**: Hiển thị danh sách tin nhắn
- **MessageCard**: Hiển thị từng tin nhắn
- **SendMessageModal**: Form gửi tin nhắn mới

#### 2.3.2. Backend
- **MessagesController**: Xử lý HTTP requests
- **MessagesService**: Business logic
- **MessageDTO**: Data Transfer Objects
- **Message Model**: Prisma schema

#### 2.3.3. API Endpoints
- `GET /messages`: Lấy danh sách tin nhắn
- `POST /messages`: Tạo tin nhắn mới
- `PATCH /messages/:id`: Đánh dấu đã đọc

### 2.4. Module Auth & RBAC

#### 2.4.1. Frontend
- **AuthContext**: Quản lý state authentication
- **ProtectedRoute**: HOC bảo vệ route theo role
- **PermissionCheck**: Component kiểm tra quyền

#### 2.4.2. Backend
- **AuthController**: Xử lý HTTP requests
- **AuthService**: Business logic
- **JwtStrategy**: Xác thực JWT
- **RolesGuard**: Kiểm tra role
- **OwnershipGuard**: Kiểm tra quyền sở hữu
- **AuditLogService**: Ghi log hoạt động

#### 2.4.3. API Endpoints
- `POST /auth/login`: Đăng nhập
- `POST /auth/refresh`: Refresh token
- `GET /auth/me`: Thông tin người dùng hiện tại

### 2.5. UI/UX Optimization

#### 2.5.1. Components
- **ThemeProvider**: Context cho dark mode
- **ToastProvider**: Hiển thị thông báo
- **LoadingSpinner**: Hiển thị trạng thái loading
- **Modal**: Component modal tái sử dụng
- **Form**: Components form tái sử dụng
- **EmptyState**: Hiển thị khi không có dữ liệu
- **ErrorState**: Hiển thị khi có lỗi

#### 2.5.2. Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexbox và Grid layout

## 3. Luồng dữ liệu và mối quan hệ

### 3.1. Payments - Invoice
- Invoice chứa nhiều Payment (one-to-many)
- Chỉ Payment có paymentType=OTA_COLLECT và status=PAID mới được thêm vào Invoice
- Tổng tiền Invoice được tính từ tổng các Payment

### 3.2. Auth - Payments/Invoice
- Mỗi Payment/Invoice thuộc về một Tenant
- SUPER_ADMIN: xem/sửa tất cả
- PARTNER: chỉ xem/sửa Payment/Invoice thuộc property của họ
- STAFF: chỉ xem

### 3.3. Messages - Users
- Message có thể là SYSTEM (tự động) hoặc PRIVATE (giữa users)
- Mỗi Message thuộc về một Tenant

## 4. Phân quyền và bảo mật

### 4.1. Role-Based Access Control (RBAC)
- **SUPER_ADMIN**: Toàn quyền trên hệ thống
- **PARTNER**: Quyền trên resource của họ (property, booking, payment, invoice)
- **STAFF**: Chỉ có quyền xem

### 4.2. JWT Authentication
- Access Token: Hạn dùng 15 phút
- Refresh Token: Hạn dùng 30 ngày, lưu trong database
- Token Rotation: Mỗi lần refresh sẽ tạo refresh token mới

### 4.3. Middleware
- **JwtAuthGuard**: Xác thực JWT
- **RolesGuard**: Kiểm tra role
- **OwnershipGuard**: Kiểm tra quyền sở hữu (tenantId, ownerId)

### 4.4. Audit Logging
- Ghi log mọi thao tác CRUD trên các resource quan trọng
- Lưu thông tin: userId, action, resource, resourceId, metadata, createdAt

## 5. Tối ưu hiệu suất

### 5.1. Frontend
- React Query cho data fetching và caching
- Code splitting và lazy loading
- Memoization để tránh re-render không cần thiết

### 5.2. Backend
- Pagination cho các API trả về nhiều dữ liệu
- Indexing database cho các trường thường xuyên query
- Caching cho các dữ liệu ít thay đổi

## 6. Lộ trình phát triển

### 6.1. Phase 1: PaymentsPage
- Phát triển UI components
- Tích hợp API
- Kiểm thử và hoàn thiện

### 6.2. Phase 2: Invoice Module
- Phát triển UI components
- Tích hợp API
- Kiểm thử và hoàn thiện

### 6.3. Phase 3: Message Module
- Phát triển UI components
- Tích hợp API
- Kiểm thử và hoàn thiện

### 6.4. Phase 4: Auth & RBAC
- Nâng cấp hệ thống phân quyền
- Thêm refresh token
- Thêm audit logging

### 6.5. Phase 5: UI/UX Optimization
- Thêm dark mode
- Tối ưu responsive
- Thêm toast notifications
- Cải thiện loading states

## 7. Kết luận

Kiến trúc tổng thể này đảm bảo tính module hóa cao, dễ bảo trì và mở rộng. Mỗi module có thể phát triển độc lập nhưng vẫn đảm bảo tính nhất quán của hệ thống. Việc phát triển theo thứ tự đã định sẽ giúp xây dựng hệ thống một cách có hệ thống và hiệu quả.
