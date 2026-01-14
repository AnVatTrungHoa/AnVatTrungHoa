<?php
// backend/api/products/chitiet.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// 1. Gọi file database (Chứa class Database của bạn)
include_once '../../config/database.php';

// 2. Khởi tạo kết nối theo kiểu Class (Khớp với file database.php)
$database = new Database();
$conn = $database->connect();

// Kiểm tra kết nối
if ($conn == null) {
    die(json_encode(["message" => "Kết nối Database thất bại"]));
}

if (isset($_GET['id'])) {
    $id = $_GET['id'];

    // 3. Dùng câu lệnh kiểu PDO (Prepare Statement - An toàn hơn)
    $query = "SELECT * FROM products WHERE id = :id LIMIT 0,1";
    $stmt = $conn->prepare($query);

    // Gán giá trị ID vào câu lệnh (tránh hack SQL Injection)
    $stmt->bindParam(':id', $id);
    
    // Thực thi
    $stmt->execute();

    // Lấy dữ liệu ra
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        // Có dữ liệu -> Trả về JSON
        // Chuyển các số thành dạng số (nếu cần thiết, tùy chọn)
        $row['price'] = (int)$row['price'];
        if(isset($row['sale_price'])) $row['sale_price'] = (int)$row['sale_price'];
        
        echo json_encode($row);
    } else {
        echo json_encode(["message" => "Không tìm thấy sản phẩm"]);
    }
} else {
    echo json_encode(["message" => "Thiếu ID"]);
}
?>