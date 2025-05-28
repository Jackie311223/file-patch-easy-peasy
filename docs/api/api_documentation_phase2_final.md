# PMS Roomrise - Giai đoạn 2: Tài liệu API (Cập nhật cuối)

## Tổng quan

Tài liệu này mô tả các API được phát triển cho Giai đoạn 2 của dự án PMS Roomrise, bao gồm quản lý Thanh toán (Payments), Hóa đơn (Invoices), và các Báo cáo (Reports), cùng với việc bổ sung AuditLog.

**Base URL:** `/api` (Giả định)

**Authentication:** Tất cả các endpoint yêu cầu xác thực (JWT). Thông tin người dùng (`id`, `tenantId`, `role`) được lấy từ token.

**Authorization:** Phân quyền dựa trên `UserRole` (SUPER_ADMIN, ADMIN, PARTNER, MANAGER, STAFF).

## 1. Schema Prisma (Cập nhật chính)

-   **Payment:**
    -   `paymentType`: Chỉ còn `HOTEL_COLLECT`, `OTA_COLLECT`.
    -   `method`: Cập nhật enum `PaymentMethodV2` (loại bỏ CARD, OTHER; thêm BANK_PERSONAL).
    -   `amount`: Kiểu `Float`.
    -   Quan hệ `collectedBy` (User) và `booking`.
-   **Invoice:**
    -   `totalAmount`: Kiểu `Float`.
    -   Quan hệ many-to-many với `Payment`.
    -   `invoiceNumber`: String unique (logic tự sinh).
-   **Property:**
    -   Thêm `ownerId` (bắt buộc), `district`, `city`, `region`.
    -   Cập nhật quan hệ `owner` (User).
-   **AuditLog (Mới):**
    -   Lưu vết các hành động quan trọng (`action`, `resource`, `resourceId`, `metadata`).
    -   Quan hệ với `User` và `Tenant`.
-   **User:**
    -   Thêm quan hệ `ownedProperties` và `auditLogs`.
-   **Tenant:**
    -   Thêm quan hệ `auditLogs`.

(Xem chi tiết trong file `schema.prisma` đính kèm).

## 2. API Thanh toán (`/payments`)

Module quản lý các giao dịch thanh toán liên quan đến booking.

### `POST /payments`

Ghi nhận một thanh toán mới.

-   **Permissions:** `SUPER_ADMIN`, `PARTNER` (chỉ cho property mình sở hữu).
-   **Request Body:** `CreatePaymentDto`
    ```json
    {
      "bookingId": "uuid",
      "paymentType": "HOTEL_COLLECT | OTA_COLLECT",
      "method": "CASH | BANK_TRANSFER | MOMO | NINEPAY | ONEPAY | OTA_TRANSFER | BANK_PERSONAL",
      "amount": 100.50,
      "paymentDate": "2025-06-01T10:00:00Z",
      "status": "PAID | UNPAID | PARTIALLY_PAID", // Optional, default: PAID
      "collectedById": "uuid", // Required if paymentType=HOTEL_COLLECT
      "receivedFrom": "Expedia", // Required if paymentType=OTA_COLLECT
      "note": "Optional note"
    }
    ```
-   **Logic:**
    -   Validate `bookingId` tồn tại và thuộc tenant.
    -   Validate `collectedById` (nếu HOTEL_COLLECT) tồn tại và thuộc tenant.
    -   Validate `method` hợp lệ theo `paymentType`.
    -   Validate `paymentDate >= checkOut` nếu `paymentType=OTA_COLLECT`.
-   **Response:** `201 Created` - Đối tượng `Payment` mới được tạo.

### `GET /payments`

Lấy danh sách thanh toán với bộ lọc.

-   **Permissions:** `SUPER_ADMIN`, `ADMIN`, `PARTNER`, `MANAGER`, `STAFF`.
-   **Query Parameters:**
    -   `paymentType?: PaymentType`
    -   `method?: PaymentMethodV2`
    -   `status?: PaymentStatusV2`
    -   `bookingId?: string` (uuid)
    -   `ownerId?: string` (uuid) - Lọc theo chủ sở hữu property.
-   **Logic Phân quyền Filter:**
    -   `SUPER_ADMIN`: Xem tất cả trong tenant, có thể lọc theo `ownerId` bất kỳ.
    -   `PARTNER`: Chỉ xem payment liên quan đến property mình sở hữu (tự động lọc theo `ownerId=user.id` nếu `ownerId` query param không được cung cấp hoặc bằng `user.id`). Không được lọc theo `ownerId` khác.
    -   `ADMIN`, `MANAGER`, `STAFF`: Xem tất cả trong tenant (trừ khi `SUPER_ADMIN` lọc theo `ownerId`).
-   **Response:** `200 OK` - Mảng các đối tượng `Payment` (bao gồm thông tin `booking.property` và `collectedBy`).

### `GET /payments/:id`

Lấy chi tiết một thanh toán.

-   **Permissions:** `SUPER_ADMIN`, `ADMIN`, `PARTNER`, `MANAGER`, `STAFF`.
-   **Path Parameter:** `id` (uuid) - ID của payment.
-   **Logic Phân quyền:**
    -   `SUPER_ADMIN`: Xem mọi payment trong tenant.
    -   `PARTNER`: Chỉ xem payment liên quan đến property mình sở hữu.
    -   `ADMIN`, `MANAGER`, `STAFF`: Xem mọi payment trong tenant.
-   **Response:** `200 OK` - Đối tượng `Payment` chi tiết.

### `PATCH /payments/:id`

Cập nhật thông tin một thanh toán.

-   **Permissions:** `SUPER_ADMIN`, `PARTNER` (chỉ cho property mình sở hữu).
-   **Path Parameter:** `id` (uuid) - ID của payment.
-   **Request Body:** `UpdatePaymentDto` (Chỉ cho phép cập nhật: `status`, `method`, `paymentDate`, `amount`, `note`).
    ```json
    {
      "status": "PAID",
      "amount": 150.00,
      "note": "Updated note"
    }
    ```
-   **Logic:**
    -   Validate `paymentDate >= checkOut` nếu cập nhật `paymentDate` cho `OTA_COLLECT`.
    -   Không cho phép thay đổi `bookingId`, `paymentType`, `collectedById`, `receivedFrom`.
-   **Response:** `200 OK` - Đối tượng `Payment` đã được cập nhật.

## 3. API Hóa đơn (`/invoices`)

Module quản lý hóa đơn, chủ yếu để gộp các thanh toán OTA.

### `POST /invoices`

Tạo hóa đơn mới từ danh sách các payment OTA.

-   **Permissions:** `SUPER_ADMIN`, `ADMIN`, `PARTNER`, `MANAGER`.
-   **Request Body:** `CreateInvoiceDto`
    ```json
    {
      "paymentIds": ["uuid1", "uuid2"]
    }
    ```
-   **Logic:**
    -   Validate tất cả `paymentIds` tồn tại, thuộc tenant, có `paymentType = OTA_COLLECT`, `status = PAID`.
    -   Nếu user là `PARTNER`, validate user sở hữu property liên quan đến các payment.
    -   Tự động tính `totalAmount`.
    -   Tự động sinh `invoiceNumber` (ví dụ: `INV-TENANTSLUG-YYYYMMDD-XXXX`).
    -   Tạo invoice với `status = DRAFT`.
-   **Response:** `201 Created` - Đối tượng `Invoice` mới (bao gồm danh sách `payments` liên quan).

### `GET /invoices`

Lấy danh sách hóa đơn với bộ lọc.

-   **Permissions:** `SUPER_ADMIN`, `ADMIN`, `PARTNER`, `MANAGER`, `STAFF`.
-   **Query Parameters:**
    -   `status?: InvoiceStatus`
    -   `ota?: string` - Lọc theo `receivedFrom` của payment liên quan.
    -   `startDate?: string` (YYYY-MM-DD)
    -   `endDate?: string` (YYYY-MM-DD)
-   **Logic Phân quyền:**
    -   `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `STAFF`: Xem tất cả invoice trong tenant.
    -   `PARTNER`: Có thể xem tất cả invoice trong tenant (cần xem xét lại nếu muốn giới hạn chỉ invoice liên quan property của partner).
-   **Response:** `200 OK` - Mảng các đối tượng `Invoice` (có thể kèm theo tóm tắt payment).

### `GET /invoices/:id`

Lấy chi tiết một hóa đơn.

-   **Permissions:** `SUPER_ADMIN`, `ADMIN`, `PARTNER`, `MANAGER`, `STAFF`.
-   **Path Parameter:** `id` (uuid) - ID của invoice.
-   **Logic Phân quyền:** Tương tự `GET /invoices`.
-   **Response:** `200 OK` - Đối tượng `Invoice` chi tiết (bao gồm danh sách `payments` đầy đủ và thông tin `booking`, `property` liên quan).

### `PATCH /invoices/:id/status`

Cập nhật trạng thái hóa đơn (ví dụ: từ DRAFT sang SENT).

-   **Permissions:** `SUPER_ADMIN`, `ADMIN`, `PARTNER`, `MANAGER`.
-   **Path Parameter:** `id` (uuid) - ID của invoice.
-   **Request Body:**
    ```json
    {
      "status": "SENT | PAID | VOID"
    }
    ```
-   **Response:** `200 OK` - Đối tượng `Invoice` đã cập nhật trạng thái.

## 4. API Báo cáo (`/reports`)

Cung cấp dữ liệu tổng hợp cho mục đích báo cáo.

-   **Permissions (Chung):** `SUPER_ADMIN`, `ADMIN`, `PARTNER`, `MANAGER`.
-   **Query Parameters (Chung):** `ReportQueryDto`
    -   `range?: daily | weekly | monthly | yearly | custom` (default: `monthly`)
    -   `startDate?: string` (YYYY-MM-DD) - Bắt buộc nếu `range=custom`
    -   `endDate?: string` (YYYY-MM-DD) - Bắt buộc nếu `range=custom`
    -   `ownerId?: string` (uuid)
    -   `propertyId?: string` (uuid)
    -   `district?: string`
    -   `city?: string`
    -   `region?: string`
-   **Logic Phân quyền Filter (Chung):**
    -   `SUPER_ADMIN`: Xem/lọc theo mọi `ownerId`, `propertyId`, khu vực trong tenant.
    -   `PARTNER`: Chỉ xem/lọc dữ liệu liên quan đến property mình sở hữu (tự động lọc theo `ownerId=user.id` nếu `ownerId` query param không được cung cấp hoặc bằng `user.id`).
    -   `ADMIN`, `MANAGER`: Xem/lọc dữ liệu trong toàn tenant (trừ khi `SUPER_ADMIN` lọc theo `ownerId`).

### `GET /reports/revenue`

Báo cáo doanh thu từ các thanh toán đã nhận.

-   **Logic:** Tổng hợp `amount` của các `Payment` có `status = PAID` trong khoảng thời gian và phạm vi (property, owner, khu vực) được lọc.
-   **Response:** `200 OK`
    ```json
    {
      "reportType": "Revenue",
      "filters": { ...query params... },
      "dateRange": { "gte": "...", "lte": "..." },
      "totalRevenue": 12345.67
      // Có thể thêm breakdown chi tiết
    }
    ```

### `GET /reports/occupancy`

Báo cáo tỷ lệ lấp đầy.

-   **Logic:**
    -   Tính tổng số đêm phòng có thể bán (`availableNights`) của các property được lọc trong khoảng thời gian.
    -   Tính tổng số đêm phòng đã được đặt (`bookedNights`) (trạng thái không phải CANCELLED) có thời gian lưu trú giao với khoảng thời gian báo cáo.
    -   Tỷ lệ lấp đầy = (`bookedNights` / `availableNights`) * 100.
    -   *Lưu ý: Tính toán `availableNights` hiện đang đơn giản hóa, cần dữ liệu inventory chính xác hơn để hoàn thiện.*
-   **Response:** `200 OK`
    ```json
    {
      "reportType": "Occupancy",
      "filters": { ...query params... },
      "dateRange": { "gte": "...", "lte": "..." },
      "occupancyRate": 85.50, // Percentage
      "totalBookedNights": 171,
      "totalAvailableRoomNights": 200
      // Có thể thêm breakdown chi tiết
    }
    ```

### `GET /reports/source`

Báo cáo thống kê nguồn booking.

-   **Logic:** Nhóm các `Booking` (không phải CANCELLED) theo `channel` có ngày `checkIn` trong khoảng thời gian và phạm vi được lọc. Tính số lượng booking và tổng doanh thu thuần (`netRevenue`) cho mỗi nguồn.
-   **Response:** `200 OK`
    ```json
    {
      "reportType": "Booking Source",
      "filters": { ...query params... },
      "dateRange": { "gte": "...", "lte": "..." },
      "sources": [
        { "channel": "DIRECT", "bookingCount": 50, "totalNetRevenue": 5000.00 },
        { "channel": "BOOKING_COM", "bookingCount": 30, "totalNetRevenue": 4500.00 },
        { "channel": "EXPEDIA", "bookingCount": 20, "totalNetRevenue": 3000.00 }
      ]
    }
    ```

## 5. Audit Log (Implicit)

Model `AuditLog` được thiết kế để ghi lại các hành động quan trọng. Việc tích hợp logic ghi log vào các service (Payments, Invoices, Bookings, Properties, Users) cần được thực hiện trong quá trình phát triển chi tiết (ví dụ: sử dụng interceptor hoặc gọi trực tiếp trong service methods).

