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
        // Periksa jika email mengandung kata "admin"
        if (stripos($email, 'admin') !== false) {
            // Simulasi respons untuk admin
            $response = [
                'success' => true,
                'message' => 'Login berhasil sebagai Admin!',
                'user' => [
                    'id_user' => 0, // ID dummy untuk admin
                    'username' => 'Admin',
                    'email' => $email,
                    'role' => 'admin'
                ],
                'redirect' => 'admin_dashboard.html' // Redirect ke halaman admin
            ];
            echo json_encode($response);
            exit();
        } else {
            // Jika email tidak mengandung "admin", langsung redirect ke halaman index.html
            $response = [
                'success' => true,
                'message' => 'Login berhasil sebagai User!',
                'user' => [
                    'id_user' => 0, // ID dummy untuk user biasa
                    'username' => 'User',
                    'email' => $email,
                    'role' => 'user'
                ],
                'redirect' => 'index.html' // Redirect ke halaman user
            ];
            echo json_encode($response);
            exit();
        }

        // Ambil data user berdasarkan email dari database
        $stmt = $conn->prepare("SELECT * FROM Users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // Periksa apakah password cocok
            if (password_verify($password, $user['password'])) {
                // Mulai session untuk menyimpan ID user
                session_start();
                $_SESSION['id_user'] = $user['id_user']; // Menyimpan ID user ke session
                $_SESSION['username'] = $user['username']; // Menyimpan username ke session
                $_SESSION['role'] = $user['role']; // Menyimpan role user ke session

                // Respons sukses login dan redirect ke halaman yang sesuai
                $response = [
                    'success' => true,
                    'message' => 'Login berhasil!',
                    'user' => [
                        'id_user' => $user['id_user'],
                        'username' => $user['username'],
                        'email' => $user['email'],
                        'role' => $user['role']
                    ]
                ];

                // Redirect berdasarkan role
                if ($user['role'] === 'admin') {
                    $response['redirect'] = 'admin_dashboard.html';
                } else {
                    $response['redirect'] = 'index.html';
                }

                echo json_encode($response);
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
?>
