<?php
include '../config/database.php';

$database = new Database();
$db = $database->connect();

if ($db === null) {
    die("Lỗi kết nối database");
}

echo "<h1>Đang thiết lập lại tài khoản mẫu...</h1>";

try {
    // 1. Reset Admin
    $admin_pass = password_hash('admin123', PASSWORD_BCRYPT);
    $stmt = $db->prepare("DELETE FROM users WHERE username = 'admin'");
    $stmt->execute();
    
    $query = "INSERT INTO users (username, email, password, full_name, role) VALUES ('admin', 'admin@shop.com', :pass, 'Administrator', 'admin')";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':pass', $admin_pass);
    if($stmt->execute()) {
        echo "<p>✅ Đã tạo user <b>admin</b> (pass: admin123)</p>";
    }

    // 2. Reset Customer
    $cust_pass = password_hash('123456', PASSWORD_BCRYPT);
    $stmt = $db->prepare("DELETE FROM users WHERE username = 'customer1'");
    $stmt->execute();

    $query = "INSERT INTO users (username, email, password, full_name, role) VALUES ('customer1', 'customer1@shop.com', :pass, 'Khách hàng 1', 'customer')";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':pass', $cust_pass);
    if($stmt->execute()) {
        echo "<p>✅ Đã tạo user <b>customer1</b> (pass: 123456)</p>";
    }

    echo "<h3>Hoàn tất! Bạn có thể quay lại trang đăng nhập.</h3>";
    echo "<a href='http://localhost:5173/login'>Về trang đăng nhập</a>";

} catch (PDOException $e) {
    echo "Lỗi: " . $e->getMessage();
}
?>
