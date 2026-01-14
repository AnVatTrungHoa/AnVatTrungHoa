<?php
include '../config/database.php';

$database = new Database();
$db = $database->connect();

if ($db === null) {
    die("Lỗi kết nối database");
}

echo "<h1>Đang thiết lập database...</h1>";

try {
    // Create tables only (without sample data)
    $tables = [
        "users" => "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(100),
            phone VARCHAR(20),
            role ENUM('admin', 'customer') DEFAULT 'customer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )",

        "products" => "CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            sale_price DECIMAL(10,2),
            category VARCHAR(50),
            image_url VARCHAR(255),
            stock INT DEFAULT 0,
            badge VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",

        "orders" => "CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            total_amount DECIMAL(10,2),
            status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
            shipping_address TEXT,
            phone VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )",

        "sessions" => "CREATE TABLE IF NOT EXISTS sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",

        "order_items" => "CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT,
            product_id INT,
            quantity INT,
            price DECIMAL(10,2),
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
        )"
    ];

    foreach ($tables as $table_name => $sql) {
        echo "<p>Creating table: $table_name...</p>";
        $db->exec($sql);
    }

    // Split into individual statements
    $statements = array_filter(array_map('trim', explode(';', $tables_sql)));

    foreach ($statements as $statement) {
        if (!empty($statement) && !preg_match('/^--/', $statement)) {
            echo "<p>Executing: " . substr($statement, 0, 50) . "...</p>";
            $db->exec($statement);
        }
    }

    echo "<h3>✅ Database tables đã được tạo thành công!</h3>";
    echo "<p>Các bảng đã được tạo: users, products, orders, sessions, order_items</p>";
    echo "<a href='setup_users.php'>Thiết lập tài khoản test</a>";

} catch (PDOException $e) {
    echo "<p style='color: red;'>Lỗi: " . $e->getMessage() . "</p>";
}
?>