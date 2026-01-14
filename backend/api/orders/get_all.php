<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->connect();

function checkAdminAuth($db) {
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

    if (!$token) return false;
    $query = "SELECT u.role, s.expires_at FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = :token LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $token);
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (strtotime($row['expires_at']) > time() && $row['role'] === 'admin') return true;
    }
    return false; ('role' === 'admin');
}

if (!checkAdminAuth($db)) {
    http_response_code(403);
    echo json_encode(array("success" => false, "message" => "Unauthorized."));
    exit();
}

// Get Orders with User Info
$query = "SELECT o.id, o.user_id, o.total_amount, o.status, o.shipping_address, o.phone, o.created_at, 
          u.full_name as user_name, u.email as user_email
          FROM orders o
          LEFT JOIN users u ON o.user_id = u.id
          ORDER BY o.created_at DESC";

$stmt = $db->prepare($query);
$stmt->execute();

$orders_arr = array();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
    extract($row);

    // Get Order Items for this order
    $item_query = "SELECT oi.quantity, oi.price, p.name as product_name, p.image_url 
                   FROM order_items oi
                   LEFT JOIN products p ON oi.product_id = p.id
                   WHERE oi.order_id = :order_id";
    $item_stmt = $db->prepare($item_query);
    $item_stmt->bindParam(':order_id', $id);
    $item_stmt->execute();

    $items = array();
    while ($item_row = $item_stmt->fetch(PDO::FETCH_ASSOC)){
        array_push($items, $item_row);
    }

    $order_item = array(
        "id" => $id,
        "user_id" => $user_id,
        "user_name" => $user_name,
        "user_email" => $user_email,
        "total_amount" => $total_amount,
        "status" => $status,
        "shipping_address" => $shipping_address,
        "phone" => $phone,
        "created_at" => $created_at,
        "items" => $items
    );

    array_push($orders_arr, $order_item);
}

http_response_code(200);
echo json_encode($orders_arr);
?>
