# Sơ đồ Cấu trúc Dự án PMS Roomrise

Dưới đây là sơ đồ cấu trúc thư mục và các thành phần chính của dự án PMS Roomrise, thể hiện sự phân chia giữa backend và frontend, cùng các module chức năng cốt lõi.

```plaintext
/home/ubuntu/pms_project/
├── pms_backend/
│   ├── prisma/                   # Cấu hình Prisma ORM
│   │   ├── schema.prisma         # Định nghĩa schema database
│   │   ├── migrations/           # Lịch sử migration database
│   │   └── seed.ts               # Script tạo dữ liệu mẫu
│   ├── src/                      # Mã nguồn backend (NestJS)
│   │   ├── app.module.ts         # Module gốc của ứng dụng
│   │   ├── main.ts               # Điểm khởi chạy ứng dụng
│   │   ├── auth/                 # Module xác thực & phân quyền (JWT, Guards, Roles)
│   │   ├── booking/              # Module quản lý đặt phòng
│   │   ├── calendar/             # Module quản lý lịch và phòng
│   │   ├── invoices/             # Module quản lý hóa đơn
│   │   ├── messages/             # Module quản lý tin nhắn nội bộ
│   │   ├── payments/             # Module quản lý thanh toán
│   │   ├── prisma/               # Module dịch vụ Prisma
│   │   ├── properties/           # Module quản lý cơ sở (properties)
│   │   ├── reports/              # Module quản lý báo cáo
│   │   ├── rooms/                # Module quản lý phòng
│   │   ├── room_types/           # Module quản lý loại phòng
│   │   ├── users/                # Module quản lý người dùng
│   │   └── ...                   # Các module và thành phần khác
│   ├── test/                     # Test backend (Jest + Supertest)
│   │   ├── helpers/              # Các hàm hỗ trợ test (auth, seed, reset)
│   │   ├── *.spec.ts             # Các file test cho từng module
│   ├── package.json              # Quản lý dependency backend
│   ├── tsconfig.json             # Cấu hình TypeScript
│   └── jest.config.js            # Cấu hình Jest
│
├── frontend/                   # Mã nguồn frontend (React + Vite + TypeScript)
│   ├── public/                   # Tài nguyên tĩnh
│   ├── src/
│   │   ├── App.tsx               # Component gốc của ứng dụng frontend
│   │   ├── main.tsx              # Điểm khởi chạy ứng dụng React
│   │   ├── index.css             # CSS toàn cục (Tailwind directives)
│   │   ├── api/                  # Các hàm gọi API backend (axios)
│   │   ├── assets/               # Hình ảnh, logo...
│   │   ├── components/           # Các component dùng chung (layout, common...)
│   │   ├── constants/            # Các hằng số (UI states, routes...)
│   │   ├── contexts/             # React Context (Auth, Theme, Filters...)
│   │   ├── hooks/                # Custom React Hooks
│   │   ├── pages/                # Các trang chính của ứng dụng
│   │   │   ├── Auth/
│   │   │   ├── Bookings/
│   │   │   ├── Calendar/
│   │   │   ├── Dashboard/
│   │   │   ├── Inbox/            # Trang tin nhắn
│   │   │   ├── Invoices/
│   │   │   ├── Payments/
│   │   │   ├── Properties/
│   │   │   ├── Reports/
│   │   │   ├── RoomTypes/
│   │   │   └── Settings/
│   │   ├── providers/            # Các context providers tổng hợp
│   │   ├── theme/                # Quản lý theme (dark mode, multi-tenant)
│   │   ├── types/                # Định nghĩa các kiểu dữ liệu TypeScript
│   │   ├── ui/                   # Thư viện component UI tái sử dụng (Modal, Toast, Form...)
│   │   ├── utils/                # Các hàm tiện ích (lazy loading, memoization...)
│   │   └── test/                 # Các hàm hỗ trợ test UI (RTL)
│   ├── cypress/                  # Test E2E (Cypress)
│   ├── package.json              # Quản lý dependency frontend
│   ├── vite.config.ts            # Cấu hình Vite
│   ├── tailwind.config.js        # Cấu hình Tailwind CSS
│   ├── jest.config.cjs           # Cấu hình Jest cho UI tests
│   └── tsconfig.json             # Cấu hình TypeScript
│
├── *.md                        # Các file tài liệu, báo cáo, hướng dẫn ở thư mục gốc
├── project_files.list          # Danh sách file dự án (đã lọc)
└── documentation_files.list    # Danh sách file tài liệu (.md)
```
