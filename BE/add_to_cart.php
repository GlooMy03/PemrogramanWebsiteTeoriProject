<?php
require_once 'db.php'; // Pastikan jalurnya benar

// Kirim header CORS terlebih dahulu
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

file_put_contents('debug.log', "POST Data: " . json_encode($_POST) . "\n", FILE_APPEND);
file_put_contents('debug.log', "Raw Input: " . file_get_contents('php://input') . "\n", FILE_APPEND);


// Tangani preflight request (OPTIONS method)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Pastikan session hanya dimulai sekali
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Log untuk debugging
file_put_contents('debug.log', "Request Method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);

// Tangani input JSON jika $_POST kosong
if (empty($_POST)) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (is_array($input)) {
        $_POST = $input;
    }
}

// Proses hanya jika metode adalah POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    file_put_contents('debug.log', "POST Data: " . json_encode($_POST) . "\n", FILE_APPEND);
    
    // Validasi input
    if (
        !isset($_POST['id_customer'], $_POST['id_menu'], $_POST['quantity']) || 
        empty(trim($_POST['id_customer'])) || 
        empty(trim($_POST['id_menu'])) || 
        empty(trim($_POST['quantity']))
    ) {
        $response = [
            'status' => 'error',
            'message' => 'Semua input wajib diisi!'
        ];
        echo json_encode($response);
        exit;
    }

    $id_customer = $_POST['id_customer'];
    $id_menu = $_POST['id_menu'];
    $quantity = intval($_POST['quantity']);

    // Validasi jumlah
    if ($quantity <= 0) {
        $response = [
            'status' => 'error',
            'message' => 'Jumlah harus lebih dari 0!'
        ];
        echo json_encode($response);
        exit;
    }

    try {
        // Cek menu dan ambil harga
        $menu_query = "SELECT harga FROM menu WHERE id_menu = :id_menu";
        $stmt = $conn->prepare($menu_query);
        $stmt->bindParam(':id_menu', $id_menu, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $menu = $stmt->fetch(PDO::FETCH_ASSOC);
            $price = $menu['harga'];

            // Hitung total harga
            $total_price = $price * $quantity;

            // Insert ke tabel cart
            $insert_cart = "INSERT INTO cart (id_customer, id_menu, quantity, price) 
                            VALUES (:id_customer, :id_menu, :quantity, :price)";
            $stmt = $conn->prepare($insert_cart);
            $stmt->bindParam(':id_customer', $id_customer, PDO::PARAM_INT);
            $stmt->bindParam(':id_menu', $id_menu, PDO::PARAM_INT);
            $stmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
            $stmt->bindParam(':price', $total_price, PDO::PARAM_STR);

            if ($stmt->execute()) {
                // Menyimpan item ke session 'cart'
                if (!isset($_SESSION['cart'])) {
                    $_SESSION['cart'] = []; // Jika session cart belum ada, buat array kosong
                }

                // Menambahkan item ke dalam cart di session
                $_SESSION['cart'][$id_menu] = [
                    'id_menu' => $id_menu,
                    'quantity' => $quantity,
                    'price' => $price,
                    'total_price' => $total_price
                ];

                $response = [
                    'status' => 'success',
                    'message' => 'Menu berhasil ditambahkan ke cart!',
                    'cart' => $_SESSION['cart']
                ];
            } else {
                $response = [
                    'status' => 'error',
                    'message' => 'Gagal menambahkan menu ke cart!'
                ];
            }
        } else {
            $response = [
                'status' => 'error',
                'message' => 'Menu tidak ditemukan!'
            ];
        }
    } catch (PDOException $e) {
        $response = [
            'status' => 'error',
            'message' => 'Terjadi kesalahan pada server: ' . $e->getMessage()
        ];
    }

    // Kirim response JSON
    echo json_encode($response);
} else {
    $response = [
        'status' => 'error',
        'message' => 'Metode HTTP tidak didukung!'
    ];
    echo json_encode($response);
}
?>
