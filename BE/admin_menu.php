<?php
require_once 'db.php';

// Set header untuk JSON response
// Header untuk mendukung JSON dan CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Fungsi untuk mengambil data menu
function getMenuItems($conn)
{
  $query = "SELECT * FROM menu";
  $stmt = $conn->prepare($query);
  $stmt->execute();
  $menuItems = $stmt->fetchAll(PDO::FETCH_ASSOC);  // Mengambil semua hasil dalam bentuk array asosiatif

  return $menuItems;
}

// Fungsi untuk menambah atau memperbarui menu
function addOrUpdateMenuItem($conn)
{
  $id_menu = $_POST['id_menu'] ?? null;
  $nama_menu = $_POST['nama_menu'];
  $kategori = $_POST['kategori'];
  $harga = $_POST['harga'];
  $stok = $_POST['stok'];
  $deskripsi = $_POST['deskripsi'];
  $gambar = $_FILES['gambar']['name'] ?? '';

  if ($gambar) {
    $targetDir = "uploads/";
    $targetFile = $targetDir . basename($gambar);
    move_uploaded_file($_FILES['gambar']['tmp_name'], $targetFile);
  }

  if ($id_menu) {
    // Update existing menu
    $query = "UPDATE menu SET nama_menu=:nama_menu, kategori=:kategori, harga=:harga, stok=:stok, deskripsi=:deskripsi, gambar=:gambar WHERE id_menu=:id_menu";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id_menu', $id_menu);
  } else {
    // Insert new menu
    $query = "INSERT INTO menu (nama_menu, kategori, harga, stok, deskripsi, gambar) VALUES (:nama_menu, :kategori, :harga, :stok, :deskripsi, :gambar)";
    $stmt = $conn->prepare($query);
  }

  // Bind parameters
  $stmt->bindParam(':nama_menu', $nama_menu);
  $stmt->bindParam(':kategori', $kategori);
  $stmt->bindParam(':harga', $harga);
  $stmt->bindParam(':stok', $stok);
  $stmt->bindParam(':deskripsi', $deskripsi);
  $stmt->bindParam(':gambar', $gambar);

  if ($stmt->execute()) {
    return ['status' => 'success', 'message' => 'Menu item saved successfully'];
  } else {
    return ['status' => 'error', 'message' => $stmt->errorInfo()];
  }
}

// Fungsi untuk menghapus menu
function deleteMenuItem($conn)
{
  $id_menu = $_GET['id_menu'];
  $query = "DELETE FROM menu WHERE id_menu = :id_menu";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':id_menu', $id_menu);

  if ($stmt->execute()) {
    return ['status' => 'success', 'message' => 'Menu item deleted successfully'];
  } else {
    return ['status' => 'error', 'message' => $stmt->errorInfo()];
  }
}

// Cek method request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  echo json_encode(getMenuItems($conn));
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
  echo json_encode(addOrUpdateMenuItem($conn));
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  echo json_encode(deleteMenuItem($conn));
}
