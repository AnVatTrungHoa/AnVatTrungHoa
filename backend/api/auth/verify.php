<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->connect();

// Helper function to get Authorization header
function getAuthorizationHeader(){
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    }
    else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { //Nginx or fast CGI
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        // Server-side fix for bug in some apache versions
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    return $headers;
}

function getBearerToken() {
    $headers = getAuthorizationHeader();
    // HEADER: Get the access token from the header
    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

$token = getBearerToken();

if ($token) {
    // Check token in database
    $query = "SELECT u.id, u.username, u.email, u.full_name, u.role, s.expires_at 
              FROM sessions s 
              JOIN users u ON s.user_id = u.id 
              WHERE s.token = :token LIMIT 1";
              
    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $token);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Check expiration
        if (strtotime($row['expires_at']) > time()) {
            // Valid
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "user" => array(
                    "id" => $row['id'],
                    "username" => $row['username'],
                    "email" => $row['email'],
                    "full_name" => $row['full_name'],
                    "role" => $row['role']
                )
            ));
        } else {
            // Expired
            // Optional: Delete expired token
            $delParams = array(':token' => $token);
            $db->prepare("DELETE FROM sessions WHERE token = :token")->execute($delParams);
            
            http_response_code(401);
            echo json_encode(array("success" => false, "message" => "Token đã hết hạn."));
        }
    } else {
        http_response_code(401);
        echo json_encode(array("success" => false, "message" => "Token không hợp lệ."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Token không được cung cấp."));
}
?>
