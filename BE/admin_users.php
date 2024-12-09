<?php
require_once 'db.php';

// Set header untuk JSON response
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');



// Fungsi untuk validasi input
function validateInput($data)
{
    $errors = [];

    if (empty($data['username'])) {
        $errors[] = "Username tidak boleh kosong";
    }

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Format email tidak valid";
    }

    if (strlen($data['password']) < 6) {
        $errors[] = "Password harus memiliki setidaknya 6 karakter";
    }

    return $errors;
}

// Fungsi untuk mengambil data users
function getUsers($conn)
{
    try {
        $query = "SELECT id_user, username, email, password FROM users ORDER BY id_user DESC"; // Pilih hanya kolom yang diperlukan
        $stmt = $conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['status' => 'error', 'message' => 'Gagal mengambil data: ' . $e->getMessage()];
    }
}

// Fungsi untuk menambah atau memperbarui user
function addOrUpdateUser($conn)
{
    try {
        // Ambil data dari form
        $id_user = $_POST['id_user'] ?? null;
        $username = $_POST['username'];
        $email = $_POST['email'];
        $password = $_POST['password'] ?? '';  // Password baru (kosong jika tidak ada perubahan)
        $role = $_POST['role'] ?? 'Customer';

        // Validasi input
        $validationErrors = validateInput($_POST);
        if (!empty($validationErrors)) {
            return ['status' => 'error', 'message' => implode(', ', $validationErrors)];
        }

        // Jika ID pengguna ada, berarti kita ingin update, bukan insert
        if ($id_user) {
            // Ambil password lama untuk tetap disimpan jika tidak ada perubahan password
            $query = "SELECT password FROM users WHERE id_user = :id_user";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':id_user', $id_user);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Jika password baru diberikan, hash dan gunakan password baru
            if (!empty($password)) {
                $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
            } else {
                // Jika tidak ada password baru, tetap gunakan password lama yang diambil dari database
                $hashedPassword = $user['password'];
            }

            // Update pengguna
            $query = "UPDATE users SET username = :username, email = :email, password = :password, role = :role WHERE id_user = :id_user";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':id_user', $id_user);
        } else {
            // Insert pengguna baru
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT); // Hash password baru
            $query = "INSERT INTO users (username, email, password, role) VALUES (:username, :email, :password, :role)";
            $stmt = $conn->prepare($query);
        }

        // Bind parameter
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $hashedPassword); // Menggunakan password yang di-hash
        $stmt->bindParam(':role', $role);

        // Eksekusi query
        if ($stmt->execute()) {
            $message = $id_user ? 'User berhasil diperbarui' : 'User berhasil ditambahkan';
            return ['status' => 'success', 'message' => $message];
        } else {
            return ['status' => 'error', 'message' => 'Gagal menyimpan data user'];
        }
    } catch (PDOException $e) {
        return ['status' => 'error', 'message' => 'Kesalahan database: ' . $e->getMessage()];
    }
}



// Fungsi untuk menghapus user
function deleteUser($conn)
{
    try {
        parse_str(file_get_contents("php://input"), $delete_data);
        $id_user = $delete_data['id_user'] ?? null;

        if (!$id_user) {
            return ['status' => 'error', 'message' => 'ID user tidak valid'];
        }

        $query = "DELETE FROM users WHERE id_user = :id_user";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id_user', $id_user);

        if ($stmt->execute()) {
            return ['status' => 'success', 'message' => 'User berhasil dihapus'];
        } else {
            return ['status' => 'error', 'message' => 'Gagal menghapus user'];
        }
    } catch (PDOException $e) {
        return ['status' => 'error', 'message' => 'Kesalahan database: ' . $e->getMessage()];
    }
}

// Cek method request
try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        echo json_encode(getUsers($conn));
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        echo json_encode(addOrUpdateUser($conn));
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        echo json_encode(deleteUser($conn));
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
}
