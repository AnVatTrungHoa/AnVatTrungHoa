<?php
include '../config/database.php';

$database = new Database();
$db = $database->connect();

if ($db === null) {
    die("Lỗi kết nối database");
}

echo "<h1>Tạo bảng sessions...</h1>";

try {
    $sql = "CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL
    )";

    $db->exec($sql);
    echo "<h3>✅ Bảng sessions đã được tạo thành công!</h3>";

    // Add foreign key constraint separately
    try {
        $fk_sql = "ALTER TABLE sessions ADD CONSTRAINT fk_sessions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE";
        $db->exec($fk_sql);
        echo "<p>✅ Foreign key constraint đã được thêm!</p>";
    } catch (PDOException $e) {
        echo "<p>Foreign key might already exist: " . $e->getMessage() . "</p>";
    }

} catch (PDOException $e) {
    echo "<p style='color: red;'>Lỗi: " . $e->getMessage() . "</p>";
}
?>