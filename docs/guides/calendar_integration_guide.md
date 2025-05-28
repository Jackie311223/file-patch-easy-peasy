# Hướng dẫn tích hợp và sử dụng module CalendarPage

## 1. Tổng quan

Module CalendarPage là một thành phần quan trọng của hệ thống PMS Roomrise, cung cấp giao diện lịch đặt phòng trực quan với các tính năng:

- Hiển thị lịch đặt phòng theo trục thời gian (timeline)
- Mỗi hàng là 1 phòng, mỗi cột là 1 ngày
- Booking hiển thị dưới dạng block nằm ngang, kéo dài từ check-in đến check-out
- Kéo thả để thay đổi ngày check-in/check-out hoặc đổi phòng
- Hover popover hiển thị chi tiết booking
- Modal chỉnh sửa khi click vào booking
- Điều hướng theo tuần/tháng
- Responsive, tối ưu cho desktop và tablet

## 2. Cấu trúc thư mục

```
/src
  /pages
    /Calendar
      /components
        BookingBlock.tsx       # Component hiển thị booking trong timeline
        BookingModal.tsx       # Modal chỉnh sửa booking
        BookingPopover.tsx     # Popover hiển thị khi hover vào booking
        CalendarFilters.tsx    # Bộ lọc (property, status, room type)
        CalendarHeader.tsx     # Header với điều hướng ngày và chế độ xem
        TimelineGrid.tsx       # Grid chính hiển thị phòng và booking
      CalendarPage.css         # Styles cho CalendarPage
      CalendarPage.test.tsx    # Unit tests
      CalendarPage.tsx         # Component chính
  /api
    calendarApi.ts             # API calls cho calendar
  /utils
    calendarUtils.ts           # Utility functions
```

## 3. Các API Backend

Module CalendarPage sử dụng 3 API chính:

### 3.1. GET /calendar
- **Mục đích**: Lấy dữ liệu lịch đặt phòng theo khoảng thời gian
- **Tham số**:
  - `propertyId`: ID của property
  - `startDate`: Ngày bắt đầu (YYYY-MM-DD)
  - `endDate`: Ngày kết thúc (YYYY-MM-DD)
  - `bookingStatus` (optional): Mảng các trạng thái booking cần lọc
  - `roomTypeId` (optional): ID của loại phòng cần lọc
- **Phản hồi**: Danh sách phòng và booking trong khoảng thời gian

### 3.2. PATCH /bookings/:id
- **Mục đích**: Cập nhật ngày check-in/check-out khi kéo thả
- **Tham số**:
  - `id`: ID của booking
  - Body: `{ checkIn: "YYYY-MM-DD", checkOut: "YYYY-MM-DD" }`
- **Phản hồi**: Booking đã cập nhật

### 3.3. POST /bookings/assign-room
- **Mục đích**: Gán phòng mới khi kéo thả booking sang phòng khác
- **Tham số**:
  - Body: `{ bookingId: "...", roomId: "..." }`
- **Phản hồi**: Booking đã cập nhật

## 4. Thư viện sử dụng

Module CalendarPage sử dụng các thư viện sau:

- **React Big Calendar**: Hiển thị timeline
- **React DnD**: Kéo thả booking
- **date-fns**: Xử lý ngày tháng
- **@tanstack/react-query**: Data fetching và cache
- **shadcn/ui**: UI components (Dialog, Popover)

## 5. Hướng dẫn tích hợp

### 5.1. Cài đặt dependencies

```bash
npm install react-big-calendar react-dnd react-dnd-html5-backend react-dnd-touch-backend date-fns @tanstack/react-query
```

### 5.2. Thêm route trong React Router

```tsx
// src/App.tsx hoặc file routing
import CalendarPage from './pages/Calendar/CalendarPage';

// Trong routes configuration
{
  path: '/calendar',
  element: <CalendarPage />
}
```

### 5.3. Cấu hình API URL

Đảm bảo biến môi trường `REACT_APP_API_URL` được cấu hình đúng trong file `.env`:

```
REACT_APP_API_URL=http://your-api-url/api
```

## 6. Hướng dẫn sử dụng

### 6.1. Điều hướng ngày

- Sử dụng nút **Prev** và **Next** để di chuyển giữa các tuần/tháng
- Sử dụng nút **Today** để quay lại ngày hiện tại
- Chuyển đổi giữa chế độ xem **Week** và **Month**

### 6.2. Bộ lọc

- **Property**: Chọn property để hiển thị phòng và booking
- **Status**: Lọc booking theo trạng thái (Confirmed, Pending, Cancelled, ...)
- **Room Type**: Lọc phòng theo loại phòng

### 6.3. Tương tác với booking

- **Hover**: Hiển thị popover với thông tin chi tiết booking
- **Click**: Mở modal chỉnh sửa booking
- **Kéo ngang**: Thay đổi ngày check-in/check-out
- **Kéo dọc**: Chuyển booking sang phòng khác

## 7. Responsive Design

Module CalendarPage được thiết kế để hoạt động tốt trên nhiều kích thước màn hình:

- **Desktop (>= 1024px)**: Hiển thị đầy đủ sidebar và timeline
- **Tablet (768px - 1023px)**: Sidebar thu gọn, hiển thị ít ngày hơn
- **Mobile (< 768px)**: Chuyển sang chế độ xem tối giản

## 8. Kiểm thử

Chạy unit tests với lệnh:

```bash
npm test -- --testPathPattern=Calendar
```

## 9. Khắc phục sự cố

### 9.1. Booking không hiển thị

- Kiểm tra API URL trong `.env`
- Xác nhận rằng `propertyId` đã được chọn
- Kiểm tra console để xem lỗi API

### 9.2. Kéo thả không hoạt động

- Đảm bảo React DnD được cấu hình đúng
- Kiểm tra quyền người dùng (chỉ SUPER_ADMIN, ADMIN, PARTNER, MANAGER mới có quyền kéo thả)

### 9.3. Giao diện bị vỡ trên mobile

- Kiểm tra CSS media queries trong `CalendarPage.css`
- Đảm bảo các component responsive đã được cấu hình đúng

## 10. Phát triển tiếp theo

Các tính năng có thể phát triển trong tương lai:

- Chế độ xem theo ngày
- Tạo booking mới trực tiếp từ calendar
- Hiển thị tình trạng dọn phòng
- Tích hợp với hệ thống thông báo
- Xuất lịch ra PDF/Excel

---

Nếu có bất kỳ câu hỏi hoặc yêu cầu hỗ trợ nào, vui lòng liên hệ team phát triển qua email: support@roomrise.com
