# Lưu ý về tương thích Prisma giữa PostgreSQL và SQLite

Khi sử dụng hai tệp schema riêng biệt (`schema.postgres.prisma` và `schema.sqlite.prisma`) và chuyển đổi giữa môi trường PostgreSQL (production) và SQLite (test), cần lưu ý một số khác biệt về cách Prisma xử lý các kiểu dữ liệu và tính năng:

## 1. Kiểu Decimal

- **PostgreSQL**: Hỗ trợ kiểu `Decimal` gốc với độ chính xác cao, được định nghĩa qua `@db.Decimal(precision, scale)`.
- **SQLite**: **Không có kiểu Decimal gốc**. Prisma sẽ tự động ánh xạ kiểu `Decimal` trong schema thành kiểu `Float` (tương ứng với `REAL` trong SQLite).
- **Hệ quả**: Có thể xảy ra **mất mát độ chính xác** trong các phép tính số học với số thập phân khi chạy kiểm thử trên SQLite so với môi trường PostgreSQL. Các thuộc tính `@db.Decimal(p, s)` sẽ bị bỏ qua trong môi trường SQLite.
- **Fallback/Giải pháp**: Đối với mục đích kiểm thử, việc sử dụng `Float` thường chấp nhận được. Tuy nhiên, nếu cần độ chính xác tuyệt đối trong kiểm thử, cần cân nhắc:
    - Sử dụng PostgreSQL trong môi trường kiểm thử (có thể dùng Docker).
    - Thực hiện các kiểm thử liên quan đến tính toán tài chính phức tạp trực tiếp trên môi trường staging với PostgreSQL.

## 2. Kiểu Enum

- **PostgreSQL**: Hỗ trợ kiểu `Enum` gốc.
- **SQLite**: Prisma ánh xạ `Enum` thành kiểu `TEXT` kèm theo `CHECK` constraints để đảm bảo tính hợp lệ của giá trị.
- **Hệ quả**: Hoạt động tương đối tốt và tương thích trong hầu hết các trường hợp sử dụng thông thường. Không cần fallback cụ thể.

## 3. Quan hệ (Relations)

- **PostgreSQL & SQLite**: Prisma quản lý các quan hệ (one-to-one, one-to-many, many-to-many) tốt trên cả hai hệ quản trị cơ sở dữ liệu.
- **Hệ quả**: Không có khác biệt đáng kể hoặc yêu cầu fallback cho các quan hệ đã định nghĩa trong schema hiện tại.

## 4. Kiểu Json

- **PostgreSQL**: Hỗ trợ kiểu `JSON` và `JSONB` gốc với khả năng truy vấn mạnh mẽ.
- **SQLite**: Lưu trữ `Json` dưới dạng `TEXT`. Khả năng truy vấn và hiệu năng có thể kém hơn so với PostgreSQL.
- **Hệ quả**: Prisma trừu tượng hóa một phần sự khác biệt này. Tuy nhiên, các truy vấn phức tạp trên trường `Json` (ví dụ: `metadata` trong `AuditLog`) có thể hoạt động khác hoặc không được hỗ trợ đầy đủ trên SQLite.
- **Fallback/Giải pháp**: Hạn chế các kiểm thử phụ thuộc vào truy vấn phức tạp trên trường `Json` khi dùng SQLite. Kiểm thử các tính năng này trên môi trường staging.

## 5. Các khác biệt khác

- **Case Sensitivity**: PostgreSQL phân biệt chữ hoa chữ thường trong tên định danh (trừ khi đặt trong dấu ngoặc kép), SQLite thường không phân biệt.
- **Concurrency**: SQLite có khả năng xử lý đồng thời hạn chế hơn nhiều so với PostgreSQL. Điều này không ảnh hưởng đến kiểm thử đơn vị nhưng quan trọng cho môi trường production.
- **Full-Text Search**: PostgreSQL có hỗ trợ mạnh mẽ. SQLite có FTS extensions nhưng Prisma có thể không hỗ trợ đầy đủ hoặc yêu cầu cấu hình riêng.

## Kết luận

Việc sử dụng SQLite cho kiểm thử mang lại lợi ích về tốc độ và sự đơn giản. Tuy nhiên, cần nhận thức rõ về sự khác biệt, đặc biệt là với kiểu `Decimal` và `Json`, để tránh các kết quả kiểm thử không chính xác hoặc các lỗi không mong muốn khi triển khai lên môi trường PostgreSQL.
