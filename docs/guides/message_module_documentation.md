# Message Module - Tài liệu triển khai

## Tổng quan

Module Message đã được phát triển để hỗ trợ giao tiếp nội bộ trong hệ thống PMS Roomrise, cho phép gửi và nhận tin nhắn hệ thống (SYSTEM) và tin nhắn cá nhân (PRIVATE).

- **InboxPage**: Hiển thị danh sách tin nhắn với bộ lọc (loại tin nhắn, trạng thái đã đọc).
- **MessageCard**: Hiển thị thông tin tóm tắt của một tin nhắn trong danh sách.
- **MessageDetailDrawer**: Hiển thị nội dung đầy đủ của tin nhắn khi được chọn.
- **SendMessageModal**: Cho phép admin gửi tin nhắn hệ thống hoặc tin nhắn cá nhân.

## Cấu trúc Component

```
/pages/Inbox/
  ├── InboxPage.tsx                # Trang chính hiển thị danh sách tin nhắn
  ├── components/
  │   ├── MessageCard.tsx          # Card hiển thị thông tin tóm tắt tin nhắn
  │   ├── MessageDetailDrawer.tsx  # Drawer hiển thị nội dung đầy đủ tin nhắn
  │   └── SendMessageModal.tsx     # Modal gửi tin nhắn mới
```

## Tính năng chính

### 1. InboxPage

- Hiển thị danh sách tin nhắn với thông tin tóm tắt.
- Bộ lọc theo:
  - Loại tin nhắn (All/System/Private)
  - Trạng thái đã đọc (All/Unread/Read)
- Phân trang kết quả.
- Nút "Send Message" để mở modal gửi tin nhắn (hiển thị dựa trên quyền: SUPER_ADMIN, ADMIN).
- Xử lý trạng thái loading, error, empty.

### 2. MessageCard

- Hiển thị thông tin tóm tắt của một tin nhắn: người gửi, loại tin nhắn, thời gian, nội dung tóm tắt.
- Hiển thị trạng thái đã đọc/chưa đọc bằng các dấu hiệu trực quan (đậm, dấu chấm).
- Xử lý sự kiện click để mở tin nhắn chi tiết.

### 3. MessageDetailDrawer

- Hiển thị nội dung đầy đủ của tin nhắn được chọn.
- Tự động đánh dấu tin nhắn là đã đọc khi mở.
- Hiển thị thông tin người gửi, thời gian, và nội dung đầy đủ.

### 4. SendMessageModal

- Form gửi tin nhắn mới với các trường:
  - Loại tin nhắn (SYSTEM/PRIVATE)
  - Người nhận (chỉ hiển thị khi chọn PRIVATE)
  - Nội dung tin nhắn
- Validation form với react-hook-form và zod.
- Xử lý trạng thái loading, error khi gửi tin nhắn.

## Tích hợp API

Module sử dụng các API sau:

- `GET /messages`: Lấy danh sách tin nhắn với bộ lọc.
- `PATCH /messages/:id/read`: Đánh dấu tin nhắn đã đọc.
- `POST /messages`: Gửi tin nhắn mới.
- `GET /users`: Lấy danh sách người dùng (cho dropdown người nhận).

## Phân quyền

- **Xem tin nhắn**: Tất cả người dùng đã xác thực.
- **Gửi tin nhắn**: SUPER_ADMIN, ADMIN.
- **Đánh dấu đã đọc**: Người dùng là người nhận tin nhắn.

## Backend Implementation

### Prisma Schema

Cần bổ sung model `Message` trong schema.prisma:

```prisma
model Message {
  id          String      @id @default(uuid())
  tenantId    String
  senderId    String?
  recipientId String?
  messageType MessageType
  content     String      @db.Text
  isRead      Boolean     @default(false)
  createdAt   DateTime    @default(now())

  tenant      Tenant      @relation(fields: [tenantId], references: [id])
  sender      User?       @relation("SentMessages", fields: [senderId], references: [id])
  recipient   User?       @relation("ReceivedMessages", fields: [recipientId], references: [id])

  @@index([tenantId])
  @@index([recipientId])
}

enum MessageType {
  SYSTEM
  PRIVATE
}
```

### Backend Components

- **MessagesModule**: Module chính kết nối controller và service.
- **MessagesController**: Xử lý các endpoint API.
- **MessagesService**: Xử lý logic nghiệp vụ và tương tác với database.
- **DTOs**: CreateMessageDto, QueryMessagesDto.

## Kết luận

Module Message cung cấp các chức năng cần thiết để hỗ trợ giao tiếp nội bộ trong hệ thống PMS Roomrise, cho phép gửi và nhận tin nhắn hệ thống và tin nhắn cá nhân. Module này sẵn sàng để tích hợp vào hệ thống PMS Roomrise.
