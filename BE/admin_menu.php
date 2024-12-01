<?php
// Database connection details
$servername = "localhost";
$username = 'root';
$password = '';
$dbname = 'web_gacoan';



// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Handle CRUD operations
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $action = $_POST["action"];
  $id = $_POST["id"] ?? null;
  $name = $_POST["name"];
  $category = $_POST["category"];
  $price = $_POST["price"];
  $stock = $_POST["stock"];
  $description = $_POST["description"];
  $image = $_POST["image"];

  switch ($action) {
    case "create":
      $sql = "INSERT INTO menu (name, category, price, stock, description, image) VALUES ('$name', '$category', $price, $stock, '$description', '$image')";
      break;
    case "update":
      $sql = "UPDATE menu SET name = '$name', category = '$category', price = $price, stock = $stock, description = '$description', image = '$image' WHERE id = $id";
      break;
    case "delete":
      $sql = "DELETE FROM menu WHERE id = $id";
      break;
    default:
      $sql = "SELECT * FROM menu";
  }

  if ($action !== "read") {
    if ($conn->query($sql) === TRUE) {
      echo json_encode(["status" => "success"]);
    } else {
      echo json_encode(["status" => "error", "message" => $conn->error]);
    }
  } else {
    $result = $conn->query($sql);
    $data = [];
    if ($result->num_rows > 0) {
      while ($row = $result->fetch_assoc()) {
        $data[] = $row;
      }
    }
    echo json_encode($data);
  }
}

$conn->close();
