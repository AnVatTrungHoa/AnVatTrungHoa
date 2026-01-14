<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'chinese_snack_shop';
    private $username = 'root';
    private $password = '';  // XAMPP mặc định không có password
    private $conn;

    public function connect() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                'mysql:host=' . $this->host . ';dbname=' . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec('set names utf8');
        } catch(PDOException $e) {
            // echo 'Connection Error: ' . $e->getMessage();
            // Logging would be better, but for API we just return null or let it bubble if we want
            // For now, let's just return null and let the caller handle it or suppress the echo
            error_log('Connection Error: ' . $e->getMessage()); 
        }
        return $this->conn;
    }
}
?>