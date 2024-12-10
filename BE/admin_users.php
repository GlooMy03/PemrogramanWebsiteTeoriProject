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

        // Validasi input
        $validationErrors = validateInput($_POST);
        if (!empty($validationErrors)) {
            return ['status' => 'error', 'message' => implode(', ', $validationErrors)];
        }

        // Proses upload foto profil
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
            $query = "UPDATE users SET username=:username, email=:email, password=:password, role=:role " .
                ($foto_profil ? ", foto_profil=:foto_profil" : "") .
                " WHERE id_user=:id_user";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':id_user', $id_user);

            if ($foto_profil) {
                $stmt->bindParam(':foto_profil', $foto_profil);
            }
        } else {
            // Insert new user
            $query = "INSERT INTO users (username, email, password, role, foto_profil) VALUES (:username, :email, :password, :role, :foto_profil)";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':foto_profil', $foto_profil);
        }

        // Bind parameters
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':role', $role);

        if ($stmt->execute()) {
            $message = $id_user ? 'User berhasil diperbarui' : 'User berhasil ditambahkan';
            return ['status' => 'success', 'message' => $message];
        } else {
            return ['status' => 'error', 'message' => 'Gagal menyimpan user'];
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
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        echo json_encode(addOrUpdateUser($conn));
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
}
