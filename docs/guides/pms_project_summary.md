# Tổng hợp tài liệu dự án PMS (Property Management System)

## 1. Giới thiệu và Tổng quan

Dự án PMS (Property Management System) là một hệ thống quản lý chỗ nghỉ toàn diện được phát triển cho Roomrise Solutions. Mục tiêu là xây dựng một hệ thống hiện đại, dễ sử dụng, linh hoạt, tự động hóa quy trình quản lý đặt phòng, thanh toán, và cung cấp giao diện người dùng trực quan, responsive, hỗ trợ quản lý nhiều chỗ nghỉ.

Hệ thống được xây dựng theo kiến trúc client-server với frontend (React) và backend (NestJS) tách biệt, giao tiếp qua RESTful API và sử dụng cơ sở dữ liệu PostgreSQL.

## 2. Công nghệ sử dụng

### Frontend
- **Framework**: React với TypeScript
- **Routing**: React Router v6
- **State Management**: React Context API
- **Form Handling**: React Hook Form với Zod validation
- **UI Components**: Tailwind CSS và shadcn/ui
- **Icons**: Heroicons
- **HTTP Client**: Axios
- **Build Tool**: Vite

### Backend
- **Framework**: NestJS với TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **API**: RESTful API
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest

## 3. Cấu trúc dự án

### Frontend (`/frontend`)
- `src/api`: Cấu hình API client (axios).
- `src/components`: Các component UI tái sử dụng, chia theo tính năng (Bookings, Properties, RoomTypes, common, layout).
- `src/contexts`: Các React Context providers (Bookings, Properties, RoomTypes, Filter, Auth).
- `src/hooks`: Các custom React hooks (useAuth, useBookings).
- `src/mock`: Dữ liệu giả lập cho chế độ demo.
- `src/pages`: Các component trang, chia theo module (Bookings, Calendar, Dashboard, Properties, RoomTypes, etc.).
- `src/types`: Định nghĩa các kiểu dữ liệu TypeScript.
- `src/utils`: Các hàm tiện ích.
- `App.tsx`, `main.tsx`: Component gốc và điểm khởi chạy ứng dụng.

### Backend (`/pms_backend`)
- `prisma`: Schema và migrations của cơ sở dữ liệu.
- `src/auth`: Module xác thực (JWT, guards, strategies).
- `src/booking`, `src/property`, `src/room-type`, `src/user`: Các module nghiệp vụ chính, chứa controllers, services, DTOs, entities.
- `src/common`: Các decorator, DTO, enum, filter, interceptor dùng chung.
- `src/app.module.ts`, `src/main.ts`: Module gốc và điểm khởi chạy ứng dụng.
- `test`: Các file unit test và E2E test.

## 4. Mô hình dữ liệu (Các Entity chính)

- **User**: Quản lý thông tin người dùng (email, password, name, role).
- **Property**: Quản lý thông tin chỗ nghỉ (name, address, city, country, status, owner).
- **RoomType**: Quản lý thông tin loại phòng (name, capacity, basePrice, propertyId).
- **Booking**: Quản lý thông tin đặt phòng (guestName, contact, channel, checkIn/Out, dates, amounts, payment details, status, propertyId, roomTypeId, userId).

*Chi tiết các trường và quan hệ được định nghĩa trong `prisma/schema.prisma`.*

## 5. Các chức năng chính đã hoàn thành

- **Quản lý chỗ nghỉ (Properties)**: CRUD, xem danh sách, xem chi tiết, xem loại phòng/đặt phòng liên quan.
- **Quản lý loại phòng (Room Types)**: CRUD, xem danh sách theo chỗ nghỉ, xem chi tiết, xem đặt phòng liên quan.
- **Quản lý đặt phòng (Bookings)**: CRUD, xem danh sách, xem chi tiết, lọc theo nhiều tiêu chí, cập nhật trạng thái.
- **Giao diện người dùng**: Sidebar điều hướng, layout chính, các trang danh sách và chi tiết, form tạo/sửa, modal popup (chi tiết, xác nhận, form).
- **Xác thực & Phân quyền**: Đăng nhập JWT, phân quyền theo vai trò (ADMIN, MANAGER, STAFF).
- **Kiểm thử**: Unit tests cho backend (BookingService, BookingController) đã được sửa và pass 100%. Frontend đã được sửa lỗi type và build thành công.
- **Chế độ Demo**: Frontend có thể chạy với mock data khi không có backend.

## 6. Quá trình phát triển và các cột mốc

- **Giai đoạn 1**: Thiết kế và triển khai Sidebar, layout, routing cơ bản.
- **Giai đoạn 2 & 3**: Phát triển backend API và frontend UI cho tính năng Booking.
- **Giai đoạn 4**: Tích hợp các module, liên kết dữ liệu, phát triển các modal dùng chung.
- **Giai đoạn 5**: Cải thiện UI/UX, đồng bộ bộ lọc, tối ưu hóa.
- **Giai đoạn 6 (Hiện tại)**: Sửa lỗi test backend, cải thiện type safety frontend, chuẩn bị và viết test E2E Cypress (gặp giới hạn môi trường sandbox khi chạy).

## 7. Hướng dẫn triển khai

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev` (chạy development)
4. `npm run build` (build production)

### Backend
1. `cd pms_backend`
2. `npm install`
3. Cấu hình `DATABASE_URL` trong `.env`.
4. `npx prisma migrate dev` (chạy migration)
5. `npm run start:dev` (chạy development)
6. `npm run build` (build production)

## 8. Tình trạng hiện tại và Hướng phát triển tiếp theo

- **Hiện tại**: Backend tests pass 100%, frontend build thành công không lỗi type. Test E2E Cypress đã được viết nhưng không thể chạy hoàn chỉnh trong môi trường sandbox hiện tại do giới hạn kỹ thuật.
- **Khuyến nghị**: Thiết lập CI/CD (ví dụ: GitHub Actions) để tự động hóa build, test (bao gồm cả E2E) và deployment.
- **Ngắn hạn**: Hoàn thiện liên kết dữ liệu, cải thiện modals, đồng bộ bộ lọc, tối ưu hóa.
- **Trung hạn**: Phát triển các tính năng còn lại (Calendar, Payments, Reports), tích hợp OTA.
- **Dài hạn**: Phát triển mobile app, tích hợp thanh toán, mở rộng tính năng.

