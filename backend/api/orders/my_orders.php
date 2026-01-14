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

// Lấy danh sách đơn hàng của user này
$query = "SELECT id, total_amount, status, shipping_address, phone, created_at 
          FROM orders 
          WHERE user_id = :user_id 
          ORDER BY created_at DESC";

$stmt = $db->prepare($query);
$stmt->bindParam(':user_id', $user_id);
$stmt->execute();

$orders_arr = array();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $order_id = $row['id'];
    
    // Lấy chi tiết món ăn cho từng đơn hàng
    $item_query = "SELECT oi.quantity, oi.price, p.name as product_name, p.image_url 
                   FROM order_items oi
                   LEFT JOIN products p ON oi.product_id = p.id
                   WHERE oi.order_id = :order_id";
    $item_stmt = $db->prepare($item_query);
    $item_stmt->bindParam(':order_id', $order_id);
    $item_stmt->execute();

    $items = array();
    while ($item_row = $item_stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($items, $item_row);
    }

    $row['items'] = $items;
    array_push($orders_arr, $row);
}

http_response_code(200);
echo json_encode(array("success" => true, "orders" => $orders_arr));
?>
