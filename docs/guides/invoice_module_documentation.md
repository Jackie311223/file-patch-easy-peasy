# Invoice Module - Tài liệu triển khai

## Tổng quan

Module Invoice đã được phát triển để quản lý hóa đơn, đặc biệt là việc gộp các thanh toán từ OTA (Online Travel Agencies).

- **InvoiceListPage**: Hiển thị danh sách hóa đơn với bộ lọc (OTA, trạng thái, ngày).
- **InvoiceDetailPage**: Hiển thị chi tiết một hóa đơn, bao gồm danh sách các thanh toán được gộp.
- **InvoiceCreateModal**: Cho phép người dùng chọn các thanh toán OTA đã thanh toán (PAID) để tạo thành một hóa đơn mới.

## Cấu trúc Component

```
/pages/Invoices/
  ├── InvoiceListPage.tsx           # Trang danh sách hóa đơn
  ├── InvoiceDetailPage.tsx         # Trang chi tiết hóa đơn
  ├── components/
  │   └── InvoiceCreateModal.tsx    # Modal tạo hóa đơn
  └── __tests__/
      └── InvoiceModule.test.tsx    # Test cases cho module
```

## Tính năng chính

### 1. InvoiceListPage

- Hiển thị danh sách hóa đơn với các cột: Số hóa đơn, Ngày tạo, Trạng thái, Tổng tiền.
- Bộ lọc theo:
  - OTA/Nguồn (dựa trên trường `receivedFrom` của payment)
  - Trạng thái hóa đơn (DRAFT, SENT, PAID, VOID)
  - Khoảng ngày tạo hóa đơn.
- Nút "Create Invoice" để mở modal tạo hóa đơn (hiển thị dựa trên quyền: SUPER_ADMIN, ADMIN, PARTNER, MANAGER).
- Nút "View" để điều hướng đến trang chi tiết hóa đơn.
- Xử lý trạng thái loading, error, empty.

### 2. InvoiceDetailPage

- Hiển thị thông tin tóm tắt của hóa đơn: Số hóa đơn, Ngày tạo, Trạng thái, Tổng tiền.
- Hiển thị danh sách chi tiết các thanh toán (Payments) được gộp trong hóa đơn đó.
- Các nút hành động để cập nhật trạng thái hóa đơn (Mark as Sent, Mark as Paid, Void Invoice) dựa trên trạng thái hiện tại và quyền người dùng (SUPER_ADMIN, ADMIN, PARTNER, MANAGER).
- Nút "Back to Invoices" để quay lại trang danh sách.
- Xử lý trạng thái loading, error.

### 3. InvoiceCreateModal

- Hiển thị danh sách các thanh toán loại `OTA_COLLECT` có trạng thái `PAID` và chưa được gộp vào hóa đơn nào khác (lưu ý: việc lọc payment chưa được gộp cần hỗ trợ từ backend API).
- Cho phép chọn nhiều thanh toán bằng checkbox.
- Hiển thị tổng số thanh toán đã chọn và tổng số tiền tương ứng.
- Nút "Create Invoice" để gửi yêu cầu tạo hóa đơn mới với các payment đã chọn (`POST /invoices`).
- Xử lý trạng thái loading, error khi lấy danh sách payment và khi tạo hóa đơn.

## Tích hợp API

Module sử dụng các API sau:

- `GET /invoices`: Lấy danh sách hóa đơn với bộ lọc.
- `GET /invoices/:id`: Lấy chi tiết hóa đơn.
- `POST /invoices`: Tạo hóa đơn mới từ danh sách payment IDs.
- `PATCH /invoices/:id/status`: Cập nhật trạng thái hóa đơn.
- `GET /payments`: Lấy danh sách các payment đủ điều kiện để tạo hóa đơn (trong InvoiceCreateModal).

## Phân quyền

- **Xem danh sách/chi tiết**: SUPER_ADMIN, ADMIN, PARTNER, MANAGER, STAFF.
- **Tạo hóa đơn**: SUPER_ADMIN, ADMIN, PARTNER, MANAGER.
- **Cập nhật trạng thái**: SUPER_ADMIN, ADMIN, PARTNER, MANAGER.

## Kiểm thử

Các test case đã được chuẩn bị trong `InvoiceModule.test.tsx` để kiểm tra:

- Render các trang và component.
- Fetch dữ liệu từ API.
- Hoạt động của bộ lọc.
- Mở và hoạt động của modal tạo hóa đơn.
- Chọn và tính tổng tiền payment trong modal.
- Gửi yêu cầu tạo hóa đơn.
- Hiển thị chi tiết hóa đơn và payment liên quan.
- Cập nhật trạng thái hóa đơn.
- Xử lý các trạng thái loading/error/empty.

## Kết luận

Module Invoice cung cấp các chức năng cần thiết để quản lý hóa đơn OTA, từ việc tạo hóa đơn bằng cách gộp các thanh toán đến việc xem chi tiết và cập nhật trạng thái. Module này sẵn sàng để tích hợp vào hệ thống PMS Roomrise.
