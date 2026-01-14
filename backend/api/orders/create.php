<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->connect();

// Lấy dữ liệu từ client
$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->items) || empty($data->items) || !isset($data->total)) {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Dữ liệu đơn hàng không hợp lệ."));
    exit();
}

// Lấy thông tin khách ghi (có thể từ token hoặc form)
$headers = null;
if (isset($_SERVER['Authorization'])) $headers = trim($_SERVER["Authorization"]);
else if (isset($_SERVER['HTTP_AUTHORIZATION'])) $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
elseif (function_exists('apache_request_headers')) {
    $requestHeaders = apache_request_headers();
    $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
    if (isset($requestHeaders['Authorization'])) $headers = trim($requestHeaders['Authorization']);
}

$user_id = null;
if (!empty($headers)) {
    if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        $token = $matches[1];
        $q = "SELECT user_id FROM sessions WHERE token = :token AND expires_at > NOW() LIMIT 1";
        $s = $db->prepare($q);
        $s->bindParam(':token', $token);
        $s->execute();
        if ($s->rowCount() > 0) {
            $user_id = $s->fetch(PDO::FETCH_ASSOC)['user_id'];
        }
    }
}

try {
    // Bắt đầu Transaction
    $db->beginTransaction();

    // 1. Chèn vào bảng orders
    $query = "INSERT INTO orders (user_id, total_amount, status, shipping_address, phone, created_at) 
              VALUES (:user_id, :total_amount, 'pending', :address, :phone, NOW())";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':total_amount', $data->total);
    $stmt->bindParam(':address', $data->shipping_address);
    $stmt->bindParam(':phone', $data->phone);
    
    if (!$stmt->execute()) {
        throw new Exception("Lỗi khi tạo đơn hàng.");
    }
    
    $order_id = $db->lastInsertId();

    // 2. Chèn vào bảng order_items và cập nhật tồn kho
    $item_query = "INSERT INTO order_items (order_id, product_id, quantity, price) 
                   VALUES (:order_id, :product_id, :quantity, :price)";
    $item_stmt = $db->prepare($item_query);

    $stock_query = "UPDATE products SET stock = stock - :qty WHERE id = :id AND stock >= :qty";
    $stock_stmt = $db->prepare($stock_query);

    foreach ($data->items as $item) {
        // Chèn item
        $item_stmt->bindParam(':order_id', $order_id);
        $item_stmt->bindParam(':product_id', $item->id);
        $item_stmt->bindParam(':quantity', $item->quantity);
        $item_stmt->bindParam(':price', $item->price);
        
        if (!$item_stmt->execute()) {
            throw new Exception("Lỗi khi lưu chi tiết đơn hàng cho mặt hàng ID: " . $item->id);
        }

        // Cập nhật tồn kho
        $stock_stmt->bindParam(':qty', $item->quantity);
        $stock_stmt->bindParam(':id', $item->id);
        
        if (!$stock_stmt->execute()) {
             throw new Exception("Lỗi khi cập nhật tồn kho cho mặt hàng ID: " . $item->id);
        }
        
        if ($stock_stmt->rowCount() == 0) {
            throw new Exception("Sản phẩm ID " . $item->id . " đã hết hàng hoặc không đủ số lượng.");
        }
    }

    // Cam kết (Commit) các thay đổi
    $db->commit();

    http_response_code(201);
    echo json_encode(array(
        "success" => true, 
        "message" => "Đơn hàng của bạn đã được tiếp nhận!",
        "order_id" => $order_id
    ));

} catch (Exception $e) {
    // Hoàn tác (Rollback) nếu có lỗi
    $db->rollBack();
    http_response_code(500);
    echo json_encode(array("success" => false, "message" => $e->getMessage()));
}
?>
