# PaymentsPage - Tài liệu triển khai

## Tổng quan

Module PaymentsPage đã được phát triển theo yêu cầu, cung cấp giao diện quản lý thanh toán chuyên nghiệp với các tính năng:

- Tabs phân chia Hotel Collect và OTA Collect
- Bộ lọc đa dạng (phương thức, trạng thái, property, chủ sở hữu, ngày)
- Bảng hiển thị thông tin thanh toán với các hành động phù hợp
- Form tạo/chỉnh sửa thanh toán thay đổi theo loại thanh toán
- Phân quyền RBAC (SUPER_ADMIN, PARTNER, STAFF)
- Responsive design cho desktop và tablet
- Xử lý các trạng thái loading, empty, error

## Cấu trúc Component

Module PaymentsPage được tổ chức theo cấu trúc sau:

```
/pages/Payments/
  ├── PaymentsPage.tsx              # Component chính
  ├── components/
  │   ├── PaymentFilters.tsx        # Bộ lọc thanh toán
  │   ├── PaymentTable.tsx          # Bảng hiển thị thanh toán
  │   └── PaymentFormModal.tsx      # Form tạo/chỉnh sửa thanh toán
  └── __tests__/
      └── PaymentsPage.test.tsx     # Test cases
```

## Tính năng chính

### 1. Tabs Hotel Collect / OTA Collect

- Chuyển đổi giữa hai loại thanh toán chính
- Tự động cập nhật bộ lọc và form theo loại thanh toán

### 2. Bộ lọc

- Lọc theo phương thức thanh toán (thay đổi theo loại thanh toán)
- Lọc theo trạng thái (PAID, UNPAID, PARTIALLY_PAID)
- Lọc theo property
- Lọc theo chủ sở hữu (chỉ SUPER_ADMIN)
- Lọc theo khoảng thời gian

### 3. Bảng thanh toán

- Hiển thị mã booking, phương thức, số tiền, trạng thái, ngày, người thu/nguồn
- Badges màu sắc cho phương thức và trạng thái
- Menu hành động (xem, sửa, đánh dấu đã thanh toán, xóa) tùy theo quyền

### 4. Form thanh toán

- Thay đổi trường và validation theo loại thanh toán:
  - Hotel Collect: yêu cầu collectedBy, hỗ trợ các phương thức CASH, BANK_TRANSFER, MOMO, 9PAY, ONEPAY
  - OTA Collect: yêu cầu receivedFrom, hỗ trợ các phương thức OTA_TRANSFER, BANK_PERSONAL, 9PAY, ONEPAY
  - Kiểm tra ngày thanh toán OTA phải >= ngày checkout
- Validation đầy đủ với react-hook-form và zod
- Hỗ trợ cả tạo mới và chỉnh sửa

### 5. Phân quyền RBAC

- SUPER_ADMIN: toàn quyền (tạo, sửa, xóa)
- PARTNER: chỉ thao tác với booking/property của mình (tạo, sửa)
- STAFF: chỉ xem (không tạo, sửa, xóa)

### 6. Responsive Design

- Layout thích ứng với desktop và tablet
- Xử lý overflow cho bảng trên màn hình nhỏ
- Buttons và tabs tự điều chỉnh kích thước

### 7. Xử lý trạng thái

- Loading state với spinner
- Empty state với thông báo và action
- Error state với khả năng retry
- Toast notifications cho các hành động

## Tích hợp API

Module sử dụng các API sau:

- `GET /payments`: lấy danh sách thanh toán với bộ lọc
- `POST /payments`: tạo thanh toán mới
- `PATCH /payments/:id`: cập nhật thanh toán
- `DELETE /payments/:id`: xóa thanh toán

## Hướng dẫn sử dụng

1. **Xem danh sách thanh toán**:
   - Chọn tab Hotel Collect hoặc OTA Collect
   - Sử dụng bộ lọc để tìm kiếm cụ thể

2. **Tạo thanh toán mới**:
   - Nhấn nút "New Payment"
   - Chọn booking, nhập thông tin thanh toán
   - Form sẽ thay đổi theo loại thanh toán đang chọn

3. **Chỉnh sửa thanh toán**:
   - Nhấn vào menu hành động của thanh toán
   - Chọn "Edit payment"
   - Cập nhật thông tin và lưu

4. **Đánh dấu trạng thái**:
   - Sử dụng menu hành động để đánh dấu đã thanh toán/chưa thanh toán

## Kiểm thử

Các test case đã được chuẩn bị để kiểm tra:
- Render chính xác các component
- Chuyển đổi tabs
- Mở/đóng bộ lọc và modal
- Xử lý các trạng thái loading/error/empty
- Phân quyền RBAC
- Validation business rules
- Responsive design

## Kết luận

Module PaymentsPage đã được phát triển đầy đủ theo yêu cầu, với giao diện chuyên nghiệp, logic nghiệp vụ chính xác và trải nghiệm người dùng tối ưu. Module này sẵn sàng để tích hợp vào hệ thống PMS Roomrise.
