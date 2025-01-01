

<?php
session_start();
$servername = "localhost";
$username = "root";  // Ganti dengan username database Anda
$password = "";  // Ganti dengan password database Anda
$dbname = "web_gacoan";  // Ganti dengan nama database Anda

try {
  // Koneksi menggunakan PDO
  $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
  // Set mode error PDO untuk menampilkan exception
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
  exit();
}
