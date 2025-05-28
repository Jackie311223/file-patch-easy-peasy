# Phân tích Hiện trạng và Kế hoạch Ưu tiên (Bước 3)

Dựa trên việc rà soát chi tiết toàn bộ mã nguồn và tệp cấu hình gốc trong tệp `pms_consolidated.zip`, tôi đã xác định các vấn đề chính và đề xuất kế hoạch ưu tiên để cấu hình lại và sửa chữa dự án, hướng tới mục tiêu production-ready. Kế hoạch này tập trung vào việc khắc phục các vấn đề nền tảng trước, đảm bảo tính đúng đắn của cấu trúc và cấu hình, trước khi đi vào các cải tiến mã nguồn chi tiết hơn.

## A. Phân tích Hiện trạng (Tóm tắt Phát hiện)

1.  **Cấu trúc Dự án Lộn xộn:**
    *   Nhiều tệp nguồn (`.ts`, `.tsx`), tệp cấu hình (`schema.prisma`, `.env`), và tài nguyên (`.sql`, `.webp`) nằm trực tiếp ở thư mục gốc (`/`) thay vì trong các thư mục con `backend` hoặc `frontend` tương ứng.
    *   Điều này gây khó khăn cho việc build, chạy, và bảo trì dự án.

2.  **Cấu hình Backend:**
    *   NestJS backend có cấu trúc module khá chuẩn (`properties`, `room-type`, `bookings`, `auth`, `plan`).
    *   Sử dụng Prisma ORM, nhưng `schema.prisma` và `seed.ts` nằm sai vị trí (ở gốc).
    *   Sử dụng `.env` ở cả gốc và thư mục `backend`, cần thống nhất.
    *   Thiếu cấu hình logging JSON chuẩn hóa.
    *   `Dockerfile` ở gốc dường như dành cho backend nhưng cần cập nhật theo cấu trúc mới.

3.  **Cấu hình Frontend:**
    *   React frontend sử dụng Vite, TypeScript, Context API, Axios.
    *   Cấu trúc `src` khá chuẩn (`pages`, `components`, `hooks`, `contexts`).
    *   Thiếu `tailwind.config.js` và `postcss.config.js` dù có sử dụng Tailwind CSS.
    *   `vite.config.ts` có cấu hình port (5179) và `allowedHosts` cần xem xét lại, port không khớp với `docker-compose.yml` (8080).
    *   Thiếu `Dockerfile` riêng cho frontend.
    *   Thiếu cơ chế logging lỗi chuẩn hóa hoặc `ErrorBoundary`.

4.  **Cấu hình Docker (`docker-compose.yml`):**
    *   Định nghĩa services `db`, `backend`, `frontend`.
    *   Sử dụng `.env` ở gốc.
    *   Volume mounts cần tối ưu cho hot-reload dựa trên cấu trúc đúng.
    *   Thiếu healthchecks cho các services.
    *   Cần cập nhật `context` và `dockerfile` paths sau khi tái cấu trúc.

5.  **Scripts và Dependencies:**
    *   `package.json` tồn tại trong `backend` và `frontend` nhưng cần rà soát lại các script (đặc biệt là Prisma) sau khi tái cấu trúc.
    *   Cần chạy `npm install` ở cả hai nơi sau khi sắp xếp lại.

## B. Kế hoạch Ưu tiên Sửa chữa và Cấu hình

Các bước sau cần được thực hiện tuần tự để giải quyết các vấn đề trên một cách có hệ thống:

**Ưu tiên 1: Tái cấu trúc Thư mục Dự án**

*   **Mục tiêu:** Đưa tất cả các tệp về đúng vị trí trong `backend` hoặc `frontend`.
*   **Hành động:**
    *   Di chuyển tất cả các tệp `.ts`, `.tsx`, `.css`, `.svg`, `.interface.ts`, `.dto.ts` từ gốc vào các thư mục con phù hợp trong `backend/src/` hoặc `frontend/src/`.
    *   Di chuyển `schema.prisma`, `seed.ts`, `migration.sql` vào `backend/prisma/` hoặc `backend/scripts/`.
    *   Di chuyển `Dockerfile` (backend) vào thư mục `backend/`.
    *   Xóa các tệp `.webp` không cần thiết hoặc di chuyển vào `frontend/public/` nếu cần.
    *   Đảm bảo thư mục gốc chỉ chứa các tệp cấu hình chung như `docker-compose.yml`, `.env`, `.gitignore`, `README.md`.

**Ưu tiên 2: Chuẩn hóa Cấu hình Môi trường và Build**

*   **Mục tiêu:** Đảm bảo cấu hình nhất quán và chính xác cho cả backend và frontend.
*   **Hành động:**
    *   **Backend:**
        *   Cập nhật đường dẫn import trong mã nguồn backend sau khi di chuyển tệp.
        *   Chỉnh sửa `backend/package.json` để các script Prisma (`generate`, `migrate`, `seed`) trỏ đúng vào `prisma/schema.prisma`.
        *   Thống nhất sử dụng biến môi trường từ file `.env` ở gốc thông qua `@nestjs/config`. Xóa file `.env` trong `backend/` nếu có.
    *   **Frontend:**
        *   Cập nhật đường dẫn import trong mã nguồn frontend.
        *   Tạo file `frontend/tailwind.config.js` và `frontend/postcss.config.js` cơ bản.
        *   Chỉnh sửa `frontend/vite.config.ts`: chuẩn hóa port (ví dụ: 5173), xóa `allowedHosts` không cần thiết, đảm bảo đọc biến môi trường đúng cách (ví dụ: `VITE_API_BASE_URL` từ `.env` gốc).
    *   **Chung:**
        *   Tạo file `.env.example` ở gốc dựa trên file `.env` gốc hiện có, loại bỏ các giá trị nhạy cảm.
        *   Thêm `.env` vào `.gitignore` (nếu chưa có).

**Ưu tiên 3: Cập nhật Cấu hình Docker**

*   **Mục tiêu:** Làm cho `docker-compose` hoạt động đúng với cấu trúc mới và thêm các best practices.
*   **Hành động:**
    *   Chỉnh sửa `docker-compose.yml`:
        *   Cập nhật `context` và `dockerfile` paths cho services `backend` và `frontend`.
        *   Tối ưu `volumes` để mount mã nguồn `backend/src` và `frontend/src` cho hot-reload trong môi trường dev.
        *   Thêm `healthcheck` cho services `db` và `backend`.
        *   Đảm bảo port mapping đúng (ví dụ: frontend 8080 -> 5173, backend 3001 -> 3001).
    *   Tạo `Dockerfile` cho frontend (`frontend/Dockerfile`) để build production image.
    *   Rà soát lại `backend/Dockerfile` sau khi tái cấu trúc.

**Ưu tiên 4: Cài đặt Dependencies và Kiểm tra Build**

*   **Mục tiêu:** Đảm bảo tất cả dependencies được cài đặt và dự án có thể build được.
*   **Hành động:**
    *   Chạy `npm install` trong thư mục `backend/`.
    *   Chạy `npm install` trong thư mục `frontend/`.
    *   Thử chạy lệnh build cho backend (`npm run build` trong `backend/`).
    *   Thử chạy lệnh build cho frontend (`npm run build` trong `frontend/`).

**Ưu tiên 5: Cải tiến Mã nguồn (Nếu cần thiết & thời gian cho phép)**

*   **Mục tiêu:** Áp dụng các best practices còn thiếu.
*   **Hành động (Tùy chọn/Thứ yếu):**
    *   Triển khai logger JSON chuẩn hóa cho backend.
    *   Thêm `ErrorBoundary` cho frontend.
    *   Rà soát và tối ưu logic trong `useAuth.tsx` hoặc các services/controllers nếu có vấn đề rõ ràng.
    *   Cập nhật `README.md` ở gốc với hướng dẫn cài đặt và chạy *sau khi* đã tái cấu trúc.

---

Kế hoạch này tập trung vào việc sửa chữa nền tảng trước. Sau khi hoàn thành các bước ưu tiên 1-4, dự án sẽ có cấu trúc rõ ràng, cấu hình nhất quán và có khả năng chạy/build được (ít nhất là về mặt cấu trúc). Bước 5 là các cải tiến bổ sung.

Tôi sẽ chờ xác nhận của bạn trước khi bắt đầu thực hiện **Ưu tiên 1: Tái cấu trúc Thư mục Dự án**.
