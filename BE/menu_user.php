<?php
require_once 'db.php';  // Pastikan koneksi database sudah ada di db.php

$result = $mysqli->query("SELECT * FROM Menu");

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "<div class='menu-item'>";
        echo "<h3>" . $row['nama_menu'] . "</h3>";
        echo "<p>" . $row['kategori'] . "</p>";
        echo "<p>Rp. " . number_format($row['harga'], 2) . "</p>";
        echo "<button class='add-to-cart' data-id='" . $row['id_menu'] . "' data-name='" . $row['nama_menu'] . "' data-price='" . $row['harga'] . "'>Add to Cart</button>";
        echo "</div>";
    }
} else {
    echo "Menu tidak tersedia.";
}
?>
