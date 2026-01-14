<?php
include '../../utils/cors.php';
include '../../config/database.php';

$database = new Database();
$db = $database->connect();

// Get raw posted data
$data = json_decode(file_get_contents("php://input"));

// Initialize response array
$response = array();

if (
    !empty($data->username) &&
    !empty($data->email) &&
    !empty($data->password)
) {
    // Sanitize and validate
    $username = htmlspecialchars(strip_tags($data->username));
    $email = htmlspecialchars(strip_tags($data->email));
    $password = htmlspecialchars(strip_tags($data->password));
    $full_name = !empty($data->full_name) ? htmlspecialchars(strip_tags($data->full_name)) : '';
    $phone = !empty($data->phone) ? htmlspecialchars(strip_tags($data->phone)) : '';

    // Validation
    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Minimum password length is 6 characters."));
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Invalid email format."));
        exit();
    }

    // Check if username or email exists
    $check_query = "SELECT id FROM users WHERE username = :username OR email = :email LIMIT 1";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':username', $username);
    $check_stmt->bindParam(':email', $email);
    $check_stmt->execute();

    if ($check_stmt->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(array("success" => false, "message" => "Username or Email already exists."));
        exit();
    }

    // Hash password
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    // Insert new user
    $query = "INSERT INTO users (username, email, password, full_name, phone, role) 
              VALUES (:username, :email, :password, :full_name, :phone, 'customer')";
    
    $stmt = $db->prepare($query);

    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $password_hash);
    $stmt->bindParam(':full_name', $full_name);
    $stmt->bindParam(':phone', $phone);

    if ($stmt->execute()) {
        http_response_code(201); // Created
        echo json_encode(array("success" => true, "message" => "Đăng ký thành công"));
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(array("success" => false, "message" => "Unable to register user."));
    }

} else {
    http_response_code(400); // Bad Request
    echo json_encode(array("success" => false, "message" => "Incomplete data. Username, email, and password are required."));
}
?>
