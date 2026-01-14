<?php
// CORS headers MUST be sent first, before any other code
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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

    if (!$token) return array('authenticated' => false, 'user_id' => null);
    $query = "SELECT u.id, u.role, s.expires_at FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = :token LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $token);
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (strtotime($row['expires_at']) > time() && $row['role'] === 'admin') {
            return array('authenticated' => true, 'user_id' => $row['id']);
        }
    }
    return array('authenticated' => false, 'user_id' => null);
}

$authResult = checkAdminAuth($db);

if (!$authResult['authenticated']) {
    http_response_code(403);
    echo json_encode(array("success" => false, "message" => "Unauthorized. Admin access required."));
    exit();
}

// Get DELETE data
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id)) {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "User ID is required."));
    exit();
}

$id = $data->id;
$currentAdminId = $authResult['user_id'];

// Prevent admin from deleting their own account
if ($id == $currentAdminId) {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "You cannot delete your own account."));
    exit();
}

try {
    // Start transaction
    $db->beginTransaction();
    
    // Delete user's sessions first (foreign key constraint)
    $query = "DELETE FROM sessions WHERE user_id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    
    // Delete user
    $query = "DELETE FROM users WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            $db->commit();
            http_response_code(200);
            echo json_encode(array("success" => true, "message" => "User deleted successfully."));
        } else {
            $db->rollBack();
            http_response_code(404);
            echo json_encode(array("success" => false, "message" => "User not found."));
        }
    } else {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(array("success" => false, "message" => "Failed to delete user."));
    }
} catch (PDOException $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(array("success" => false, "message" => "Database error: " . $e->getMessage()));
}
?>
