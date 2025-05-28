## Phân tích Kiến trúc Hệ thống và Ranh giới Module

Hệ thống Quản lý Tài sản (PMS) này được xây dựng theo kiến trúc microservices hoặc, nhiều khả năng hơn, là một kiến trúc monolithic backend kết hợp với một Single Page Application (SPA) frontend. Tệp `docker-compose.yml` định nghĩa rõ ràng ba thành phần chính: `db` (PostgreSQL), `backend` (Node.js/NestJS), và `frontend` (có thể là React/Vue/Angular với Vite). Sự tách biệt này trong Docker Compose cho phép phát triển và triển khai độc lập ở một mức độ nào đó, nhưng tương tác giữa backend và frontend chủ yếu thông qua API RESTful.

**Backend:**
Kiến trúc backend dựa trên framework NestJS, một framework Node.js mạnh mẽ và có cấu trúc rõ ràng, sử dụng TypeScript. NestJS thúc đẩy việc sử dụng các mẫu thiết kế như Dependency Injection, Modules, Controllers, và Services, giúp tạo ra mã nguồn dễ bảo trì và mở rộng. Ranh giới giữa các module chức năng được định nghĩa rõ ràng thông qua hệ thống Module của NestJS. Các module chính bao gồm:
*   **`AuthModule`:** Xử lý xác thực người dùng (login, register) sử dụng JWT và phân quyền dựa trên vai trò (RBAC) thông qua Guards và Decorators (`RolesGuard`, `RolesDecorator`). Điều này đảm bảo chỉ người dùng có quyền phù hợp mới truy cập được các tài nguyên nhất định.
*   **`UsersModule`:** Quản lý thông tin người dùng và các hoạt động liên quan.
*   **`PropertiesModule`:** Quản lý thông tin về các tài sản (khách sạn, căn hộ). Module này triển khai logic multi-tenancy, sử dụng `tenantId` để đảm bảo các đối tác (`PARTNER`) chỉ có thể quản lý tài sản của mình, trong khi `SUPER_ADMIN` có quyền truy cập toàn bộ.
*   **`RoomTypeModule`:** Quản lý các loại phòng thuộc về một tài sản cụ thể.
*   **`BookingsModule`:** Xử lý logic đặt phòng, bao gồm tính toán giá, kiểm tra phòng trống (mặc dù logic kiểm tra phòng trống chi tiết chưa được thấy rõ), và liên kết đặt phòng với người dùng, tài sản, và loại phòng. Module này cũng tính toán hoa hồng cho các nguồn đặt phòng không trực tiếp.
*   **`PlanModule`:** Quản lý các gói dịch vụ và quyền hạn liên quan (`permissions`), cho phép giới hạn chức năng dựa trên gói đăng ký của đối tác.
*   **`PrismaModule`:** Đóng gói Prisma Client và cung cấp `PrismaService` để tương tác với cơ sở dữ liệu PostgreSQL. Prisma đóng vai trò là lớp ORM, đơn giản hóa các thao tác CRUD và quản lý schema database.

Ranh giới giữa các module này khá rõ ràng, tuân theo nguyên tắc Single Responsibility Principle ở cấp độ module. Dữ liệu được truyền giữa các lớp (Controller -> Service -> Prisma) một cách có cấu trúc, sử dụng DTOs (Data Transfer Objects) để xác thực và định hình dữ liệu đầu vào/đầu ra.

**Frontend:**
Thông tin chi tiết về frontend còn hạn chế, nhưng sự hiện diện của dịch vụ `frontend` trong Docker Compose và biến môi trường `VITE_API_BASE_URL` cho thấy đây là một SPA được xây dựng bằng một framework JavaScript hiện đại (như React, Vue, Angular) và sử dụng Vite làm công cụ build. Frontend giao tiếp với backend hoàn toàn qua API RESTful được định nghĩa bởi các controller trong backend.

**Database:**
Cơ sở dữ liệu là PostgreSQL, được quản lý thông qua Prisma ORM. Prisma Migrate có khả năng được sử dụng để quản lý các thay đổi schema (mặc dù không thấy rõ tệp migration trong nội dung đã đọc). Tệp `seed.ts` cho thấy việc khởi tạo dữ liệu ban đầu được thực hiện bằng Prisma Client.

**Ranh giới tổng thể:**
Ranh giới chính là giữa frontend, backend và database. Frontend chịu trách nhiệm về giao diện người dùng và trải nghiệm người dùng, backend xử lý logic nghiệp vụ, quản lý dữ liệu và bảo mật, còn database lưu trữ dữ liệu bền vững. Giao tiếp giữa frontend và backend là điểm khớp nối quan trọng, đòi hỏi API được thiết kế tốt và có tài liệu rõ ràng.
