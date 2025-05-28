## Tech Stack và Những Thiếu Sót Hiện Tại

**Tech Stack:**

Dựa trên các tệp đã phân tích, tech stack của hệ thống PMS bao gồm:

*   **Backend:**
    *   Ngôn ngữ: TypeScript
    *   Framework: NestJS (Node.js)
    *   ORM: Prisma
    *   Xác thực: JWT (JSON Web Tokens), bcrypt (để băm mật khẩu)
    *   API: RESTful
*   **Frontend:**
    *   Công cụ Build: Vite (suy đoán)
    *   Framework/Library: React, Vue, hoặc Angular (suy đoán)
    *   Ngôn ngữ: JavaScript/TypeScript (suy đoán)
*   **Database:**
    *   Hệ quản trị CSDL: PostgreSQL (phiên bản 15-alpine trong Docker)
*   **Containerization:**
    *   Công cụ: Docker, Docker Compose
*   **Khác:**
    *   UUID: Sử dụng cho khóa chính (ví dụ: trong `seed.ts`)
    *   Date Handling: `date-fns` (thấy trong `bookings.service.ts`)

**Những Thiếu Sót Hiện Tại và Điểm Cần Cải Thiện:**

Mặc dù nền tảng công nghệ khá hiện đại và cấu trúc dự án có vẻ tốt, hệ thống vẫn còn một số thiếu sót đáng kể cần giải quyết để đạt trạng thái production-ready:

1.  **Testing:** Mặc dù có một số tệp `.spec.ts` (ví dụ: `properties.service.spec.ts`), phạm vi và độ sâu của kiểm thử (unit, integration, e2e) chưa rõ ràng. Cần đảm bảo độ bao phủ mã (code coverage) cao và các kịch bản quan trọng được kiểm thử đầy đủ.
2.  **CI/CD (Continuous Integration/Continuous Deployment):** Không có bằng chứng về một quy trình CI/CD tự động. Việc build, test và deploy thủ công dễ gây lỗi và tốn thời gian. Cần thiết lập pipeline tự động hóa các bước này.
3.  **Quản lý Cấu hình và Secrets:** Biến môi trường được sử dụng (ví dụ: `DATABASE_URL`, `JWT_SECRET` trong `docker-compose.yml`), nhưng `JWT_SECRET` đang được đặt giá trị cứng ("supersecret") trong tệp cấu hình, đây là một rủi ro bảo mật nghiêm trọng. Cần sử dụng các giải pháp quản lý secrets an toàn hơn (như Vault, AWS Secrets Manager, hoặc biến môi trường được inject lúc runtime) và tách biệt cấu hình cho các môi trường khác nhau (development, staging, production).
4.  **Error Handling và Logging:** Hệ thống có sử dụng Logger của NestJS (`Logger` trong `bookings.service.ts`), nhưng cần đảm bảo logging được chuẩn hóa, có cấu trúc (ví dụ: JSON format), và tập trung (ví dụ: sử dụng ELK stack, Datadog, Sentry) để dễ dàng giám sát và gỡ lỗi trong môi trường production. Cơ chế xử lý lỗi cần nhất quán và cung cấp đủ thông tin mà không làm lộ chi tiết nhạy cảm.
5.  **Bảo mật Nâng cao:** Ngoài xác thực và phân quyền cơ bản, cần xem xét các biện pháp bảo mật khác như:
    *   Rate Limiting: Chống lại các cuộc tấn công brute-force hoặc DoS.
    *   Security Headers: Thêm các HTTP header bảo mật (CSP, HSTS, X-Frame-Options, etc.).
    *   Input Validation: Đảm bảo tất cả dữ liệu đầu vào từ người dùng được xác thực chặt chẽ ở cả frontend và backend để chống XSS, injection, etc.
    *   Dependency Scanning: Quét các thư viện phụ thuộc để tìm lỗ hổng bảo mật đã biết.
6.  **Documentation:** Thiếu tài liệu API chi tiết (ví dụ: sử dụng Swagger/OpenAPI tích hợp với NestJS), tài liệu kiến trúc, và hướng dẫn sử dụng/vận hành. Điều này gây khó khăn cho việc bảo trì, phát triển tiếp và onboarding thành viên mới.
7.  **Monitoring và Alerting:** Không có hệ thống giám sát tài nguyên (CPU, memory, disk, network), hiệu năng ứng dụng (APM), hoặc thiết lập cảnh báo khi có sự cố hoặc ngưỡng bất thường.
8.  **Database Migrations:** Mặc dù Prisma hỗ trợ migrations, quy trình quản lý migration (tạo, áp dụng, rollback) cần được tích hợp vào quy trình phát triển và CI/CD một cách rõ ràng.
9.  **Tối ưu hóa Frontend:** Cần đảm bảo frontend được build tối ưu cho production (code splitting, lazy loading, tối ưu hóa hình ảnh, caching) để cải thiện tốc độ tải trang và trải nghiệm người dùng.
10. **Resilience và Scalability:** Chưa có các cơ chế như health checks cho các service trong Docker Compose, chiến lược retry cho các lệnh gọi API hoặc database không thành công, hoặc kế hoạch scaling (ví dụ: sử dụng Kubernetes thay vì Docker Compose cho production).
11. **Kiểm tra phòng trống (Availability Check):** Logic kiểm tra phòng trống trong `BookingsService` chưa được thể hiện rõ ràng. Đây là một phần cốt lõi của PMS và cần được triển khai một cách chính xác và hiệu quả, xử lý các trường hợp đặt phòng trùng lặp hoặc quá số lượng phòng.
