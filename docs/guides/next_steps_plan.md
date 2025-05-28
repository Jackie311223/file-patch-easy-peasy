# Kế hoạch Tiếp theo & Phát triển Tương lai - PMS Roomrise

Dựa trên tiến độ hiện tại và các tài liệu đã có, dưới đây là các bước đề xuất tiếp theo và kế hoạch phát triển trong tương lai cho dự án PMS Roomrise:

## I. Ưu tiên Ngắn hạn (Next Steps)

1.  **Ổn định Môi trường Test Frontend**:
    *   **Vấn đề**: Các bài test UI hiện tại gặp lỗi treo và xung đột cấu hình khi chạy toàn bộ suite hoặc thậm chí khi chạy riêng lẻ (như đã ghi nhận trong `ui_test_update_report.md`).
    *   **Hành động**: Điều tra và khắc phục nguyên nhân gốc rễ của việc test bị treo (có thể liên quan đến mock, context providers, cấu hình Jest/Vite, hoặc các dependency xung đột). Cấu hình lại môi trường test để đảm bảo tất cả các test (bao gồm cả các test mới viết) có thể chạy ổn định và đáng tin cậy.
    *   **Mục tiêu**: Chạy thành công toàn bộ test suite frontend (`npm test`) và xác nhận coverage chính xác.

2.  **Hoàn thiện Module Settings**: Trang Settings hiện tại có thể chỉ là placeholder. Cần triển khai các chức năng cấu hình cần thiết:
    *   Quản lý thông tin tài khoản người dùng (đổi mật khẩu, thông tin cá nhân).
    *   Cấu hình hệ thống cho PARTNER/SUPER_ADMIN (ví dụ: quản lý người dùng trong tenant, cấu hình property, cài đặt thông báo...). (*Cần xác định rõ yêu cầu*).

3.  **Hoàn thiện Module Reports**: Mở rộng chức năng báo cáo:
    *   Thêm các loại báo cáo mới (ví dụ: báo cáo khách hàng, báo cáo công nợ OTA...). (*Cần xác định rõ yêu cầu*).
    *   Cải thiện giao diện hiển thị báo cáo (biểu đồ tương tác, tùy chọn xuất file Excel/PDF).

4.  **Rà soát và Hoàn thiện Luồng Nghiệp vụ**: Kiểm tra lại các luồng nghiệp vụ chính (đặt phòng, thanh toán, xuất hóa đơn, check-in/out qua lịch) để đảm bảo tính chính xác, đầy đủ và xử lý hết các trường hợp biên.

## II. Phát triển Trung hạn

1.  **Mở rộng Tính năng Calendar**: Thêm các tính năng nâng cao cho module lịch:
    *   Quản lý tình trạng phòng (Housekeeping: Clean, Dirty, Inspect).
    *   Hiển thị ghi chú hoặc sự kiện đặc biệt trên lịch.
    *   Tính năng block phòng (Out of Order/Inventory).
2.  **Tích hợp Kênh Thanh toán Online**: Tích hợp trực tiếp với các cổng thanh toán (ví dụ: Stripe, PayPal, VNPAY...) để xử lý thanh toán online thay vì chỉ ghi nhận thủ công.
3.  **Quản lý Khách hàng (CRM)**:
    *   Xây dựng module quản lý thông tin khách hàng.
    *   Lịch sử đặt phòng và tương tác của khách hàng.
4.  **Quản lý Giá & Khuyến mãi**: Xây dựng module quản lý bảng giá linh hoạt (theo mùa, theo ngày, theo loại phòng) và các chương trình khuyến mãi.
5.  **Tích hợp Channel Manager**: Kết nối với các Channel Manager để đồng bộ tình trạng phòng và giá cả với các kênh OTA.

## III. Cải tiến Kỹ thuật & Hạ tầng

1.  **CI/CD Pipeline**: Thiết lập quy trình CI/CD hoàn chỉnh (ví dụ: sử dụng GitHub Actions) để tự động hóa việc build, test và deploy cả backend và frontend.
2.  **Monitoring & Logging**: Tích hợp các công cụ giám sát (ví dụ: Prometheus, Grafana) và logging tập trung (ví dụ: ELK Stack, Sentry) để theo dõi hiệu năng và lỗi ứng dụng trong môi trường production.
3.  **Tối ưu Performance**: Tiếp tục rà soát và tối ưu hiệu năng backend (tối ưu query database, caching) và frontend (code splitting, tối ưu bundle size, lazy loading).
4.  **Security Audit**: Thực hiện đánh giá bảo mật toàn diện cho ứng dụng.
5.  **Visual Regression Testing**: Bổ sung visual regression testing (ví dụ: sử dụng Percy hoặc Chromatic) để phát hiện các thay đổi không mong muốn về giao diện.

## IV. Kế hoạch Đưa vào Sản xuất (Production Plan)

- Tham khảo `/home/ubuntu/pms_project/pms_analysis_and_production_plan.md` và `/home/ubuntu/pms_project/production_plan.md` để có kế hoạch chi tiết hơn về việc chuẩn bị môi trường, di chuyển dữ liệu và triển khai ứng dụng cho người dùng cuối.
