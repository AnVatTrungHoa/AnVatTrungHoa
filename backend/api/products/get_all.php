<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->connect();

$query = "SELECT * FROM products ORDER BY id ASC";
$stmt = $db->prepare($query);
$stmt->execute();

$num = $stmt->rowCount();

// Always return an array, even if empty
$products_arr = array(); // Initialize as array

if($num > 0) {
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
        extract($row);
        $product_item = array(
            "id" => $id,
            "name" => $name,
            "description" => $description,
            "price" => $price,
            "sale_price" => $sale_price,
            "category" => $category,
            "image_url" => $image_url,
            "stock" => $stock,
            "badge" => $badge
        );
        array_push($products_arr, $product_item);
    }
    http_response_code(200);
    echo json_encode($products_arr);
} else {
    http_response_code(200); // Return 200 with empty list
    echo json_encode([]);
}
?>
