# Chinese Snack Shop (Ăn Vặt Trung Hoa)

Dự án website bán đồ ăn vặt Trung Hoa Fullstack (ReactJS + PHP/MySQL).

## 🚀 Setup Instructions

### 1. Backend (PHP + MySQL)

**Yêu cầu:** XAMPP (hoặc WAMP/Apache+MySQL)

1.  **Cài đặt XAMPP**: Download và cài đặt XAMPP.
2.  **Khởi động Server**: Mở XAMPP Control Panel, Start **Apache** và **MySQL**.
3.  **Deploy Code**:
    - Tạo thư mục `chinese-snack-shop` trong `C:/xampp/htdocs/`.
    - Copy thư mục `backend` của dự án vào `C:/xampp/htdocs/chinese-snack-shop/`.
    - Đường dẫn đúng sẽ là: `C:/xampp/htdocs/chinese-snack-shop/backend/...`.
4.  **Cấu hình Database**:
    - Truy cập [phpMyAdmin](http://localhost/phpmyadmin/).
    - Tạo database mới tên: `chinese_snack_shop` (UTF-8mb4).
    - Import file SQL: Chọn database vừa tạo -> Import -> Chọn file `backend/database/schema.sql` -> Go.
5.  **Test API**:
    - Truy cập: `http://localhost/chinese-snack-shop/backend/api/products/get_all.php`.
    - Nếu thấy JSON trả về (dù rỗng), backend hoạt động tốt.

### 2. Frontend (ReactJS)

**Yêu cầu:** Node.js

1.  Mở terminal tại thư mục `frontend`.
2.  Cài đặt dependencies:
    ```bash
    npm install
    # Hoặc nếu chưa cài các lib cần thiết
    npm install axios react-router-dom
    ```
3.  Chạy ứng dụng:
    ```bash
    npm run dev
    # hoặc
    npm start
    ```
4.  Truy cập: `http://localhost:5173` (Vite mặc định) hoặc `http://localhost:3000`.

## 🧪 Test Flow

### Tài khoản Test

- **Admin**:
  - Username: `admin`
  - Password: `admin123` (Pass trong DB mẫu hash của '123456', bạn có thể cần update lại nếu muốn clean start, nhưng code register tạo user 'customer' mặc định).
  - _Lưu ý_: Để có quyền admin, bạn cần đổi `role` của user trong database thành `admin` thủ công hoặc qua phpMyAdmin sau khi đăng ký.

### Kịch bản Test

1.  **Khách hàng (Customer)**:
    - Vào trang chủ -> Xem danh sách sản phẩm.
    - Click "Đăng ký" -> Tạo tài khoản mới.
    - Đăng nhập -> Hệ thống chuyển về trang chủ, header hiển thị tên bạn.
2.  **Quản trị viên (Admin)**:
    - Đăng nhập bằng tài khoản có role `admin`.
    - Hệ thống chuyển hướng vào `/admin/dashboard`.
    - Thử thêm sản phẩm mới trong "Quản lý sản phẩm".
    - Thử đổi trạng thái đơn hàng trong "Quản lý đơn hàng".

## ⚠️ Common Issues & Fixes

1.  **Lỗi CORS (Network Error)**:

    - Đảm bảo file `backend/utils/cors.php` đã được include ở đầu các file API.
    - Frontend gọi đúng URL `http://localhost/chinese-snack-shop/...`.

2.  **404 Not Found (API)**:

    - Kiểm tra tên thư mục trong `htdocs`. Phải chính xác là `chinese-snack-shop`.

3.  **Database Connection Error**:
    - Kiểm tra file `backend/config/database.php`.
    - Username mặc định XAMPP là `root`, password để trống.
