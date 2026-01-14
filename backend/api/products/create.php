<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->connect();

// Auth Check Helper
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

    $query = "SELECT u.role, s.expires_at FROM sessions s 
              JOIN users u ON s.user_id = u.id 
              WHERE s.token = :token LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $token);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (strtotime($row['expires_at']) > time() && $row['role'] === 'admin') {
            return true;
        }
    }
    return false;
}

// Check Permission
if (!checkAdminAuth($db)) {
    http_response_code(403);
    echo json_encode(array("success" => false, "message" => "Unauthorized. Admin access required."));
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if(
    !empty($data->name) &&
    !empty($data->price)
) {
    $query = "INSERT INTO products (name, description, price, sale_price, category, image_url, stock, badge) VALUES (:name, :description, :price, :sale_price, :category, :image_url, :stock, :badge)";
    $stmt = $db->prepare($query);

    // Sanitize and Bind
    $name = htmlspecialchars(strip_tags($data->name));
    $description = !empty($data->description) ? htmlspecialchars(strip_tags($data->description)) : '';
    $price = htmlspecialchars(strip_tags($data->price));
    $sale_price = !empty($data->sale_price) ? htmlspecialchars(strip_tags($data->sale_price)) : null;
    $category = !empty($data->category) ? htmlspecialchars(strip_tags($data->category)) : '';
    $image_url = !empty($data->image_url) ? htmlspecialchars(strip_tags($data->image_url)) : '';
    $stock = !empty($data->stock) ? htmlspecialchars(strip_tags($data->stock)) : 0;
    $badge = !empty($data->badge) ? htmlspecialchars(strip_tags($data->badge)) : null;

    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':price', $price);
    $stmt->bindParam(':sale_price', $sale_price);
    $stmt->bindParam(':category', $category);
    $stmt->bindParam(':image_url', $image_url);
    $stmt->bindParam(':stock', $stock);
    $stmt->bindParam(':badge', $badge);

    if($stmt->execute()) {
        http_response_code(201);
        echo json_encode(array("success" => true, "message" => "Product created."));
    } else {
        http_response_code(503);
        echo json_encode(array("success" => false, "message" => "Unable to create product."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Incomplete data."));
}
?>
