# PMS Roomrise - Giai đoạn 2: Tài liệu API

Đây là tài liệu mô tả các API được phát triển trong Giai đoạn 2 của dự án PMS Roomrise, bao gồm quản lý Thanh toán (Payments), Hóa đơn (Invoices), và các Báo cáo (Reports).

**Lưu ý chung:**

*   Tất cả các API đều yêu cầu xác thực (ví dụ: JWT Bearer Token).
*   Hầu hết các API đều yêu cầu người dùng phải thuộc về một `tenantId` cụ thể và có vai trò (role) phù hợp (SUPER_ADMIN, ADMIN, MANAGER).
*   `tenantId` thường được lấy tự động từ thông tin xác thực của người dùng, không cần truyền trong request body hoặc query.
*   Sử dụng `ValidationPipe` để kiểm tra dữ liệu đầu vào (DTOs).
*   Các ID (như paymentId, invoiceId, bookingId, userId) đều là UUID.

## 1. API Thanh toán (`/payments`)

Quản lý các giao dịch thanh toán liên quan đến đặt phòng.

### 1.1. `POST /payments` - Tạo thanh toán mới

*   **Mô tả:** Ghi nhận một thanh toán mới cho một đặt phòng.
*   **Phân quyền:** SUPER_ADMIN, ADMIN, MANAGER (STAFF có thể ghi nhận HOTEL_COLLECT nếu `collectedById` là chính họ).
*   **Request Body:** `CreatePaymentDto`
    ```json
    {
      "amount": 150.50,
      "paymentDate": "2025-06-15T10:00:00.000Z",
      "paymentType": "HOTEL_COLLECT", // HOTEL_COLLECT | OTA_COLLECT | UPC
      "method": "CASH", // CASH | BANK_TRANSFER | CARD | OTA_TRANSFER | NINEPAY | ONEPAY | MOMO | OTHER
      "status": "PAID", // Optional, default: PAID. Values: PAID | UNPAID | PARTIALLY_PAID
      "receivedFrom": "Expedia", // Required for OTA_COLLECT, recommended for UPC
      "note": "Thanh toán tiền phòng.", // Optional
      "bookingId": "uuid-cua-booking",
      "collectedById": "uuid-cua-user-thu-tien" // Required for HOTEL_COLLECT
    }
    ```
*   **Logic nghiệp vụ:**
    *   Kiểm tra `tenantId` của người dùng.
    *   Kiểm tra `bookingId` tồn tại và thuộc `tenantId`.
    *   Kiểm tra quyền hạn.
    *   Validate `method` dựa trên `paymentType`:
        *   `HOTEL_COLLECT`: Chỉ chấp nhận CASH, BANK_TRANSFER, CARD. Yêu cầu `collectedById`.
        *   `OTA_COLLECT`: Chỉ chấp nhận OTA_TRANSFER. Yêu cầu `receivedFrom` (tên OTA). `paymentDate` phải >= `booking.checkOut`.
        *   `UPC`: Chỉ chấp nhận NINEPAY, ONEPAY, MOMO. Khuyến khích có `receivedFrom`.
*   **Response:** Đối tượng `Payment` vừa tạo.

### 1.2. `GET /payments` - Lấy danh sách thanh toán

*   **Mô tả:** Lấy danh sách các thanh toán, hỗ trợ lọc.
*   **Phân quyền:** SUPER_ADMIN, ADMIN, MANAGER, STAFF (chỉ thấy của tenant mình).
*   **Query Parameters:**
    *   `paymentType` (optional): Lọc theo loại thanh toán (HOTEL_COLLECT, OTA_COLLECT, UPC).
    *   `method` (optional): Lọc theo phương thức thanh toán.
    *   `bookingId` (optional, uuid): Lọc theo ID đặt phòng.
    *   `status` (optional): Lọc theo trạng thái (PAID, UNPAID, PARTIALLY_PAID).
*   **Response:** Mảng các đối tượng `Payment`.

### 1.3. `GET /payments/:id` - Lấy chi tiết thanh toán

*   **Mô tả:** Lấy thông tin chi tiết của một thanh toán cụ thể.
*   **Phân quyền:** SUPER_ADMIN, ADMIN, MANAGER, STAFF (chỉ thấy của tenant mình).
*   **Path Parameter:** `id` (uuid) - ID của thanh toán.
*   **Response:** Đối tượng `Payment`.

### 1.4. `PATCH /payments/:id` - Cập nhật thanh toán

*   **Mô tả:** Cập nhật thông tin của một thanh toán (chủ yếu là `status`, `amount`, `note`).
*   **Phân quyền:** SUPER_ADMIN, ADMIN, MANAGER.
*   **Path Parameter:** `id` (uuid) - ID của thanh toán.
*   **Request Body:** `UpdatePaymentDto` (chỉ chứa các trường được phép cập nhật)
    ```json
    {
      "status": "PAID", // Optional
      "amount": 160.00, // Optional
      "note": "Cập nhật ghi chú." // Optional
    }
    ```
*   **Response:** Đối tượng `Payment` đã cập nhật.

### 1.5. `DELETE /payments/:id` - Xóa thanh toán

*   **Mô tả:** Xóa một thanh toán.
*   **Phân quyền:** SUPER_ADMIN, ADMIN.
*   **Path Parameter:** `id` (uuid) - ID của thanh toán.
*   **Logic nghiệp vụ:**
    *   Kiểm tra thanh toán có liên kết với hóa đơn nào không. Nếu có, không cho xóa.
*   **Response:** Đối tượng `Payment` đã xóa.

---

## 2. API Hóa đơn (`/invoices`)

Quản lý hóa đơn, chủ yếu dùng để gộp các thanh toán từ OTA.

### 2.1. `POST /invoices` - Tạo hóa đơn mới

*   **Mô tả:** Tạo một hóa đơn mới bằng cách gộp nhiều thanh toán OTA đã PAID.
*   **Phân quyền:** SUPER_ADMIN, ADMIN, MANAGER.
*   **Request Body:** `CreateInvoiceDto`
    ```json
    {
      "paymentIds": [
        "uuid-payment-1",
        "uuid-payment-2"
      ]
    }
    ```
*   **Logic nghiệp vụ:**
    *   Kiểm tra `tenantId` của người dùng.
    *   Kiểm tra quyền hạn.
    *   Kiểm tra các `paymentIds` tồn tại, thuộc `tenantId`, có `paymentType = OTA_COLLECT`, `status = PAID`, và chưa được gán vào hóa đơn nào khác.
    *   Tự động tính `totalAmount` từ các payment được gộp.
    *   Tự động sinh `invoiceNumber` (ví dụ: `INV-TENANTID-TIMESTAMP`).
    *   Tạo hóa đơn với trạng thái mặc định là `DRAFT`.
*   **Response:** Đối tượng `Invoice` vừa tạo.

### 2.2. `GET /invoices` - Lấy danh sách hóa đơn

*   **Mô tả:** Lấy danh sách các hóa đơn, hỗ trợ lọc.
*   **Phân quyền:** SUPER_ADMIN, ADMIN, MANAGER, STAFF (chỉ thấy của tenant mình).
*   **Query Parameters:**
    *   `status` (optional): Lọc theo trạng thái hóa đơn (DRAFT, SENT, PAID, VOID).
    *   `startDate` (optional, yyyy-MM-dd): Lọc theo ngày tạo từ.
    *   `endDate` (optional, yyyy-MM-dd): Lọc theo ngày tạo đến.
    *   `ota` (optional, string): Lọc hóa đơn chứa thanh toán từ một OTA cụ thể (tìm kiếm trong `payment.receivedFrom`).
*   **Response:** Mảng các đối tượng `Invoice` (có thể kèm thông tin cơ bản của payments liên quan).

### 2.3. `GET /invoices/:id` - Lấy chi tiết hóa đơn

*   **Mô tả:** Lấy thông tin chi tiết của một hóa đơn cụ thể, bao gồm các payment liên quan.
*   **Phân quyền:** SUPER_ADMIN, ADMIN, MANAGER, STAFF (chỉ thấy của tenant mình).
*   **Path Parameter:** `id` (uuid) - ID của hóa đơn.
*   **Response:** Đối tượng `Invoice` (bao gồm danh sách chi tiết các `Payment` liên quan).

### 2.4. `PATCH /invoices/:id` - Cập nhật hóa đơn

*   **Mô tả:** Cập nhật trạng thái của một hóa đơn (ví dụ: từ DRAFT sang SENT, hoặc sang VOID).
*   **Phân quyền:** SUPER_ADMIN, ADMIN, MANAGER.
*   **Path Parameter:** `id` (uuid) - ID của hóa đơn.
*   **Request Body:** `UpdateInvoiceDto`
    ```json
    {
      "status": "SENT" // Chỉ cho phép cập nhật status. Values: DRAFT | SENT | PAID | VOID
    }
    ```
*   **Logic nghiệp vụ:**
    *   Có thể có các ràng buộc về chuyển đổi trạng thái (ví dụ: không thể đổi trạng thái của hóa đơn VOID).
*   **Response:** Đối tượng `Invoice` đã cập nhật.

### 2.5. `DELETE /invoices/:id` - Xóa hóa đơn

*   **Mô tả:** Xóa một hóa đơn.
*   **Phân quyền:** SUPER_ADMIN, ADMIN.
*   **Path Parameter:** `id` (uuid) - ID của hóa đơn.
*   **Logic nghiệp vụ:**
    *   Chỉ cho phép xóa hóa đơn ở trạng thái `DRAFT`.
    *   Việc xóa hóa đơn không tự động hủy liên kết các payment (cần xem xét logic nghiệp vụ nếu muốn payment có thể được gán lại).
*   **Response:** Đối tượng `Invoice` đã xóa.

---

## 3. API Báo cáo (`/reports`)

Cung cấp dữ liệu tổng hợp cho các báo cáo nghiệp vụ.

### 3.1. `GET /reports/revenue` - Báo cáo doanh thu

*   **Mô tả:** Lấy dữ liệu báo cáo doanh thu dựa trên các thanh toán đã PAID.
*   **Phân quyền:** SUPER_ADMIN, ADMIN, MANAGER (có thể lọc theo ownerId nếu có quyền).
*   **Query Parameters:** `RevenueReportQueryDto`
    *   `range` (optional, enum): Khoảng thời gian (monthly, weekly, yearly). Default: monthly.
    *   `startDate` (optional, yyyy-MM-dd): Ngày bắt đầu tùy chỉnh (ghi đè `range`).
    *   `endDate` (optional, yyyy-MM-dd): Ngày kết thúc tùy chỉnh (ghi đè `range`).
    *   `ownerId` (optional, uuid): Lọc theo ID chủ sở hữu property.
    *   `district` (optional, string): Lọc theo quận/huyện.
    *   `city` (optional, string): Lọc theo thành phố.
    *   `region` (optional, string): Lọc theo vùng/miền.
*   **Response:**
    ```json
    {
      "summary": {
        "totalRevenue": 15050.75,
        "startDate": "2025-05-01",
        "endDate": "2025-05-31",
        "filters": { ...query parameters used... }
      },
      "chartData": [
        { "date": "2025-05-01", "revenue": 500 },
        { "date": "2025-05-02", "revenue": 750.50 },
        // ... data for each day/week/month in range ...
      ]
    }
    ```

### 3.2. `GET /reports/occupancy` - Báo cáo công suất phòng

*   **Mô tả:** Lấy dữ liệu báo cáo công suất phòng dựa trên các booking đã xác nhận/ở/trả phòng.
*   **Phân quyền:** SUPER_ADMIN, ADMIN, MANAGER.
*   **Query Parameters:** `OccupancyReportQueryDto`
    *   `propertyId` (optional, uuid): Lọc theo ID property cụ thể.
    *   `ownerId` (optional, uuid): Lọc theo ID chủ sở hữu property.
    *   `startDate` (optional, yyyy-MM-dd): Ngày bắt đầu (mặc định: đầu tháng hiện tại).
    *   `endDate` (optional, yyyy-MM-dd): Ngày kết thúc (mặc định: cuối tháng hiện tại).
*   **Response:**
    ```json
    {
      "summary": {
        "totalProperties": 5,
        "totalRooms": 120,
        "startDate": "2025-05-01",
        "endDate": "2025-05-31",
        "totalAvailableRoomNights": 3720, // totalRooms * daysInRange
        "occupiedRoomNights": 2850,
        "occupancyRate": 76.61, // percentage
        "filters": { ...query parameters used... }
      }
      // "chartData": [ ... daily occupancy data ... ] // Optional daily breakdown
    }
    ```

### 3.3. `GET /reports/source` - Báo cáo nguồn đặt phòng

*   **Mô tả:** Lấy dữ liệu báo cáo doanh thu theo nguồn đặt phòng (channel).
*   **Phân quyền:** SUPER_ADMIN, ADMIN, MANAGER.
*   **Query Parameters:** `SourceReportQueryDto`
    *   `range` (optional, enum): Khoảng thời gian (monthly, weekly, yearly). Default: monthly.
    *   `startDate` (optional, yyyy-MM-dd): Ngày bắt đầu tùy chỉnh.
    *   `endDate` (optional, yyyy-MM-dd): Ngày kết thúc tùy chỉnh.
    *   `ownerId` (optional, uuid): Lọc theo ID chủ sở hữu property.
    *   `region` (optional, string): Lọc theo vùng/miền.
*   **Response:**
    ```json
    {
      "summary": {
        "totalRevenue": 15050.75,
        "startDate": "2025-05-01",
        "endDate": "2025-05-31",
        "filters": { ...query parameters used... }
      },
      "chartData": [
        { "source": "DIRECT", "revenue": 8000, "percentage": 53.16 },
        { "source": "BOOKING_COM", "revenue": 4500.25, "percentage": 29.90 },
        { "source": "EXPEDIA", "revenue": 2550.50, "percentage": 16.94 },
        // ... data for each channel ...
      ]
    }
    ```

