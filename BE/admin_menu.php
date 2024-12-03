<?php
// Aktifkan pelaporan error untuk debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Header CORS yang lebih spesifik
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Koneksi database
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "web_gacoan";

// Membuat koneksi
$conn = new mysqli($servername, $username, $password, $dbname);

// Cek koneksi
if ($conn->connect_error) {
    die(json_encode([
        "status" => "error", 
        "message" => "Koneksi database gagal: " . $conn->connect_error
    ]));
}

// Handler untuk request OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Fungsi untuk validasi input
function validateInput($input) {
    $input = trim($input);
    $input = stripslashes($input);
    $input = htmlspecialchars($input);
    return $input;
}

// Proses request berdasarkan metode
try {
    switch($_SERVER['REQUEST_METHOD']) {
        case 'POST':
            // Untuk menambah data baru
            // Gunakan multipart/form-data untuk upload file
            $name = validateInput($_POST['nama_menu'] ?? '');
            $category = validateInput($_POST['kategori'] ?? '');
            $price = filter_input(INPUT_POST, 'harga', FILTER_VALIDATE_FLOAT);
            $stock = filter_input(INPUT_POST, 'stok', FILTER_VALIDATE_INT);
            $description = validateInput($_POST['deskripsi'] ?? '');

            // Validasi input
            if (empty($name) || empty($category) || $price === false || $stock === false) {
                throw new Exception("Data tidak lengkap atau tidak valid");
            }

            // Proses upload gambar
            $image = null;
            if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] == 0) {
                $image = file_get_contents($_FILES['gambar']['tmp_name']);
            }

            // Persiapkan statement
            $stmt = $conn->prepare("INSERT INTO menu (nama_menu, kategori, harga, stok, deskripsi, gambar) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("ssdisb", $name, $category, $price, $stock, $description, $image);
            
            if ($stmt->execute()) {
                echo json_encode([
                    "status" => "success", 
                    "message" => "Data berhasil ditambahkan",
                    "id" => $stmt->insert_id
                ]);
            } else {
                throw new Exception("Gagal menambahkan data: " . $stmt->error);
            }
            $stmt->close();
            break;

        case 'GET':
          // Di bagian GET
          if ($_SERVER['REQUEST_METHOD'] == 'GET') {
              if (isset($_GET['id_menu'])) {
                  // Ambil item spesifik berdasarkan ID
                  $id = intval($_GET['id_menu']);
                  $stmt = $conn->prepare("SELECT * FROM menu WHERE id_menu = ?");
                  $stmt->bind_param("i", $id);
                  $stmt->execute();
                  $result = $stmt->get_result();
                  $item = $result->fetch_assoc();
                  
                  // Konversi gambar ke base64
                  if ($item['gambar']) {
                      $item['gambar'] = base64_encode($item['gambar']);
                  }
                  
                  echo json_encode($item);
                  exit;
              } else {
                  // Ambil semua item
                  $result = $conn->query("SELECT * FROM menu");
                  $data = [];
                  while ($row = $result->fetch_assoc()) {
                      // Konversi gambar ke base64
                      if ($row['gambar']) {
                          $row['gambar'] = base64_encode($row['gambar']);
                      }
                      $data[] = $row;
                  }
                  echo json_encode($data);
              }
          }
            break;

        case 'PUT':
            // Parse data dari input stream untuk PUT
            parse_str(file_get_contents("php://input"), $put_vars);
            
            $id = filter_var($put_vars['id_menu'], FILTER_VALIDATE_INT);
            $name = validateInput($put_vars['nama_menu'] ?? '');
            $category = validateInput($put_vars['kategori'] ?? '');
            $price = filter_var($put_vars['harga'], FILTER_VALIDATE_FLOAT);
            $stock = filter_var($put_vars['stok'], FILTER_VALIDATE_INT);
            $description = validateInput($put_vars['deskripsi'] ?? '');

            if (!$id || empty($name) || empty($category) || $price === false || $stock === false) {
                throw new Exception("Data tidak valid");
            }

            $stmt = $conn->prepare("UPDATE menu SET nama_menu = ?, kategori = ?, harga = ?, stok = ?, deskripsi = ? WHERE id_menu = ?");
            $stmt->bind_param("ssdisi", $name, $category, $price, $stock, $description, $id);
            
            if ($stmt->execute()) {
                echo json_encode([
                    "status" => "success", 
                    "message" => "Data berhasil diupdate"
                ]);
            } else {
                throw new Exception("Gagal update data: " . $stmt->error);
            }
            $stmt->close();
          break;

        // Tambahkan di PHP untuk mendukung DELETE
        case 'DELETE':
          $data = json_decode(file_get_contents("php://input"), true);
          $id = $data['id_menu'] ?? null;

          if (!$id) {
              echo json_encode([
                  "status" => "error", 
                  "message" => "ID menu diperlukan"
              ]);
              exit;
          }

          $stmt = $conn->prepare("DELETE FROM menu WHERE id_menu = ?");
          $stmt->bind_param("i", $id);
          
          if ($stmt->execute()) {
              echo json_encode([
                  "status" => "success", 
                  "message" => "Menu berhasil dihapus"
              ]);
          } else {
              echo json_encode([
                  "status" => "error", 
                  "message" => "Gagal menghapus menu"
              ]);
          }
          break;

        default:
            throw new Exception("Metode tidak diizinkan");
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => "error", 
        "message" => $e->getMessage()
    ]);
}

// Tutup koneksi
$conn->close();
?>