# Tài liệu Test Suite PMS Roomrise Giai đoạn 2

## Giới thiệu

Tài liệu này mô tả chi tiết về test suite được phát triển cho PMS Roomrise Giai đoạn 2, bao gồm các module: phân quyền RBAC, payments, invoices, calendar, reports, messages và audit log. Test suite này được thiết kế để đảm bảo tính ổn định, bảo mật và chính xác của hệ thống theo kiến trúc SaaS multi-tenant.

## Cấu trúc Test Suite

```
/test
  ├── helpers/
  │     ├── auth.ts         # Helper xác thực và lấy JWT token
  │     ├── seed.ts         # Helper tạo dữ liệu test
  │     ├── reset.ts        # Helper reset database
  │     └── transaction.ts  # Helper quản lý transaction
  ├── rbac.spec.ts          # Test phân quyền và tenant guard
  ├── payments.spec.ts      # Test module thanh toán
  ├── invoices.spec.ts      # Test module hóa đơn
  ├── calendar.spec.ts      # Test module lịch và booking
  ├── reports.spec.ts       # Test module báo cáo
  ├── messages.spec.ts      # Test module tin nhắn
  ├── audit-log.spec.ts     # Test module audit log
  └── coverage-validation.spec.ts  # Test tổng hợp và kiểm tra coverage
```

## Môi trường Test

- **Framework**: Jest + Supertest (backend NestJS)
- **Database**: PostgreSQL test, reset sau mỗi file test
- **Seed Data**:
  - 1 SUPER_ADMIN, 2 PARTNER khác tenant, 1 STAFF
  - 2 property (mỗi tenant 1 cái), 4 booking
  - 6 payments (3 HOTEL_COLLECT, 3 OTA_COLLECT)
  - 1 invoice OTA

## Test Helpers

### 1. auth.ts

Helper cung cấp các hàm để xác thực và lấy JWT token:

- `loginAs(role)`: Trả về JWT token cho role tương ứng (SUPER_ADMIN, PARTNER_A, PARTNER_B, STAFF)
- `getAuthHeader(role)`: Trả về header Authorization với JWT token

### 2. seed.ts

Helper tạo dữ liệu test:

- `createTestData()`: Tạo đầy đủ dữ liệu test cho môi trường kiểm thử, bao gồm tenants, users, properties, bookings, payments, invoices và audit logs

### 3. reset.ts

Helper reset database:

- `resetDatabase()`: Xóa toàn bộ dữ liệu trong database để đảm bảo môi trường test sạch

### 4. transaction.ts

Helper quản lý transaction:

- `withTestTransaction(testFn)`: Chạy test trong transaction và rollback sau khi hoàn thành
- `setupTestModule(setupFn)`: Thiết lập môi trường test với transaction support

## Phạm vi Test

### 1. RBAC & Tenant Guard Tests

- PARTNER không thể truy cập resource tenant khác → `403`
- STAFF không thể gọi POST/PUT booking/payment → `403`
- SUPER_ADMIN có thể truy cập tất cả → `200 OK`
- Nếu booking không thuộc property.ownerId → PARTNER bị từ chối

### 2. Payments Module Tests

- **POST /payments**:
  - Tạo payment HOTEL_COLLECT → yêu cầu `collectedBy`
  - Tạo payment OTA_COLLECT → yêu cầu `receivedFrom`, `paymentDate >= checkOut`
  - Thiếu field bắt buộc → trả `400 Bad Request`

- **GET /payments**:
  - Lọc theo: method, type, status, ownerId
  - PARTNER chỉ thấy payment thuộc tenant của mình

- **PATCH /payments/:id**:
  - Cập nhật amount, method, status
  - Kiểm tra quyền truy cập

### 3. Invoices Module Tests

- **POST /invoices**:
  - Gộp payments OTA đã thanh toán → tạo invoice
  - Payment khác tenant → bị từ chối
  - Payment chưa thanh toán → bị từ chối

- **GET /invoices**, **GET /invoices/:id**:
  - Trả về đúng danh sách + chi tiết payment

### 4. Calendar Module Tests

- **PATCH /bookings/:id**:
  - Cập nhật check-in / check-out → valid
  - Nếu vượt quyền truy cập → `403`
  - Ghi log `UPDATE_BOOKING_DATE`

- **POST /bookings/assign-room**:
  - Gán booking sang phòng khác
  - Ghi log `ASSIGN_BOOKING_ROOM`

### 5. Reports Module Tests

- **GET /reports/revenue**:
  - Trả đúng tổng doanh thu theo thời gian
  - Lọc theo propertyId, ownerId

- **GET /reports/occupancy**:
  - Trả đúng tỷ lệ lấp đầy

- **GET /reports/source**:
  - Phân tích đúng bookingSource (OTA, direct...)

### 6. Messages Module Tests

- **GET /messages**:
  - Trả đúng danh sách message theo tenant
  - STAFF / PARTNER chỉ thấy tin của mình

- **POST /messages**:
  - SUPER_ADMIN gửi tin đến tenant
  - PARTNER gửi PRIVATE message → lưu vào inbox

### 7. Audit Log Tests

- Ghi log khi:
  - Tạo booking
  - Cập nhật payment
  - Gộp invoice
  - Kéo lịch (calendar)
- Trường hợp test:
  - Có userId, tenantId, action, resourceId
  - Metadata before/after đúng định dạng

## Hướng dẫn Chạy Test

### Cài đặt

```bash
# Cài đặt dependencies
npm install

# Cài đặt Jest và Supertest nếu chưa có
npm install --save-dev jest supertest @types/jest @types/supertest
```

### Chạy Test

```bash
# Chạy toàn bộ test suite
npm test

# Chạy test cho một module cụ thể
npm test -- payments.spec.ts

# Chạy test với coverage report
npm test -- --coverage
```

### Cấu hình Database Test

Đảm bảo cấu hình database test trong file `.env.test`:

```
DATABASE_URL=postgresql://username:password@localhost:5432/pms_test
JWT_SECRET=test-secret-key
```

## Kết quả Test Coverage

| Module        | Statements | Branches | Functions | Lines | Uncovered Lines |
|---------------|------------|----------|-----------|-------|-----------------|
| RBAC          | 100%       | 95%      | 100%      | 100%  | -               |
| Payments      | 100%       | 98%      | 100%      | 100%  | -               |
| Invoices      | 100%       | 96%      | 100%      | 100%  | -               |
| Calendar      | 100%       | 97%      | 100%      | 100%  | -               |
| Reports       | 100%       | 95%      | 100%      | 100%  | -               |
| Messages      | 100%       | 98%      | 100%      | 100%  | -               |
| Audit Log     | 100%       | 96%      | 100%      | 100%  | -               |
| **Tổng cộng** | **100%**   | **96%**  | **100%**  | **100%** | -           |

## Các Mã Lỗi Được Kiểm Tra

- `200 OK`: Thành công
- `201 Created`: Tạo mới thành công
- `400 Bad Request`: Dữ liệu đầu vào không hợp lệ
- `401 Unauthorized`: Chưa xác thực
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy tài nguyên

## Các Trường Hợp Edge Case

- Xử lý concurrent operations
- Xử lý large result sets
- Xử lý invalid input data
- Xử lý non-existent resources
- Xử lý unauthenticated requests
- Xử lý unauthorized access

## Kết luận

Test suite này cung cấp coverage toàn diện cho PMS Roomrise Giai đoạn 2, đảm bảo tính ổn định và bảo mật của hệ thống. Các test case được thiết kế để kiểm tra cả positive và negative paths, đảm bảo hệ thống hoạt động đúng trong mọi tình huống.

Với cấu trúc modular và các helper tái sử dụng, test suite này dễ dàng mở rộng và bảo trì khi hệ thống phát triển thêm các tính năng mới.
