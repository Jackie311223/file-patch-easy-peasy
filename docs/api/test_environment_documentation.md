# Tài liệu môi trường kiểm thử SQLite in-memory

## Giới thiệu

Tài liệu này mô tả việc cấu hình môi trường kiểm thử (test environment) cho dự án PMS Roomrise sử dụng SQLite in-memory thay vì PostgreSQL. Việc này giúp:

- Không cần phụ thuộc PostgreSQL thật trong quá trình kiểm thử
- Tăng tốc kiểm thử (Jest) trong môi trường CI/CD và máy local
- Dễ khởi động, dễ tái lập dữ liệu

## Cấu hình môi trường kiểm thử

### 1. Tệp .env.test

Tệp `.env.test` đã được tạo với nội dung sau:

```env
NODE_ENV=test
DATABASE_URL="file:./test.db?mode=memory&cache=shared"
JWT_SECRET="test-secret"
```

Trong đó:
- `NODE_ENV=test`: Xác định môi trường là kiểm thử
- `DATABASE_URL="file:./test.db?mode=memory&cache=shared"`: Cấu hình SQLite in-memory
- `JWT_SECRET="test-secret"`: Khóa bí mật cho JWT trong môi trường kiểm thử

### 2. Vấn đề cấu hình Prisma

Hiện tại, `schema.prisma` vẫn đang cấu hình cố định cho PostgreSQL:

```prisma
datasource db {
  provider = "postgresql" // Or your preferred database
  url      = env("DATABASE_URL")
}
```

Để hỗ trợ đầy đủ SQLite trong môi trường kiểm thử, cần cập nhật cấu hình này để hỗ trợ đa môi trường:

```prisma
datasource db {
  provider = env("DATABASE_PROVIDER") // "postgresql" hoặc "sqlite" tùy môi trường
  url      = env("DATABASE_URL")
}
```

Và thêm biến `DATABASE_PROVIDER` vào các tệp môi trường:
- `.env`: `DATABASE_PROVIDER="postgresql"`
- `.env.test`: `DATABASE_PROVIDER="sqlite"`

## Các sửa đổi mã nguồn

### 1. Sửa lỗi trường quan hệ trong Prisma

#### Vấn đề:
Khi sử dụng Prisma với SQLite, các trường quan hệ (propertyId, roomTypeId, userId, tenantId) không thể truyền trực tiếp dưới dạng string, mà phải sử dụng cú pháp `connect`.

#### Giải pháp:
Trong `bookings.service.ts`, đã thay đổi cách truyền các trường quan hệ:

```typescript
// Trước khi sửa
return this.prisma.booking.create({
  data: {
    ...createDto,
    userId: user.id,
    tenantId: user.tenantId,
    // ...
  },
});

// Sau khi sửa
const { propertyId, roomTypeId, ...restOfCreateDto } = createDto;
return this.prisma.booking.create({
  data: {
    ...restOfCreateDto,
    // ...
    property: {
      connect: { id: propertyId }
    },
    roomType: {
      connect: { id: roomTypeId }
    },
    user: {
      connect: { id: user.id }
    },
    tenant: {
      connect: { id: user.tenantId }
    }
  },
});
```

### 2. Thêm trường bắt buộc netRevenue

#### Vấn đề:
Schema Prisma yêu cầu trường `netRevenue` là bắt buộc trong `BookingCreateInput`, nhưng chưa được tính toán và truyền vào khi tạo booking.

#### Giải pháp:
Đã thêm logic tính toán `netRevenue` (totalAmount - commission) khi tạo booking mới:

```typescript
// Calculate netRevenue (required field in schema)
const totalAmount = new Prisma.Decimal(createDto.totalAmount);
const commission = createDto.commission 
  ? new Prisma.Decimal(createDto.commission) 
  : new Prisma.Decimal(0);
const netRevenue = totalAmount.minus(commission);

return this.prisma.booking.create({
  data: {
    // ...
    totalAmount,
    commission: createDto.commission ? commission : undefined,
    netRevenue, // Add required netRevenue field
    // ...
  },
});
```

### 3. Sửa lỗi kiểu dữ liệu Decimal

#### Vấn đề:
Khi sử dụng Prisma với SQLite, các trường số tiền phải sử dụng `Prisma.Decimal` thay vì `parseFloat` để tránh lỗi kiểu dữ liệu.

#### Giải pháp:
Đã chuyển đổi tất cả các trường số tiền từ `parseFloat` sang `Prisma.Decimal`:

```typescript
// Trước khi sửa
private calculateOutstandingBalance(totalAmount: string | number, amountPaid: string | number): number {
  return parseFloat(totalAmount.toString()) - parseFloat(amountPaid.toString());
}

// Sau khi sửa
private calculateOutstandingBalance(totalAmount: string | number | Prisma.Decimal, amountPaid: string | number | Prisma.Decimal): Prisma.Decimal {
  const total = typeof totalAmount === 'object' ? totalAmount : new Prisma.Decimal(totalAmount.toString());
  const paid = typeof amountPaid === 'object' ? amountPaid : new Prisma.Decimal(amountPaid.toString());
  return total.minus(paid);
}
```

### 4. Loại bỏ kiểm tra không cần thiết

#### Vấn đề:
Các trường `userId` và `tenantId` không tồn tại trong `UpdateBookingDto` nhưng lại được kiểm tra trong service, gây lỗi biên dịch.

#### Giải pháp:
Đã loại bỏ kiểm tra không cần thiết:

```typescript
// Trước khi sửa
if (updateDto.userId) {
  updateData.user = {
    connect: { id: updateDto.userId }
  };
}

if (updateDto.tenantId) {
  updateData.tenant = {
    connect: { id: updateDto.tenantId }
  };
}

// Sau khi sửa
// Note: We don't update user or tenant relations in update method
// as these fields are not part of UpdateBookingDto
```

## Kết quả kiểm thử

Sau khi thực hiện các sửa đổi trên, kết quả kiểm thử cho thấy tiến triển tích cực:

✅ **Đã thành công**:
- Các bài kiểm thử booking controller đã chạy thành công
- Các bài kiểm thử calendar controller đã chạy thành công

❌ **Vẫn còn lỗi**:
- Một số bài kiểm thử khác vẫn thất bại do vấn đề cấu hình Prisma với SQLite
- Lỗi hiện tại là do schema.prisma yêu cầu DATABASE_URL dạng postgresql://, trong khi chúng ta đang cấu hình SQLite

## Khuyến nghị tiếp theo

1. **Cập nhật schema.prisma**:
   - Thay đổi provider để hỗ trợ cả PostgreSQL và SQLite tùy theo môi trường
   - Thêm biến DATABASE_PROVIDER vào các tệp môi trường

2. **Kiểm tra các model khác**:
   - Áp dụng các sửa đổi tương tự cho các model khác (Payment, Invoice, etc.)
   - Đảm bảo tất cả các trường quan hệ đều sử dụng cú pháp connect
   - Đảm bảo tất cả các trường số tiền đều sử dụng Prisma.Decimal

3. **Cập nhật các bài kiểm thử**:
   - Đảm bảo các bài kiểm thử mock đúng cấu trúc dữ liệu theo schema hiện tại
   - Cập nhật các assertion để phù hợp với kiểu dữ liệu Decimal
