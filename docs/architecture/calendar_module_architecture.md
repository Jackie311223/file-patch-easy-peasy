# Kiến trúc Module CalendarPage - PMS Roomrise

## 1. Tổng quan

Module CalendarPage là một giao diện lịch đặt phòng trực quan, hiển thị các booking theo trục thời gian, hỗ trợ kéo thả để thay đổi ngày hoặc phòng, và cung cấp các tính năng tương tác nâng cao.

## 2. Hiện trạng

### Frontend:
- Đã có cấu trúc thư mục `/pages/Calendar` với file `CalendarPage.tsx` (hiện chỉ là placeholder)
- Đã có cấu trúc thư mục React chuẩn với components, hooks, contexts, API
- Chưa có các component chuyên biệt cho lịch (TimelineGrid, BookingBlock, BookingModal)

### Backend:
- Đã có module booking, payment, property
- Chưa có API chuyên biệt cho lịch:
  - `GET /calendar?propertyId=&startDate=&endDate=`
  - `PATCH /bookings/:id` (cập nhật check-in/check-out khi kéo thả)
  - `POST /bookings/assign-room` (cập nhật khi đổi phòng)

## 3. Kế hoạch phát triển

### 3.1 Backend API (Cần phát triển mới)

#### 3.1.1 GET /calendar
- **Mục đích**: Lấy dữ liệu lịch đặt phòng theo khoảng thời gian và property
- **Query params**: 
  - `propertyId`: ID của property (bắt buộc)
  - `startDate`: Ngày bắt đầu (YYYY-MM-DD)
  - `endDate`: Ngày kết thúc (YYYY-MM-DD)
  - `bookingStatus`: Lọc theo trạng thái (optional)
  - `roomTypeId`: Lọc theo loại phòng (optional)
- **Response**: Danh sách bookings và rooms, được cấu trúc để dễ dàng hiển thị trên lịch

#### 3.1.2 PATCH /bookings/:id
- **Mục đích**: Cập nhật ngày check-in/check-out khi kéo thả booking
- **Path param**: `id` - ID của booking
- **Request body**:
  - `checkIn`: Ngày check-in mới (YYYY-MM-DD)
  - `checkOut`: Ngày check-out mới (YYYY-MM-DD)
  - `nights`: Số đêm mới (tự động tính)
- **Response**: Booking đã cập nhật

#### 3.1.3 POST /bookings/assign-room
- **Mục đích**: Gán phòng mới cho booking khi kéo thả
- **Request body**:
  - `bookingId`: ID của booking
  - `roomId`: ID của phòng mới
- **Response**: Booking đã cập nhật với phòng mới

### 3.2 Frontend Components (Cần phát triển mới)

#### 3.2.1 CalendarPage
- Container chính cho toàn bộ trang lịch
- Quản lý state: khoảng thời gian hiển thị, property đang chọn, bộ lọc
- Xử lý fetch dữ liệu từ API

#### 3.2.2 TimelineHeader
- Hiển thị header với các ngày trong khoảng thời gian
- Đánh dấu ngày hiện tại, cuối tuần
- Nút điều hướng: tuần trước, tuần sau, tháng trước, tháng sau, về hôm nay

#### 3.2.3 TimelineGrid
- Grid chính hiển thị phòng theo hàng, ngày theo cột
- Xử lý scroll ngang/dọc
- Auto scroll đến ngày hiện tại khi load

#### 3.2.4 RoomRow
- Hiển thị thông tin phòng ở cột đầu tiên
- Container cho các booking block của phòng đó

#### 3.2.5 BookingBlock
- Hiển thị booking dưới dạng block ngang
- Màu sắc theo trạng thái
- Hiển thị thông tin cơ bản: tên khách, số đêm
- Xử lý sự kiện: click, hover, drag start

#### 3.2.6 BookingPopover
- Hiển thị khi hover vào booking block
- Hiển thị thông tin chi tiết: tên khách, check-in/out, trạng thái, phòng, số đêm, ghi chú

#### 3.2.7 BookingModal
- Hiển thị khi click vào booking block
- Form chỉnh sửa thông tin booking
- Nút hành động: cập nhật, hủy, check-in, check-out

#### 3.2.8 CalendarFilters
- Bộ lọc: property, trạng thái booking, loại phòng, phòng
- DateRangePicker để chọn khoảng thời gian hiển thị

### 3.3 Thư viện cần sử dụng

- **React DnD**: Xử lý kéo thả
- **date-fns**: Xử lý ngày tháng
- **react-datepicker**: Chọn khoảng thời gian
- **tailwindcss**: Styling
- **shadcn/ui**: UI components
- **react-query**: Quản lý data fetching và caching

## 4. Luồng tương tác người dùng

1. **Xem lịch**:
   - Người dùng truy cập trang Calendar
   - Hệ thống hiển thị lịch với các booking trong tuần hiện tại
   - Người dùng có thể scroll, lọc, chuyển đổi tuần/tháng

2. **Xem chi tiết booking**:
   - Hover vào booking block để xem thông tin nhanh
   - Click vào booking block để mở modal chi tiết

3. **Thay đổi ngày booking**:
   - Kéo booking block sang trái/phải để thay đổi ngày check-in
   - Kéo cạnh phải của booking block để thay đổi ngày check-out
   - Hệ thống gửi request PATCH /bookings/:id để cập nhật

4. **Thay đổi phòng booking**:
   - Kéo booking block lên/xuống để chuyển sang phòng khác
   - Hệ thống gửi request POST /bookings/assign-room để cập nhật

5. **Lọc và tìm kiếm**:
   - Sử dụng bộ lọc để hiển thị booking theo property, trạng thái, loại phòng
   - Chọn khoảng thời gian để xem lịch theo tuần/tháng cụ thể

## 5. Kết luận

Module CalendarPage yêu cầu phát triển mới cả phần backend API và frontend components. Cần ưu tiên phát triển các API backend trước để đảm bảo dữ liệu sẵn sàng cho frontend. Sau đó, phát triển các component React theo thứ tự từ container (CalendarPage) đến các thành phần con (TimelineGrid, BookingBlock), và cuối cùng là tích hợp tính năng kéo thả.
