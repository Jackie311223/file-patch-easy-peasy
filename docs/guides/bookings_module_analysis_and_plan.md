# Phân tích Vấn đề và Kế hoạch Cải tiến Bookings Module

## 1. Tóm tắt

Sau khi rà soát mã nguồn của Bookings Module (`bookings.service.ts`, `bookings.controller.ts`) và kiểm tra các file test liên quan, đã xác định được các vấn đề chính cần giải quyết để khắc phục lỗi test và nâng cao chất lượng module.

## 2. Các Vấn đề Chính

### 2.1. Lỗi Logic và Không Khớp Schema

*   **Vấn đề:** Mã nguồn trong `bookings.service.ts` sử dụng sai tên trường so với định nghĩa trong `prisma/schema.prisma`:
    *   Sử dụng `ownerId` thay vì `tenantId` khi tham chiếu đến người sở hữu `Property`.
    *   Sử dụng `userId` thay vì `tenantId` khi tham chiếu đến người tạo/sở hữu `Booking`.
    *   Sử dụng sai cách lọc theo quan hệ trong Prisma (`where.userId = ...` thay vì `where: { user: { id: ... } }`).
*   **Ảnh hưởng:** Gây ra lỗi TypeScript khi biên dịch và lỗi logic khi chạy, dẫn đến các test suite liên quan đến Bookings bị thất bại.

### 2.2. Thiếu Unit Test

*   **Vấn đề:** Không tìm thấy các file unit test cho `BookingsService` (`bookings.service.spec.ts`) và `BookingsController` (`bookings.controller.spec.ts`).
*   **Ảnh hưởng:** Thiếu kiểm thử đơn vị làm giảm độ tin cậy của module, khó phát hiện lỗi sớm và không thể đo lường độ bao phủ test (test coverage) một cách chính xác.

## 3. Kế hoạch Cải tiến và Sửa lỗi

1.  **Sửa lỗi Logic trong `bookings.service.ts` (Ưu tiên 1):**
    *   Thay thế tất cả các lần sử dụng `ownerId` trong ngữ cảnh `Property` bằng `tenantId`.
    *   Thay thế tất cả các lần sử dụng `userId` trong ngữ cảnh `Booking` bằng `tenantId`.
    *   Sửa lại logic lọc dữ liệu theo quan hệ Prisma cho đúng cú pháp (ví dụ: `where: { user: { id: ... } }`).

2.  **Bổ sung Unit Tests (Ưu tiên 2):**
    *   Tạo file `bookings.service.spec.ts` và viết các unit test cơ bản cho các phương thức chính của `BookingsService` (create, findAll, findOne, update, remove), bao gồm cả các trường hợp thành công và thất bại (ví dụ: không tìm thấy, không có quyền).
    *   Tạo file `bookings.controller.spec.ts` và viết các unit test cơ bản cho các endpoint của `BookingsController`, tập trung vào việc kiểm tra guards, pipes và việc gọi đúng service.

3.  **Kiểm tra lại Toàn bộ Test (Ưu tiên 3):**
    *   Sau khi sửa lỗi logic và bổ sung unit test, chạy lại toàn bộ bộ kiểm thử của dự án (`npm run test:cov`) để đảm bảo tất cả các test đều pass và kiểm tra độ bao phủ.

## 4. Bước Tiếp theo

*   Bắt đầu thực hiện **Bước 1: Sửa lỗi Logic trong `bookings.service.ts`**.
*   Cập nhật file `todo.md` để phản ánh kế hoạch này.
