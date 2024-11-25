<?php
// Aktifkan error reporting untuk debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include file koneksi database
include 'db.php';

// Header untuk mendukung CORS dan JSON
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Pastikan metode request adalah POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405); // Method Not Allowed
  echo json_encode(['success' => false, 'error' => 'Method not allowed. Please use POST.']);
  exit();
}

// Periksa apakah semua data form telah dikirimkan
if (isset($_POST['Username'], $_POST['Email'], $_POST['password'])) {
  $username = trim($_POST['Username']);
  $email = trim($_POST['Email']);
  $password = $_POST['password'];

  try {
    // Periksa apakah username sudah ada
    $stmt = $pdo->prepare("SELECT id_user FROM Users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->rowCount() > 0) {
      echo json_encode(['success' => false, 'error' => 'Username sudah digunakan']);
      exit();
    }

    // Periksa apakah email sudah terdaftar
    $stmt = $pdo->prepare("SELECT id_user FROM Users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->rowCount() > 0) {
      echo json_encode(['success' => false, 'error' => 'Email sudah terdaftar']);
      exit();
    }

    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Tambahkan user baru ke database
    $stmt = $pdo->prepare("INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, 'Customer')");
    if ($stmt->execute([$username, $email, $hashed_password])) {
      echo json_encode(['success' => true, 'message' => 'Registrasi berhasil!']);
    } else {
      echo json_encode(['success' => false, 'error' => 'Gagal menambahkan user.']);
    }
  } catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'error' => 'Database Error: ' . $e->getMessage()]);
  }
} else {
  echo json_encode(['success' => false, 'error' => 'Semua field harus diisi.']);
  exit();
}
