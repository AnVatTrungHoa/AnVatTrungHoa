<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->connect();

// Lấy token từ header
$headers = null;
if (isset($_SERVER['Authorization'])) $headers = trim($_SERVER["Authorization"]);
else if (isset($_SERVER['HTTP_AUTHORIZATION'])) $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
elseif (function_exists('apache_request_headers')) {
    $requestHeaders = apache_request_headers();
    $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
    if (isset($requestHeaders['Authorization'])) $headers = trim($requestHeaders['Authorization']);
}

$token = null;
if (!empty($headers)) {
    if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) $token = $matches[1];
}

if (!$token) {
    http_response_code(401);
    echo json_encode(array("success" => false, "message" => "Vui lòng đăng nhập."));
    exit();
}

// Kiểm tra token và lấy user_id
$query = "SELECT user_id, expires_at FROM sessions WHERE token = :token LIMIT 1";
$stmt = $db->prepare($query);
$stmt->bindParam(':token', $token);
$stmt->execute();

if ($stmt->rowCount() == 0) {
    http_response_code(401);
    echo json_encode(array("success" => false, "message" => "Phiên làm việc không hợp lệ."));
    exit();
}

$session = $stmt->fetch(PDO::FETCH_ASSOC);
if (strtotime($session['expires_at']) < time()) {
    http_response_code(401);
    echo json_encode(array("success" => false, "message" => "Phiên làm việc đã hết hạn."));
    exit();
}

$user_id = $session['user_id'];

// Lấy dữ liệu từ client
$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->full_name) || !isset($data->phone) || !isset($data->email)) {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Dữ liệu không đầy đủ."));
    exit();
}

// Cập nhật thông tin (Cho phép cập nhật Full Name, Phone và Email)
$query = "UPDATE users SET full_name = :full_name, phone = :phone, email = :email WHERE id = :id";
$stmt = $db->prepare($query);
$stmt->bindParam(':full_name', $data->full_name);
$stmt->bindParam(':phone', $data->phone);
$stmt->bindParam(':email', $data->email);
$stmt->bindParam(':id', $user_id);

if ($stmt->execute()) {
    http_response_code(200);
    echo json_encode(array("success" => true, "message" => "Cập nhật hồ sơ thành công."));
} else {
    http_response_code(500);
    echo json_encode(array("success" => false, "message" => "Lỗi khi cập nhật hồ sơ."));
}
?>
