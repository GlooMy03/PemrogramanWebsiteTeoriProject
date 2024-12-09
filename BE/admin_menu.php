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

  if (empty($data['nama_menu'])) {
    $errors[] = "Nama menu tidak boleh kosong";
  }

  if (!is_numeric($data['harga']) || $data['harga'] <= 0) {
    $errors[] = "Harga harus berupa angka positif";
  }

  if (!is_numeric($data['stok']) || $data['stok'] < 0) {
    $errors[] = "Stok harus berupa angka non-negatif";
  }

  return $errors;
}

// Fungsi untuk mengambil data menu
function getMenuItems($conn)
{
  try {
    $query = "SELECT * FROM menu ORDER BY id_menu DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  } catch (PDOException $e) {
    return ['status' => 'error', 'message' => 'Gagal mengambil data: ' . $e->getMessage()];
  }
}

// Fungsi untuk menambah atau memperbarui menu
function addOrUpdateMenuItem($conn)
{
  try {
    $id_menu = $_POST['id_menu'] ?? null;
    $nama_menu = $_POST['nama_menu'];
    $kategori = $_POST['kategori'];
    $harga = $_POST['harga'];
    $stok = $_POST['stok'];
    $deskripsi = $_POST['deskripsi'];

    // Validasi input
    $validationErrors = validateInput($_POST);
    if (!empty($validationErrors)) {
      return ['status' => 'error', 'message' => implode(', ', $validationErrors)];
    }

    // Proses upload gambar
    $gambar = $_FILES['gambar']['name'] ?? '';
    if ($gambar) {
      $targetDir = "uploads/";
      $fileExtension = strtolower(pathinfo($gambar, PATHINFO_EXTENSION));
      $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

      if (!in_array($fileExtension, $allowedExtensions)) {
        return ['status' => 'error', 'message' => 'Tipe file gambar tidak diizinkan'];
      }

      $uniqueFileName = uniqid() . '.' . $fileExtension;
      $targetFile = $targetDir . $uniqueFileName;

      if (!move_uploaded_file($_FILES['gambar']['tmp_name'], $targetFile)) {
        return ['status' => 'error', 'message' => 'Gagal mengunggah gambar'];
      }
      $gambar = $uniqueFileName;
    }

    if ($id_menu) {
      // Update existing menu
      $query = "UPDATE menu SET nama_menu=:nama_menu, kategori=:kategori, harga=:harga, stok=:stok, deskripsi=:deskripsi " .
        ($gambar ? ", gambar=:gambar" : "") .
        " WHERE id_menu=:id_menu";
      $stmt = $conn->prepare($query);
      $stmt->bindParam(':id_menu', $id_menu);

      if ($gambar) {
        $stmt->bindParam(':gambar', $gambar);
      }
    } else {
      // Insert new menu
      $query = "INSERT INTO menu (nama_menu, kategori, harga, stok, deskripsi, gambar) VALUES (:nama_menu, :kategori, :harga, :stok, :deskripsi, :gambar)";
      $stmt = $conn->prepare($query);
      $stmt->bindParam(':gambar', $gambar);
    }

    // Bind parameters
    $stmt->bindParam(':nama_menu', $nama_menu);
    $stmt->bindParam(':kategori', $kategori);
    $stmt->bindParam(':harga', $harga);
    $stmt->bindParam(':stok', $stok);
    $stmt->bindParam(':deskripsi', $deskripsi);

    if ($stmt->execute()) {
      $message = $id_menu ? 'Menu berhasil diperbarui' : 'Menu berhasil ditambahkan';
      return ['status' => 'success', 'message' => $message];
    } else {
      return ['status' => 'error', 'message' => 'Gagal menyimpan menu'];
    }
  } catch (PDOException $e) {
    return ['status' => 'error', 'message' => 'Kesalahan database: ' . $e->getMessage()];
  }
}

// Fungsi untuk menghapus menu
function deleteMenuItem($conn)
{
  try {
    parse_str(file_get_contents("php://input"), $delete_data);
    $id_menu = $delete_data['id_menu'] ?? null;

    if (!$id_menu) {
      return ['status' => 'error', 'message' => 'ID menu tidak valid'];
    }

    $query = "DELETE FROM menu WHERE id_menu = :id_menu";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id_menu', $id_menu);

    if ($stmt->execute()) {
      return ['status' => 'success', 'message' => 'Menu berhasil dihapus'];
    } else {
      return ['status' => 'error', 'message' => 'Gagal menghapus menu'];
    }
  } catch (PDOException $e) {
    return ['status' => 'error', 'message' => 'Kesalahan database: ' . $e->getMessage()];
  }
}

// Cek method request
try {
  if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(getMenuItems($conn));
  } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo json_encode(addOrUpdateMenuItem($conn));
  } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    echo json_encode(deleteMenuItem($conn));
  }
} catch (Exception $e) {
  echo json_encode(['status' => 'error', 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
}
