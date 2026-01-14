<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->connect();

function checkAdminAuth($db) {
    // ... Copy of auth logic or simply include a util if one existed ...
    // For completeness in this file
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
    // Check if order items refer to this product (Optional: Soft delete preferred usually, but user asked for Delete or Soft Delete)
    // We will do Hard Delete as per 'DELETE from database' prompt first option, but typically integrity checks prevent this if ordered.
    // Let's implement Hard Delete.
    
    $query = "DELETE FROM products WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $data->id);

    try {
        if($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("success" => true, "message" => "Product deleted."));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to delete product."));
        }
    } catch(PDOException $e) {
         http_response_code(400);
         // Likely constraint violation
         echo json_encode(array("success" => false, "message" => "Cannot delete product. It may be in use in orders."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "ID is required."));
}
?>
