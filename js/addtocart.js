
document.addEventListener("DOMContentLoaded", function () {
    // Ambil semua tombol "add-to-cart"
    const addToCartButtons = document.querySelectorAll(".add-to-cart");

    addToCartButtons.forEach((button, index) => {
        button.addEventListener("click", function () {
            // Ambil informasi menu terkait
            const menuItem = this.closest(".menuMKN-item");
            const title = menuItem.querySelector(".menu-item-title").textContent;
            const price = menuItem.querySelector(".menu-item-price").textContent;
            const category = menuItem.querySelector(".menu-item-category").textContent;

            // Buat objek menu
            const item = { title, price, category };

            // Ambil data sebelumnya dari Local Storage
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            cart.push(item);

            // Simpan kembali ke Local Storage
            localStorage.setItem("cart", JSON.stringify(cart));

            alert(`${title} berhasil ditambahkan ke keranjang!`);
        });
    });
});

