<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->connect();

// Lấy token từ header
$headers = getallheaders();
$token = null;

if (isset($headers['Authorization'])) {
    $auth = $headers['Authorization'];
    if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
        $token = $matches[1];
    }
}

if (empty($token)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Token không được cung cấp"
    ]);
    exit();
}

try {
    // Xóa token khỏi database
    $query = "DELETE FROM sessions WHERE token = :token";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $token);
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Đăng xuất thành công"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Đăng xuất thất bại"
        ]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Lỗi server: " . $e->getMessage()
    ]);
}
?>