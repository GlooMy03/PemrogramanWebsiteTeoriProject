<?php
require_once 'db.php'; // Pastikan Anda sudah mengatur koneksi database di file db.php

// Menerima data JSON dari request body
$data = json_decode(file_get_contents('php://input'), true);

// Memeriksa apakah data valid
if (isset($data['userId']) && isset($data['items']) && count($data['items']) > 0) {
    $userId = $data['userId'];
    $items = $data['items'];
    $totalAmount = $data['totalAmount'];
    $orderType = $data['orderType'];
    $reservationName = isset($data['reservationName']) ? $data['reservationName'] : NULL;
    $numberOfPeople = isset($data['numberOfPeople']) ? $data['numberOfPeople'] : NULL;
    $arrivalTime = isset($data['arrivalTime']) ? $data['arrivalTime'] : NULL;

    // Mulai transaksi
    $mysqli->begin_transaction();

    try {
        // Menyimpan data pesanan ke tabel ordermenu
        $stmt = $mysqli->prepare("INSERT INTO ordermenu (id_customer, tipe_order, nama_reservasi, jumlah_orang, jam_datang, status, status_bayar, total_harga) 
                                  VALUES (?, ?, ?, ?, ?, 'Pending', 'Unpaid', ?)");
        $stmt->bind_param("isssd", $userId, $orderType, $reservationName, $numberOfPeople, $arrivalTime, $totalAmount);
        $stmt->execute();
        $orderId = $stmt->insert_id; // ID pesanan yang baru saja dimasukkan

        // Menyimpan detail pesanan ke tabel orderdetail
        foreach ($items as $item) {
            $stmt = $mysqli->prepare("INSERT INTO orderdetail (id_order, id_menu, jumlah, harga) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("iiid", $orderId, $item['menuId'], $item['quantity'], $item['price']);
            $stmt->execute();
        }

        // Commit transaksi
        $mysqli->commit();

        // Menutup statement dan koneksi
        $stmt->close();
        $mysqli->close();

        // Mengirimkan respon sukses
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        // Rollback transaksi jika terjadi error
        $mysqli->rollback();

        // Mengirimkan respon gagal
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
}
?>
