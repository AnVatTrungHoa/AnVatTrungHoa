# Cấu Trúc Dự Án Website Bán Đồ Ăn Vặt Trung Hoa

## 1. Project Root

- **project-root/**: Thư mục gốc chứa toàn bộ mã nguồn frontend và backend.

## 2. Frontend (`/frontend`) - ReactJS

Thư mục này chứa mã nguồn giao diện người dùng (Client-side).

- **public/**: Chứa các file tĩnh (static assets) không qua xử lý của webpack/vite (ví dụ: index.html gốc).
  - `index.html`: File HTML chính của ứng dụng React.
- **src/**: Thư mục mã nguồn chính.
  - **components/**: Chứa các thành phần UI tái sử dụng.
    - **Auth/**: Components liên quan xác thực (Login, Register).
    - **User/**: Components dành cho người dùng thường (Header, Hero, ProductGrid, Footer...).
    - **Admin/**: Components dành cho trang quản trị (Dashboard, Sidebar...).
  - **pages/**: Các components đóng vai trò là "Trang" (Page), kết hợp các components nhỏ hơn (UserHomePage, AdminPage...).
  - **services/**: Chứa các file cấu hình gọi API (api.js, axios config).
  - **context/**: React Context API để quản lý state toàn cục (AuthContext cho đăng nhập).
  - **utils/**: Các hàm tiện ích chung (ProtectedRoute để bảo vệ route admin).
  - `App.jsx`: Component gốc, nơi cấu hình Routing.
  - `main.jsx`: Điểm khởi chạy của ứng dụng, render App vào DOM.

## 3. Backend (`/backend`) - PHP

Thư mục này chứa mã nguồn phía máy chủ (Server-side API).

- **config/**: Chứa cấu hình hệ thống.
  - `database.php`: Class kết nối CSDL MySQL.
- **api/**: Chứa các endpoints API mà frontend sẽ gọi.
  - **auth/**: API đăng nhập, đăng ký (`login.php`, `register.php`).
  - **products/**: API quản lý sản phẩm (CRUD).
  - **orders/**: API quản lý đơn hàng.
  - **users/**: API quản lý người dùng.
- **utils/**: Các tiện ích backend.
  - `cors.php`: Xử lý Headers để Frontend (port khác) gọi được API.
- **database/**: Các file liên quan CSDL.
  - `schema.sql`: Script SQL để tạo bảng và dữ liệu mẫu.

## Tóm tắt vai trò

- **Frontend** chịu trách nhiệm hiển thị giao diện và tương tác người dùng.
- **Backend** cung cấp dữ liệu JSON thông qua API và làm việc với Database.
- **Database** lưu trữ thông tin sản phẩm, đơn hàng, user.
