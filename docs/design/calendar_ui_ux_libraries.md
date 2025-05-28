# Thiết kế UI/UX và Lựa chọn Thư viện Frontend cho CalendarPage

## 1. Phân tích Yêu cầu UI/UX

Dựa trên tài liệu UI/UX design và yêu cầu từ người dùng, module CalendarPage cần đáp ứng các tiêu chí sau:

### 1.1. Yêu cầu Giao diện
- Hiển thị lịch đặt phòng theo trục thời gian (timeline)
- Mỗi hàng là 1 phòng, mỗi cột là 1 ngày
- Booking hiển thị dưới dạng block nằm ngang, kéo dài từ check-in đến check-out
- Màu sắc booking theo trạng thái (Pending, Confirmed, Cancelled)
- Hỗ trợ hover popover hiển thị chi tiết booking
- Hỗ trợ modal chỉnh sửa khi click vào booking
- Điều hướng theo tuần/tháng
- Responsive, tối ưu cho desktop và tablet

### 1.2. Yêu cầu Tương tác
- Kéo thả booking để thay đổi ngày check-in/check-out
- Kéo thả booking sang phòng khác
- Lọc theo property, trạng thái booking, loại phòng
- Auto-scroll đến ngày hiện tại
- Zoom in/out theo tuần/tháng

## 2. Design System

Theo tài liệu UI/UX design, chúng ta sẽ tuân thủ design system sau:

### 2.1. Màu sắc
- **Primary:** `#0D47A1` (Deep Blue)
- **Secondary:** `#607D8B` (Blue Grey)
- **Success:** `#2E7D32` (Green) - Cho booking đã xác nhận
- **Warning:** `#FF8F00` (Amber) - Cho booking đang chờ xác nhận
- **Error:** `#C62828` (Red) - Cho booking đã hủy
- **Background:** `#FFFFFF` (White) và `#F5F7FA` (Light Grey)
- **Text:** `#212121` (Near Black), `#616161` (Dark Grey), `#9E9E9E` (Medium Grey)

### 2.2. Typography
- Font Family: `Inter, sans-serif`
- Headings: H1 (32px), H2 (24px), H3 (20px), H4 (16px)
- Body: Large (16px), Medium (14px), Small (12px)

### 2.3. Spacing
- Base unit: 4px
- Padding/margin: 4px, 8px, 16px, 24px, 32px, 48px

## 3. Lựa chọn Thư viện Frontend

Dựa trên yêu cầu và phân tích, chúng ta cần các thư viện sau:

### 3.1. Thư viện Lịch và Timeline
**Lựa chọn: [React Big Calendar](https://github.com/jquense/react-big-calendar)**
- **Ưu điểm:**
  - Hỗ trợ nhiều chế độ xem (tháng, tuần, ngày, agenda)
  - Tùy biến cao, có thể điều chỉnh để hiển thị phòng theo hàng
  - Hỗ trợ sẵn các sự kiện kéo dài nhiều ngày
  - Cộng đồng lớn, nhiều tài liệu và ví dụ
  - Tương thích tốt với React 18+
- **Nhược điểm:**
  - Cần tùy biến nhiều để đạt được giao diện mong muốn
  - Không hỗ trợ sẵn kéo thả giữa các hàng

**Thay thế: [FullCalendar](https://fullcalendar.io/)**
- Hỗ trợ nhiều tính năng hơn nhưng có giấy phép thương mại cho một số tính năng nâng cao

### 3.2. Thư viện Kéo Thả
**Lựa chọn: [React DnD](https://react-dnd.github.io/react-dnd/)**
- **Ưu điểm:**
  - API linh hoạt, dễ tích hợp với các component khác
  - Hỗ trợ nhiều loại tương tác kéo thả
  - Hiệu suất tốt, không gây lag khi kéo thả
  - Hỗ trợ touch events cho thiết bị di động
- **Nhược điểm:**
  - Đường cong học tập dốc hơn so với các thư viện khác

**Thay thế: [@dnd-kit/core](https://dndkit.com/)**
- API hiện đại hơn, nhưng cộng đồng nhỏ hơn

### 3.3. Thư viện UI Components
**Lựa chọn: [shadcn/ui](https://ui.shadcn.com/)**
- **Ưu điểm:**
  - Thiết kế tối giản, dễ tùy biến
  - Không phải là thư viện mà là collection của các component có thể copy vào dự án
  - Tương thích tốt với Tailwind CSS
  - Hỗ trợ dark mode
  - Các component như Dialog, Popover, Dropdown rất phù hợp cho CalendarPage
- **Nhược điểm:**
  - Cần thêm Radix UI làm dependency

### 3.4. Thư viện Xử lý Ngày Tháng
**Lựa chọn: [date-fns](https://date-fns.org/)**
- **Ưu điểm:**
  - API đơn giản, dễ sử dụng
  - Kích thước nhỏ, chỉ import các hàm cần thiết
  - Hỗ trợ tốt các thao tác với khoảng thời gian
  - Không thay đổi đối tượng Date gốc
- **Nhược điểm:**
  - Không hỗ trợ timezone tốt như Luxon

### 3.5. Thư viện Quản lý State và Data Fetching
**Lựa chọn: [React Query](https://tanstack.com/query/latest)**
- **Ưu điểm:**
  - Quản lý cache hiệu quả
  - Tự động refetch khi cần
  - Hỗ trợ optimistic updates (cập nhật UI trước khi API hoàn thành)
  - Dễ dàng xử lý loading và error states
- **Nhược điểm:**
  - Thêm bundle size

## 4. Cấu trúc Component

Dựa trên phân tích và lựa chọn thư viện, chúng ta sẽ xây dựng các component sau:

### 4.1. CalendarPage
- Container chính, quản lý state và data fetching
- Xử lý điều hướng và bộ lọc

### 4.2. CalendarHeader
- Hiển thị điều hướng ngày (tuần/tháng)
- Nút chuyển đổi chế độ xem
- DateRangePicker

### 4.3. CalendarFilters
- Dropdown chọn property
- Dropdown lọc trạng thái booking
- Dropdown lọc loại phòng

### 4.4. TimelineGrid
- Sử dụng React Big Calendar với chế độ tùy chỉnh
- Hiển thị phòng theo hàng, ngày theo cột
- Tích hợp React DnD cho kéo thả

### 4.5. BookingBlock
- Component hiển thị booking trong timeline
- Màu sắc theo trạng thái
- Hiển thị thông tin cơ bản (tên khách, số đêm)
- Xử lý sự kiện drag-and-drop

### 4.6. BookingPopover
- Hiển thị khi hover vào booking
- Sử dụng shadcn/ui Popover
- Hiển thị thông tin chi tiết booking

### 4.7. BookingModal
- Hiển thị khi click vào booking
- Sử dụng shadcn/ui Dialog
- Form chỉnh sửa booking

## 5. Responsive Design

Để đảm bảo trải nghiệm tốt trên cả desktop và tablet:

### 5.1. Desktop (>= 1024px)
- Hiển thị đầy đủ sidebar và timeline
- Hiển thị 7-14 ngày mặc định
- Hiển thị đầy đủ thông tin trong booking block

### 5.2. Tablet (768px - 1023px)
- Sidebar thu gọn (chỉ hiển thị icon)
- Hiển thị 5-7 ngày mặc định
- Thu gọn thông tin trong booking block

### 5.3. Mobile (< 768px)
- Chuyển sang chế độ xem agenda hoặc danh sách
- Tối ưu cho touch interaction

## 6. Kết luận

Với thiết kế UI/UX và lựa chọn thư viện trên, chúng ta có thể xây dựng một module CalendarPage chuyên nghiệp, trực quan và dễ sử dụng. Các thư viện được chọn đều có cộng đồng lớn, tài liệu đầy đủ và hiệu suất tốt, đảm bảo quá trình phát triển suôn sẻ và sản phẩm cuối cùng đáp ứng đầy đủ yêu cầu.

Bước tiếp theo sẽ là phát triển các component React theo thiết kế này, bắt đầu từ CalendarPage container và các component con.
