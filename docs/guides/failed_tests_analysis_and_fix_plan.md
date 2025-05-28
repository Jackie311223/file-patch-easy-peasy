# Phân tích và Kế hoạch Sửa lỗi Test Thất bại

## 1. Tóm tắt Vấn đề

Trong quá trình kiểm tra độ bao phủ test (`npm run test:cov`) cho backend, đã phát hiện 9/13 test suite thất bại. Các lỗi chủ yếu tập trung ở các file liên quan đến module `Bookings` (`bookings.service.ts`, `bookings.controller.spec.ts`, `bookings.service.spec.ts`).

## 2. Phân tích Nguyên nhân Lỗi

Dựa trên log lỗi chi tiết từ `npm test` và đối chiếu với `prisma/schema.prisma`, nguyên nhân chính của các lỗi test thất bại là do sự **không khớp giữa mã nguồn logic trong `bookings.service.ts` và định nghĩa schema thực tế của Prisma**.

Cụ thể:

*   **Lỗi `Property 'ownerId' does not exist on type '{...}'` (trong `Property`):**
    *   **Mã nguồn:** Nhiều chỗ trong `bookings.service.ts` cố gắng truy cập `roomType.property.ownerId` hoặc lọc theo `ownerId` trong `PropertyWhereInput`.
    *   **Schema Prisma:** Model `Property` không có trường `ownerId`. Thay vào đó, nó có trường `tenantId` (là khóa ngoại liên kết đến `User` - người sở hữu/đối tác) và quan hệ `user`.
    *   **Kết luận:** Code đã sử dụng sai tên trường. Cần thay thế `ownerId` bằng `tenantId` khi tham chiếu đến người sở hữu Property.

*   **Lỗi `Property 'userId' does not exist on type 'BookingWhereInput'. Did you mean 'user'?`:**
    *   **Mã nguồn:** Code cố gắng lọc Booking bằng cách gán `where.userId = user.id`.
    *   **Schema Prisma:** `BookingWhereInput` được Prisma sinh ra không có trường `userId` trực tiếp ở cấp cao nhất của `where`. Nó mong đợi một bộ lọc quan hệ như `user: { id: user.id }`.
    *   **Kết luận:** Code đã sử dụng sai cách lọc theo quan hệ User trong Booking.

*   **Lỗi `Property 'userId' does not exist on type '{...}'` (trong `Booking`):**
    *   **Mã nguồn:** Code cố gắng truy cập `booking.userId`.
    *   **Schema Prisma:** Model `Booking` không có trường `userId`. Nó có trường `tenantId` (liên kết đến User - người sở hữu/đối tác) và quan hệ `user`.
    *   **Kết luận:** Code đã sử dụng sai tên trường. Cần thay thế `userId` bằng `tenantId` khi tham chiếu đến người tạo/sở hữu Booking.

## 3. Kế hoạch Sửa lỗi

1.  **Tái cấu trúc (Refactor) `bookings.service.ts`:**
    *   **Thay thế `ownerId`:** Tìm và thay thế tất cả các lần sử dụng `roomType.property.ownerId` bằng `roomType.property.tenantId`.
    *   **Sửa lỗi lọc Booking:** Thay đổi cách lọc `where.userId = user.id` thành cách lọc đúng theo quan hệ Prisma, ví dụ: `where: { ..., user: { id: user.id } }` (cần xem xét lại logic lọc cụ thể).
    *   **Sửa lỗi lọc Property:** Thay đổi `ownerId: user.id` trong `PropertyWhereInput` thành `tenantId: user.id`.
    *   **Thay thế `userId`:** Tìm và thay thế tất cả các lần sử dụng `booking.userId` bằng `booking.tenantId`.

2.  **Rà soát Mock Data trong Tests:** Kiểm tra lại dữ liệu giả lập (mock data) trong các file `*.spec.ts` của module Bookings để đảm bảo chúng phù hợp với schema đã sửa (sử dụng `tenantId`).

3.  **Chạy lại Kiểm thử:** Sau khi áp dụng các bản sửa lỗi, chạy lại `npm run test:cov` để xác nhận các test đã pass và kiểm tra lại độ bao phủ.

## 4. Bước Tiếp theo

Sau khi hoàn thành việc sửa lỗi và xác nhận các bài kiểm thử đã pass, tôi sẽ:
*   Cập nhật file `todo.md`.
*   Tổng hợp báo cáo tiến độ cuối cùng cho Sprint 01.
*   Gửi các file mã nguồn đã cập nhật và báo cáo cho bạn.
