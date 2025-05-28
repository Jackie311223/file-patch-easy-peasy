# Stack Công nghệ Dự án PMS Roomrise

Dự án PMS Roomrise được xây dựng trên một stack công nghệ hiện đại, tập trung vào hiệu năng, khả năng mở rộng và trải nghiệm người dùng tốt.

## Backend (NestJS)

- **Framework**: NestJS (với TypeScript) - Một framework Node.js mạnh mẽ để xây dựng các ứng dụng server-side hiệu quả và có khả năng mở rộng, dựa trên kiến trúc module.
- **Ngôn ngữ**: TypeScript - Tăng cường JavaScript với kiểu tĩnh, giúp phát triển ứng dụng lớn một cách an toàn và dễ bảo trì.
- **ORM (Object-Relational Mapping)**: Prisma - Một ORM thế hệ mới cho Node.js và TypeScript, cung cấp type-safety end-to-end và trải nghiệm developer tốt.
- **Database**: PostgreSQL - Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, đáng tin cậy và có nhiều tính năng.
- **Xác thực & Phân quyền**: JWT (JSON Web Tokens) với Passport.js - Triển khai xác thực stateless và bảo mật API.
- **API Specification**: Swagger (OpenAPI) - Tự động tạo tài liệu API tương tác từ code.
- **Testing**: Jest và Supertest - Framework kiểm thử phổ biến cho JavaScript/TypeScript và thư viện để test HTTP assertions.

## Frontend (React)

- **Framework/Library**: React (với TypeScript) - Thư viện JavaScript phổ biến để xây dựng giao diện người dùng tương tác và hiệu quả.
- **Build Tool**: Vite - Công cụ build frontend thế hệ mới, cung cấp trải nghiệm phát triển cực nhanh với Hot Module Replacement (HMR) và tối ưu hóa build.
- **Ngôn ngữ**: TypeScript.
- **Styling**: Tailwind CSS - Framework CSS utility-first để xây dựng giao diện tùy chỉnh nhanh chóng mà không cần rời khỏi HTML.
- **UI Components**:
    - shadcn/ui: Bộ sưu tập các component UI tái sử dụng, đẹp mắt, có thể tùy chỉnh, xây dựng trên Radix UI và Tailwind CSS.
    - Thư viện component nội bộ (`src/ui`): Các component UI tùy chỉnh (ModalBase, ToastProvider, FormWrapper, LoadingProvider...) được xây dựng để đáp ứng yêu cầu cụ thể của dự án và đảm bảo tính nhất quán.
- **State Management**:
    - React Context API: Sử dụng cho việc quản lý trạng thái toàn cục như theme, authentication, user preferences.
    - TanStack Query (React Query): Thư viện mạnh mẽ để quản lý trạng thái server (fetching, caching, synchronizing, updating data).
- **Routing**: React Router DOM - Thư viện định tuyến tiêu chuẩn cho các ứng dụng React.
- **Calendar UI**: React Big Calendar - Component lịch mạnh mẽ và linh hoạt.
- **Drag & Drop**: React DnD - Thư viện để xây dựng các giao diện kéo thả phức tạp.
- **Date Handling**: date-fns và Moment.js - Các thư viện tiện ích để làm việc với ngày tháng.
- **Notifications**: react-toastify (hoặc Sonner) - Hiển thị thông báo toast cho người dùng.
- **Testing**:
    - Jest (hoặc Vitest): Test runner.
    - React Testing Library (RTL): Thư viện kiểm thử component React tập trung vào hành vi người dùng.
    - Cypress: Framework kiểm thử End-to-End (E2E) cho các luồng tương tác phức tạp (ví dụ: kéo thả lịch).
    - jest-axe: Kiểm thử accessibility tự động.

## Công cụ & Quy trình

- **Package Managers**: npm - Quản lý các dependency cho cả backend và frontend.
- **Version Control**: Git - Hệ thống quản lý phiên bản phân tán.
- **Linting/Formatting**: ESLint, Prettier - Đảm bảo chất lượng code và tính nhất quán về định dạng.
