# Hướng dẫn Deploy Frontend lên Vercel từ GitHub Actions CI/CD

Bạn đã có file workflow `ci-frontend.yml` với các bước kiểm tra, build frontend. Để tự động deploy lên Vercel sau khi CI thành công, hãy làm theo các bước sau:

## 1. Liên kết Repository GitHub với Dự án Vercel

- Truy cập tài khoản Vercel của bạn.
- Tạo một dự án mới (New Project).
- Chọn "Import Git Repository" và chọn repository GitHub chứa dự án PMS Roomrise của bạn.
- Vercel sẽ tự động phát hiện cấu hình Vite. Bạn cần **chỉ định Root Directory** là `packages/frontend` trong phần cấu hình dự án trên Vercel.
- Hoàn tất việc tạo dự án.

## 2. Lấy các Thông tin Bí mật (Secrets) từ Vercel

Bạn cần 3 thông tin sau từ Vercel để cấu hình trong GitHub Actions:

- **`VERCEL_ORG_ID`**: ID của tổ chức (hoặc tài khoản cá nhân) của bạn trên Vercel.
    - Tìm thấy tại: Vercel Dashboard > Settings (của tài khoản/tổ chức) > General > **Your ID**.
- **`VERCEL_PROJECT_ID`**: ID của dự án frontend bạn vừa tạo/liên kết trên Vercel.
    - Tìm thấy tại: Vercel Dashboard > Chọn dự án frontend > Settings > General > **Project ID**.
- **`VERCEL_TOKEN`**: Mã token để GitHub Actions có quyền deploy lên Vercel.
    - Tạo tại: Vercel Dashboard > Settings (của tài khoản/tổ chức) > Tokens > Create.
    - Đặt tên cho token (ví dụ: `GITHUB_ACTIONS_PMS`) và **sao chép giá trị token ngay lập tức** vì nó sẽ không hiển thị lại.

## 3. Cấu hình Secrets trong GitHub Actions

- Truy cập repository GitHub của bạn.
- Vào **Settings** > **Secrets and variables** > **Actions**.
- Nhấn **New repository secret** và tạo 3 secrets sau với các giá trị tương ứng bạn đã lấy từ Vercel:
    - `VERCEL_ORG_ID`
    - `VERCEL_PROJECT_ID`
    - `VERCEL_TOKEN`

## 4. Kích hoạt và Cấu hình Bước Deploy trong Workflow

- Mở file `.github/workflows/ci-frontend.yml`.
- Tìm đến phần `--- Optional: Deployment to Vercel ---`.
- **Bỏ comment** (xóa dấu `#` ở đầu dòng) cho các bước `Deploy to Vercel Preview` và/hoặc `Deploy to Vercel Production` tùy theo nhu cầu của bạn:
    - **Deploy Preview**: Tự động tạo một bản xem trước cho mỗi Pull Request. Rất hữu ích để review thay đổi trước khi merge.
    - **Deploy Production**: Tự động deploy phiên bản mới nhất lên production khi có push code vào nhánh `main` (hoặc nhánh bạn cấu hình).

- **Kiểm tra lại cấu hình**: Đảm bảo các tham số trong các bước deploy là chính xác:
    - `vercel-token: ${{ secrets.VERCEL_TOKEN }}`
    - `vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}`
    - `vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}`
    - `vercel-project-path: 'packages/frontend'` (Đảm bảo đường dẫn đúng)
    - `scope: ${{ secrets.VERCEL_ORG_ID }}`
    - `prod: true` (Chỉ có ở bước deploy production)

**Lưu ý về Action sử dụng:**

- Workflow mẫu đang sử dụng `amondnet/vercel-action@v25`. Đây là một action phổ biến. Bạn cũng có thể tham khảo và sử dụng action chính thức từ Vercel nếu muốn (`vercel/vercel-action`).
- **Cách khác (sử dụng Vercel CLI)**: Như gợi ý của bạn, bạn cũng có thể thay thế các bước sử dụng action bằng cách chạy trực tiếp Vercel CLI:
  ```yaml
  - name: Deploy to Vercel Production (CLI)
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    run: |
      npm install --global vercel@latest
      vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
    working-directory: ./packages/frontend
    env:
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  ```
  Cách này cho phép kiểm soát chi tiết hơn nhưng cần cài đặt Vercel CLI trong workflow.

## 5. Commit và Push

- Commit các thay đổi vào file `ci-frontend.yml`.
- Push code lên GitHub.
- GitHub Actions sẽ tự động chạy workflow. Nếu bạn đã kích hoạt các bước deploy và cấu hình secrets đúng, Vercel sẽ tự động deploy frontend của bạn.

Bây giờ, bạn đã có một quy trình CI/CD hoàn chỉnh cho frontend, tự động kiểm tra, build và deploy lên Vercel!
