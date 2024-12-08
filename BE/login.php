<?php
// Aktifkan error reporting untuk debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include file koneksi database
include 'db.php';

// Header untuk mendukung JSON dan CORS
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

// Periksa apakah email dan password dikirim
if (isset($_POST['Email'], $_POST['password'])) {
  $email = trim($_POST['Email']);
  $password = $_POST['password'];

  try {
    // Ambil data user berdasarkan email
    $stmt = $conn->prepare("SELECT * FROM Users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
      // Periksa apakah password cocok
      if (password_verify($password, $user['password'])) {
        echo json_encode([
          'success' => true,
          'message' => 'Login berhasil!',
          'user' => [
            'id_user' => $user['id_user'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role']
          ]
        ]);
      } else {
        echo json_encode(['success' => false, 'error' => 'Password salah.']);
      }
    } else {
      echo json_encode(['success' => false, 'error' => 'Email tidak terdaftar.']);
    }
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
  }
} else {
  echo json_encode(['success' => false, 'error' => 'Email dan password harus diisi.']);
}
