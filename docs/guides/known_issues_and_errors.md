# Các Vấn đề Hiện tại & Lỗi Đã biết - PMS Roomrise

Dự án PMS Roomrise, mặc dù đã đạt được nhiều tiến bộ đáng kể, vẫn còn một số vấn đề kỹ thuật và lỗi cần được giải quyết:

## 1. Môi trường Test Frontend Không Ổn định

Đây là vấn đề nghiêm trọng nhất hiện tại, cản trở việc xác nhận chất lượng và độ ổn định của giao diện người dùng.

- **Test bị Treo/Đơ (Hang/Freeze)**: Các bài test UI (sử dụng Jest và React Testing Library) thường xuyên bị treo, không hoàn thành, ngay cả khi chạy riêng lẻ. Điều này khiến việc đánh giá coverage và kết quả test trở nên không đáng tin cậy.
- **Xung đột Cấu hình Jest**: Hệ thống phát hiện nhiều file cấu hình Jest (`jest.config.js`, `jest.config.cjs`), yêu cầu chỉ định rõ file config khi chạy.
- **Thiếu Context Providers trong Test**: Nhiều bài test cũ (và có thể cả một số test mới nếu setup không đúng) bị lỗi do thiếu các React Context cần thiết (ví dụ: `useAuth`, `useBookings`, `ThemeProvider`). Điều này cho thấy `test-utils.tsx` hoặc cách setup test cho từng file cần được chuẩn hóa và hoàn thiện.
- **Phụ thuộc API và Mocking Phức tạp**: Việc mock các API calls và các thư viện phức tạp (như React DnD cho kéo thả) trong môi trường test có thể gây ra lỗi hoặc làm test bị treo.
- **Cần Tái cấu trúc Test Helpers**: File `test-utils.tsx` có thể quá phức tạp. Cần xem xét tái cấu trúc để tạo các helper chuyên biệt hơn, giảm sự phụ thuộc chéo và tăng tính ổn định.

## 2. Các Module Chưa Hoàn Thiện

- **Trang Settings**: Hiện tại có thể chỉ là một trang giữ chỗ (placeholder). Cần triển khai đầy đủ chức năng cho phép người dùng quản lý tài khoản và admin/partner cấu hình hệ thống.
- **Trang Reports**: Chức năng báo cáo còn cơ bản. Cần mở rộng thêm các loại báo cáo, cải thiện cách hiển thị dữ liệu (biểu đồ tương tác) và thêm tùy chọn xuất dữ liệu (Excel, PDF).

## 3. Các Vấn đề Tiềm ẩn Khác

- **Backend Edge Cases**: Mặc dù test backend có coverage tốt, sự phức tạp của logic RBAC và multi-tenant có thể ẩn chứa các trường hợp lỗi biên chưa được phát hiện.
- **API Filtering**: API `GET /payments` cần được kiểm tra lại hoặc bổ sung để hỗ trợ lọc các payment chưa được gán vào hóa đơn nào (cần cho `InvoiceCreateModal`).

## 4. Nợ Kỹ thuật (Technical Debt) & Thiếu sót Quy trình

- **Thiếu CI/CD**: Chưa có quy trình Tích hợp Liên tục/Triển khai Liên tục (CI/CD), làm chậm quá trình phát triển và tăng nguy cơ lỗi khi deploy.
- **Thiếu Monitoring & Logging**: Chưa có hệ thống giám sát và ghi log tập trung cho môi trường production, gây khó khăn trong việc theo dõi hiệu năng và điều tra lỗi.
- **Thiếu Visual Regression Testing**: Không có cơ chế tự động phát hiện các thay đổi không mong muốn về giao diện người dùng.
