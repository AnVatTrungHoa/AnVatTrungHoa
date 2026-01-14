<?php
// Mảng các domain được phép truy cập
$allowed_origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

// Lấy origin từ request
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Kiểm tra nếu origin nằm trong danh sách cho phép
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

// Xử lý preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>