<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->connect();

if ($db === null) {
    http_response_code(500);
    echo json_encode(array("success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu."));
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->username) && !empty($data->password)) {
    $username = htmlspecialchars(strip_tags($data->username));
    
    // Check if user exists
    $query = "SELECT id, username, email, full_name, password, role FROM users WHERE username = :username LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':username', $username);
    $stmt->execute();
    
    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $password_hash = $row['password'];
        
        if(password_verify($data->password, $password_hash)) {
            // Generate simple token
            $token = bin2hex(random_bytes(32)); // Secure random token
            $expires_at = date('Y-m-d H:i:s', strtotime('+1 day')); // Token valid for 1 day
            
            // Save token to sessions table
            $insert_query = "INSERT INTO sessions (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)";
            $insert_stmt = $db->prepare($insert_query);
            $insert_stmt->bindParam(':user_id', $row['id']);
            $insert_stmt->bindParam(':token', $token);
            $insert_stmt->bindParam(':expires_at', $expires_at);
            
            if($insert_stmt->execute()) {
                http_response_code(200);
                echo json_encode(array(
                    "success" => true,
                    "message" => "Đăng nhập thành công.",
                    "token" => $token,
                    "user" => array(
                        "id" => $row['id'],
                        "username" => $row['username'],
                        "email" => $row['email'],
                        "full_name" => $row['full_name'],
                        "role" => $row['role']
                    )
                ));
            } else {
                http_response_code(500);
                echo json_encode(array("success" => false, "message" => "Lỗi khi tạo phiên đăng nhập."));
            }
        } else {
            http_response_code(401);
            echo json_encode(array("success" => false, "message" => "Sai tên đăng nhập hoặc mật khẩu."));
        }
    } else {
        http_response_code(401);
        echo json_encode(array("success" => false, "message" => "Sai tên đăng nhập hoặc mật khẩu."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Thiếu thông tin đăng nhập."));
}
?>
