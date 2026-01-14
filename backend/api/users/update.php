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
    echo json_encode(array("success" => false, "message" => "Unauthorized. Admin access required."));
    exit();
}

// Get PUT data
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id)) {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "User ID is required."));
    exit();
}

$id = $data->id;
$username = isset($data->username) ? $data->username : null;
$email = isset($data->email) ? $data->email : null;
$full_name = isset($data->full_name) ? $data->full_name : null;
$phone = isset($data->phone) ? $data->phone : null;
$role = isset($data->role) ? $data->role : null;

// Build dynamic update query
$updateFields = array();
$params = array(':id' => $id);

if ($username !== null) {
    $updateFields[] = "username = :username";
    $params[':username'] = $username;
}
if ($email !== null) {
    $updateFields[] = "email = :email";
    $params[':email'] = $email;
}
if ($full_name !== null) {
    $updateFields[] = "full_name = :full_name";
    $params[':full_name'] = $full_name;
}
if ($phone !== null) {
    $updateFields[] = "phone = :phone";
    $params[':phone'] = $phone;
}
if ($role !== null) {
    $updateFields[] = "role = :role";
    $params[':role'] = $role;
}

if (empty($updateFields)) {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "No fields to update."));
    exit();
}

$query = "UPDATE users SET " . implode(", ", $updateFields) . " WHERE id = :id";

try {
    $stmt = $db->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(array("success" => true, "message" => "User updated successfully."));
    } else {
        http_response_code(500);
        echo json_encode(array("success" => false, "message" => "Failed to update user."));
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("success" => false, "message" => "Database error: " . $e->getMessage()));
}
?>
