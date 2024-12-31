// Mendapatkan keranjang yang sudah ada di localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Menangani klik pada tombol "Add to Cart"
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const name = e.target.getAttribute('data-name');
        const price = parseFloat(e.target.getAttribute('data-price'));
        const quantity = 1;

        // Mengecek apakah item sudah ada dalam keranjang
        let existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, quantity });
        }

        // Menyimpan keranjang kembali ke localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    });
});

// Fungsi untuk memperbarui tampilan keranjang
function updateCartDisplay() {
    const cartDisplay = document.getElementById('cart');
    cartDisplay.innerHTML = '';

    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        cartDisplay.innerHTML += `<div>${item.name} - ${item.quantity} x ${item.price}</div>`;
    });

    cartDisplay.innerHTML += `<div>Total: ${total}</div>`;
}

// Memperbarui tampilan keranjang saat halaman dimuat
document.addEventListener('DOMContentLoaded', updateCartDisplay);
