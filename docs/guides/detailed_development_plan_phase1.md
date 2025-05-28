# Kế hoạch Phát triển Chi tiết Dự án PMS - Giai đoạn 1: Hoàn thiện & Củng cố Lõi Nghiệp vụ

## 1. Phân tích Phản hồi & Tinh chỉnh Chiến lược (Đã hoàn thành)

Dựa trên lộ trình chiến lược ban đầu và phản hồi chi tiết từ bạn, chiến lược phát triển được tinh chỉnh như sau:

*   **Giữ nguyên 4 Giai đoạn Chính:** Củng cố Lõi, Kiểm thử Toàn diện, CI/CD & Triển khai, Giám sát & Tối ưu hóa.
*   **Áp dụng Khung Agile (Scrum):** Chia các giai đoạn thành các Sprint (ví dụ: 2 tuần/Sprint) với mục tiêu, nhiệm vụ, và deliverables rõ ràng.
*   **Tích hợp Quản lý Dự án Chuyên nghiệp:** Lồng ghép KPIs, quản lý rủi ro, kế hoạch rollback, quy trình quản trị (governance), vòng lặp phản hồi UX, và các nghi thức Agile vào từng Sprint.
*   **Tập trung vào Giai đoạn 1:** Kế hoạch chi tiết này sẽ tập trung vào các Sprint đầu tiên của Giai đoạn 1.

## 2. Cấu trúc Sprint & Timeline (Đề xuất)

*   **Độ dài Sprint:** 2 tuần.
*   **Nghi thức Agile (Giả định):** Sprint Planning, Daily Stand-up, Sprint Review/Demo, Sprint Retrospective.
*   **Công cụ Quản lý:** GitHub Projects/Issues/Milestones (đề xuất).
*   **Timeline Giai đoạn 1 (Ước tính):** 3-5 Sprints (6-10 tuần), tùy thuộc vào độ phức tạp và nguồn lực.

## 3. Phân rã Nhiệm vụ Giai đoạn 1 & KPIs (Sprint 01 & 02)

### Sprint 01: Nền tảng Backend & Thiết lập Ban đầu (2 Tuần)

*   **Mục tiêu Sprint:** Xác nhận môi trường phát triển cục bộ hoạt động (DB, Backend chạy), thiết lập cơ bản Module Auth, định nghĩa KPIs ban đầu, thiết lập quy trình governance cơ bản.
*   **Nhiệm vụ Chính:**
    1.  **(Task 1.1 - Backend/DevOps):** Xác minh/Hoàn thiện thiết lập môi trường local (Chạy DB qua Docker, chạy Backend qua `npm run start:dev`). Đảm bảo Prisma kết nối và migrate được. (Ước tính: 1 ngày)
    2.  **(Task 1.2 - Backend):** Rà soát/Hoàn thiện Module `Auth` (Login API, JWT Strategy, `JwtAuthGuard`). Viết Unit Test cơ bản cho `AuthService`. (Ước tính: 3 ngày)
    3.  **(Task 1.3 - Backend):** Triển khai Module `Users` cơ bản (CRUD cho User, liên kết với Auth). Viết Unit Test cơ bản. (Ước tính: 3 ngày)
    4.  **(Task 1.4 - PM/TechLead):** Định nghĩa bộ KPIs ban đầu (Sprint 01): Task Completion Rate (%), Unit Test Coverage (%), Số lượng Bugs nghiêm trọng phát hiện. (Ước tính: 0.5 ngày)
    5.  **(Task 1.5 - PM/TechLead):** Thiết lập quy trình Governance cơ bản: Tạo PR Template, thiết lập Linting (ESLint) & Formatting (Prettier) với pre-commit hook (husky + lint-staged). (Ước tính: 1 ngày)
    6.  **(Task 1.6 - DevOps/Backend):** Định nghĩa chiến lược Backup & Restore cơ bản cho DB PostgreSQL. (Ước tính: 0.5 ngày)
*   **KPIs Sprint 01:** Task Completion Rate >= 90%, Unit Test Coverage (Auth, Users) >= 60%, 0 Critical Bugs.
*   **Quản lý Rủi ro:**
    *   Rủi ro: Môi trường local không ổn định -> Giảm thiểu: Tài liệu hóa kỹ các bước setup, hỗ trợ lẫn nhau.
    *   Rủi ro: Logic Auth phức tạp hơn dự kiến -> Giảm thiểu: Chia nhỏ task, pair programming.
*   **Sản phẩm Bàn giao:** Môi trường local chạy được, Module Auth/Users cơ bản + Unit Test, PR Template, Linting/Formatting tự động, Tài liệu chiến lược Backup DB, Báo cáo KPIs Sprint 01.

### Sprint 02: CRUD Properties, RoomTypes & Testing Nâng cao (2 Tuần)

*   **Mục tiêu Sprint:** Hoàn thiện CRUD cho Properties & RoomTypes, tăng cường Unit/Integration Test, bắt đầu thiết lập Dashboard KPI.
*   **Nhiệm vụ Chính:**
    1.  **(Task 2.1 - Backend):** Hoàn thiện CRUD API cho `PropertiesModule` (bao gồm validation DTO, service logic, multi-tenancy). Viết Unit & Integration Test. (Ước tính: 4 ngày)
    2.  **(Task 2.2 - Backend):** Hoàn thiện CRUD API cho `RoomTypesModule` (liên kết với Properties, validation, service logic). Viết Unit & Integration Test. (Ước tính: 4 ngày)
    3.  **(Task 2.3 - QA/DevOps):** Thiết lập công cụ đo lường Test Coverage (ví dụ: Jest coverage reporters). (Ước tính: 0.5 ngày)
    4.  **(Task 2.4 - DevOps/PM):** Bắt đầu thiết lập Dashboard KPI cơ bản (ví dụ: Grafana/Simple Dashboard) để theo dõi các metrics đã định nghĩa. (Ước tính: 1 ngày)
    5.  **(Task 2.5 - Backend):** Triển khai cơ chế Rollback cơ bản cho Prisma migrations (tài liệu hóa quy trình). (Ước tính: 0.5 ngày)
*   **KPIs Sprint 02:** Task Completion Rate >= 90%, Unit Test Coverage (Core Modules) >= 75%, Integration Test Coverage >= 50%, Dashboard KPI hiển thị metrics Sprint 01.
*   **Quản lý Rủi ro:**
    *   Rủi ro: Logic multi-tenancy phức tạp -> Giảm thiểu: Review kỹ, viết test case cụ thể.
    *   Rủi ro: Integration test khó thiết lập -> Giảm thiểu: Sử dụng test database riêng, thư viện hỗ trợ (testing-library).
*   **Sản phẩm Bàn giao:** CRUD API hoàn chỉnh cho Properties/RoomTypes + Tests, Báo cáo Test Coverage, Dashboard KPI cơ bản, Tài liệu quy trình Rollback Migration, Báo cáo KPIs Sprint 02.

## 4. Tích hợp Quản lý Rủi ro & Governance (Đã lồng ghép vào từng Sprint)

*   **Quản lý Rủi ro:** Xác định rủi ro tiềm ẩn và biện pháp giảm thiểu cho từng Sprint.
*   **Governance:** Áp dụng dần các quy trình: PR Template, Linting/Formatting (S01), Code Review Guidelines (S02+), Quality Gates (S03+), Release Checklist (Khi chuẩn bị deploy).

## 5. Thiết lập Dashboard KPI & Vòng lặp Phản hồi (Đã lồng ghép)

*   **Dashboard KPI:** Bắt đầu thiết lập từ Sprint 02, bổ sung metrics theo từng giai đoạn.
*   **Vòng lặp Phản hồi UX:** Sẽ được tích hợp vào các Sprint liên quan đến phát triển Frontend (Giai đoạn 1 hoặc sau đó) với các task cụ thể như: Setup Analytics/Hotjar, thực hiện Usability Testing.

## 6. Báo cáo Kế hoạch Phát triển Chi tiết (Tệp này)

Kế hoạch này cung cấp chi tiết cho 2 Sprint đầu tiên. Các Sprint tiếp theo của Giai đoạn 1 và các giai đoạn sau sẽ được lập kế hoạch chi tiết hơn khi dự án tiến triển, dựa trên kết quả và phản hồi từ các Sprint trước.

