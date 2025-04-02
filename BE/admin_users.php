<?php
require_once 'db.php';

// Set header untuk JSON response
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, GET, PUT');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Fungsi untuk validasi input
function validateInput($data)
{
    $errors = [];

    if (empty($data['username'])) {
        $errors[] = "Username tidak boleh kosong";
    }

    if (empty($data['email'])) {
        $errors[] = "Email tidak boleh kosong";
    }

    if (empty($data['password'])) {
        $errors[] = "Password tidak boleh kosong";
    }

    return $errors;
}

// Fungsi untuk mengambil data users
function getUsers($conn)
{
    try {
        $query = "SELECT * FROM users ORDER BY id_user DESC";
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
        $id_user = $_POST['id_user'] ?? null;
        $username = $_POST['username'];
        $email = $_POST['email'];
        $password = $_POST['password'];
        $role = $_POST['role'] ?? 'Customer';
        $foto_profil = $_FILES['foto_profil']['name'] ?? '';

        // Validasi input minimal username
        if (empty($username)) {
            return ['status' => 'error', 'message' => 'Username tidak boleh kosong'];
        }

        // Jika ini adalah update
        if ($id_user) {
            // Ambil data user yang ada
            $stmt = $conn->prepare("SELECT * FROM users WHERE id_user = ?");
            $stmt->execute([$id_user]);
            $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$existingUser) {
                return ['status' => 'error', 'message' => 'User tidak ditemukan'];
            }

            // Gunakan data yang ada jika tidak ada input baru
            $email = $email ?: $existingUser['email'];
            $role = $role ?: $existingUser['role'];
        }

        // Upload foto profil jika ada
        if ($foto_profil) {
            $targetDir = "PP/";
            $fileExtension = strtolower(pathinfo($foto_profil, PATHINFO_EXTENSION));
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

            if (!in_array($fileExtension, $allowedExtensions)) {
                return ['status' => 'error', 'message' => 'Tipe file foto profil tidak diizinkan'];
            }

            $uniqueFileName = uniqid() . '.' . $fileExtension;
            $targetFile = $targetDir . $uniqueFileName;

            if (!move_uploaded_file($_FILES['foto_profil']['tmp_name'], $targetFile)) {
                return ['status' => 'error', 'message' => 'Gagal mengunggah foto profil'];
            }
            $foto_profil = $uniqueFileName;
        }

        if ($id_user) {
            // Update existing user
            $updateFields = ['username = :username'];
            $params = [':username' => $username, ':id_user' => $id_user];

            // Hanya tambahkan foto_profil ke query jika ada upload baru
            if ($foto_profil) {
                $updateFields[] = 'foto_profil = :foto_profil';
                $params[':foto_profil'] = $foto_profil;
            }

            $query = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id_user = :id_user";
            $stmt = $conn->prepare($query);

            if ($stmt->execute($params)) {
                return ['status' => 'success', 'message' => 'User berhasil diperbarui'];
            }
        } else {
            // Insert new user logic (unchanged)
            $query = "INSERT INTO users (username, email, password, role, foto_profil) VALUES (:username, :email, :password, :role, :foto_profil)";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password', $password);
            $stmt->bindParam(':role', $role);
            $stmt->bindParam(':foto_profil', $foto_profil);

            if ($stmt->execute()) {
                return ['status' => 'success', 'message' => 'User berhasil ditambahkan'];
            }
        }

        return ['status' => 'error', 'message' => 'Gagal menyimpan user'];
    } catch (PDOException $e) {
        return ['status' => 'error', 'message' => 'Username sudah ada'];
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
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        echo json_encode(addOrUpdateUser($conn));
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
}
