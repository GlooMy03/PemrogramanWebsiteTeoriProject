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

  if (empty($data['judul'])) {
    $errors[] = "Judul tidak boleh kosong";
  }

  if (empty($data['konten'])) {
    $errors[] = "Konten tidak boleh kosong";
  }

  return $errors;
}

// Fungsi untuk mengambil data about
function getAboutItems($conn)
{
  try {
    $query = "SELECT * FROM about ORDER BY id_about DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  } catch (PDOException $e) {
    return ['status' => 'error', 'message' => 'Gagal mengambil data: ' . $e->getMessage()];
  }
}

// Fungsi untuk menambah atau memperbarui about
function addOrUpdateAboutItem($conn)
{
  try {
    $id_about = $_POST['id_about'] ?? null;
    $judul = $_POST['judul'];
    $konten = $_POST['konten'];

    // Validasi input
    $validationErrors = validateInput($_POST);
    if (!empty($validationErrors)) {
      return ['status' => 'error', 'message' => implode(', ', $validationErrors)];
    }

    if ($id_about) {
      // Update existing about
      $query = "UPDATE about SET judul=:judul, konten=:konten WHERE id_about=:id_about";
      $stmt = $conn->prepare($query);
      $stmt->bindParam(':id_about', $id_about);
    } else {
      // Insert new about
      $query = "INSERT INTO about (judul, konten) VALUES (:judul, :konten)";
      $stmt = $conn->prepare($query);
    }

    // Bind parameters
    $stmt->bindParam(':judul', $judul);
    $stmt->bindParam(':konten', $konten);

    if ($stmt->execute()) {
      $message = $id_about ? 'Item About berhasil diperbarui' : 'Item About berhasil ditambahkan';
      return ['status' => 'success', 'message' => $message];
    } else {
      return ['status' => 'error', 'message' => 'Gagal menyimpan item About'];
    }
  } catch (PDOException $e) {
    return ['status' => 'error', 'message' => 'Kesalahan database: ' . $e->getMessage()];
  }
}

// Fungsi untuk menghapus about
function deleteAboutItem($conn)
{
  try {
    parse_str(file_get_contents("php://input"), $delete_data);
    $id_about = $delete_data['id_about'] ?? null;

    if (!$id_about) {
      return ['status' => 'error', 'message' => 'ID About tidak valid'];
    }

    $query = "DELETE FROM about WHERE id_about = :id_about";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id_about', $id_about);

    if ($stmt->execute()) {
      return ['status' => 'success', 'message' => 'Item About berhasil dihapus'];
    } else {
      return ['status' => 'error', 'message' => 'Gagal menghapus item About'];
    }
  } catch (PDOException $e) {
    return ['status' => 'error', 'message' => 'Kesalahan database: ' . $e->getMessage()];
  }
}

// Cek method request
try {
  if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(getAboutItems($conn));
  } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo json_encode(addOrUpdateAboutItem($conn));
  } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    echo json_encode(deleteAboutItem($conn));
  }
} catch (Exception $e) {
  echo json_encode(['status' => 'error', 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
}
