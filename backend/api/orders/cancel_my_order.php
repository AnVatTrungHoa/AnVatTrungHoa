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

// Lấy dữ liệu từ request body
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id)) {
    $order_id = htmlspecialchars(strip_tags($data->id));

    // Kiểm tra xem đơn hàng có thuộc về user và đang ở trạng thái 'pending' không
    $check_query = "SELECT status FROM orders WHERE id = :id AND user_id = :user_id LIMIT 1";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':id', $order_id);
    $check_stmt->bindParam(':user_id', $user_id);
    $check_stmt->execute();

    if($check_stmt->rowCount() > 0) {
        $order = $check_stmt->fetch(PDO::FETCH_ASSOC);
        
        if($order['status'] === 'pending') {
            // Cập nhật trạng thái thành 'cancelled'
            $update_query = "UPDATE orders SET status = 'cancelled' WHERE id = :id";
            $update_stmt = $db->prepare($update_query);
            $update_stmt->bindParam(':id', $order_id);

            if($update_stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("success" => true, "message" => "Hủy đơn hàng thành công."));
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Không thể hủy đơn hàng lúc này."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Đơn hàng đã được xử lý và không thể hủy."));
        }
    } else {
        http_response_code(404);
        echo json_encode(array("success" => false, "message" => "Không tìm thấy đơn hàng."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Mã đơn hàng không được để trống."));
}
?>
