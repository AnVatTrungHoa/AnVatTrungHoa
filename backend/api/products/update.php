<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->connect();

// Reuse Auth Check (Ideally move to utils)
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
    return false;
}

if (!checkAdminAuth($db)) {
    http_response_code(403);
    echo json_encode(array("success" => false, "message" => "Unauthorized."));
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id)) {
    // Dynamic Update Query
    $fields = [];
    $params = [];
    
    $params[':id'] = $data->id;

    if (isset($data->name)) { $fields[] = "name = :name"; $params[':name'] = $data->name; }
    if (isset($data->description)) { $fields[] = "description = :description"; $params[':description'] = $data->description; }
    if (isset($data->price)) { $fields[] = "price = :price"; $params[':price'] = $data->price; }
    if (isset($data->sale_price)) { $fields[] = "sale_price = :sale_price"; $params[':sale_price'] = $data->sale_price; }
    if (isset($data->category)) { $fields[] = "category = :category"; $params[':category'] = $data->category; }
    if (isset($data->image_url)) { $fields[] = "image_url = :image_url"; $params[':image_url'] = $data->image_url; }
    if (isset($data->stock)) { $fields[] = "stock = :stock"; $params[':stock'] = $data->stock; }
    if (isset($data->badge)) { $fields[] = "badge = :badge"; $params[':badge'] = $data->badge; }

    if (count($fields) > 0) {
        $query = "UPDATE products SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $db->prepare($query);
        
        if($stmt->execute($params)) {
             http_response_code(200);
             echo json_encode(array("success" => true, "message" => "Product updated."));
        } else {
             http_response_code(503);
             echo json_encode(array("success" => false, "message" => "Unable to update product."));
        }
    } else {
        http_response_code(200);
        echo json_encode(array("success" => true, "message" => "No changes provided."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "ID is required."));
}
?>
