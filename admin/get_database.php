<?php
$servername = "localhost";
$username = "root";
$password = ""; 
$dbname = "gacoan";
 
$conn = new mysqli($servername, $username, $password, $dbname);
 
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}
 
$sql = "SELECT * FROM pesanan";
$result = $conn->query($sql);
 
$data = array();
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
echo json_encode($data);
 
$conn->close();
?>