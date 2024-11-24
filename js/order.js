// Item prices (in Rupiah)
const prices = {
  'mie-gacoan': 15000,
  'siomay': 12000,
  'es-milo': 8000
};

// Format number to Rupiah
function formatRupiah(number) {
  return 'Rp ' + number.toLocaleString('id-ID');
}

// Calculate total for a single item
function calculateItemTotal(quantity, pricePerItem) {
  return quantity * pricePerItem;
}

// Update display for a single item
function updateItemDisplay(itemElement, quantity) {
  const itemId = itemElement.dataset.id;
  const price = prices[itemId];
  const total = calculateItemTotal(quantity, price);
  
  itemElement.querySelector('.quantity').textContent = quantity;
  itemElement.querySelector('.item-total').textContent = formatRupiah(total);
}

// Calculate and update cart totals
function updateCartTotals() {
  let subtotal = 0;
  
  // Calculate subtotal
  document.querySelectorAll('.food-item').forEach(item => {
      const itemId = item.dataset.id;
      const quantity = parseInt(item.querySelector('.quantity').textContent);
      subtotal += calculateItemTotal(quantity, prices[itemId]);
  });
  
  // Calculate tax and total
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;
  
  // Update display
  document.getElementById('subtotal').textContent = formatRupiah(subtotal);
  document.getElementById('tax').textContent = formatRupiah(tax);
  document.getElementById('total').textContent = formatRupiah(total);
}

// Initialize cart functionality
function initializeCart() {
  document.querySelectorAll('.food-item').forEach(item => {
      const minusBtn = item.querySelector('.minus');
      const plusBtn = item.querySelector('.plus');
      const quantityDisplay = item.querySelector('.quantity');
      
      minusBtn.addEventListener('click', () => {
          let quantity = parseInt(quantityDisplay.textContent);
          if (quantity > 1) {
              quantity--;
              updateItemDisplay(item, quantity);
              updateCartTotals();
          }
      });
      
      plusBtn.addEventListener('click', () => {
          let quantity = parseInt(quantityDisplay.textContent);
          if (quantity < 10) { // Maximum 10 items per food item
              quantity++;
              updateItemDisplay(item, quantity);
              updateCartTotals();
          }
      });
  });
  
  // Initial calculation
  updateCartTotals();
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', initializeCart);

// Handle coupon application
document.getElementById('applyCouponButton')?.addEventListener('click', function() {
  const couponInput = document.getElementById('inputCode');
  const couponCode = couponInput.value.trim().toUpperCase();
  
  // Example coupon logic
  if (couponCode === 'FIRST10') {
      const currentTotal = parseInt(document.getElementById('total').textContent.replace(/[^0-9]/g, ''));
      const discount = currentTotal * 0.1; // 10% discount
      const newTotal = currentTotal - discount;
      
      document.getElementById('total').textContent = formatRupiah(newTotal);
      alert('Coupon applied successfully! 10% discount applied.');
  } else {
      alert('Invalid coupon code.');
  }
});
document.addEventListener("DOMContentLoaded", function () {
    const cartItemsContainer = document.getElementById("cartItems");

    // Ambil data dari Local Storage
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Keranjang kosong!</p>";
    } else {
        // Render item ke dalam keranjang
        cart.forEach((item, index) => {
            const listItem = document.createElement("li");
            listItem.classList.add("food-item");
            listItem.innerHTML = `
                <li class="food-item" data-id="${item.id}">
                    <img src="assets/${item.image}" alt="${item.title}" width="80" height="80">
                    <div class="food-item-details">
                        <span class="food-name">${item.title}</span>
                        <span class="food-price">${item.price}</span>
                        <span class="food-category">${item.category}</span>
                    </div>
                    <div class="quantity-control">
                        <button class="qty-btn minus">-</button>
                        <span class="quantity">1</span>
                        <button class="qty-btn plus">+</button>
                    </div>
                    <span class="item-total">${item.price}</span>
                    <button class="remove-item" data-index="${index}">Hapus</button>
                </li>

                <style>
                .food-item {
                    display: grid;
                    grid-template-columns: auto 1fr auto auto;
                    gap: 1.5rem;
                    align-items: center;
                    padding: 1rem;
                    border-bottom: 1px solid #eee;
                    }

                    .food-item-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                    }

                    .food-name {
                    font-weight: 500;
                    color: #333;
                    }

                    .food-price {
                    color: #666;
                    font-size: 0.9rem;
                    }

                    .quantity-control {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    }

                    .qty-btn {
                    width: 30px;
                    height: 30px;
                    border: 1px solid #FF0099;
                    background: white;
                    color: #FF0099;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    }

                    .qty-btn:hover {
                    background: #FF0099;
                    color: white;
                    }

                    .quantity {
                    min-width: 30px;
                    text-align: center;
                    font-weight: 500;
                    }
                </style>
            `;
            cartItemsContainer.appendChild(listItem);
        });

        // Tambahkan event listener untuk tombol hapus
        document.querySelectorAll(".remove-item").forEach((button) => {
            button.addEventListener("click", function () {
                const index = this.getAttribute("data-index");
                cart.splice(index, 1); // Hapus item dari array
                localStorage.setItem("cart", JSON.stringify(cart)); // Perbarui Local Storage
                location.reload(); // Refresh halaman
            });
        });
    }
});
document.getElementById("checkoutType").addEventListener("change", optionSelect);
// Update Payment Info based on checkout type
function optionSelect() {
  
  const checkoutType = document.getElementById("checkoutType").value;
  const infoCheckout = document.getElementById("info-checkout");

  if (checkoutType === "orderOnline") {
      infoCheckout.innerHTML = `
            <div class="d-flex flex-column align-items-center">
                <h2 class="playfair mb-4">Payment Info</h2>
                  <div class="d-flex justify-content-around align-items-center w-100">
                      <div class="text-center">
                          <img src="../html/assets/shopeefood.png" alt="ShopeeFood Logo" style="width: 80px; height: auto;">
                          <p>ShopeeFood</p>
                      </div>
                      <div class="text-center">
                          <img src="../html/assets/gofood.png" alt="GoFood Logo" style="width: 80px; height: auto;">
                          <p>GoFood</p>
                      </div>
                  </div>
              </div>
              <style>
                /* Container utama yang menampung judul dan logo */
                .d-flex.flex-column {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }

                /* Judul Payment Info */
                h2.playfair {
                    font-family: 'Playfair Display', serif;
                    margin-bottom: 20px; /* Jarak antara judul dan logo */
                    font-size: 2rem;
                }

                /* Container untuk logo ShopeeFood dan GoFood */
                .d-flex.justify-content-around {
                    display: flex;
                    justify-content: center;
                    gap: 20px; /* Memberi jarak antar logo */
                    width: 100%; /* Mengatur agar container bisa menyesuaikan lebar */
                    flex-wrap: wrap; /* Membuat elemen membungkus jika lebar layar kecil */
                }

                /* Style untuk tiap logo */
                .d-flex.justify-content-around .text-center {
                    text-align: center;
                }

                /* Gambar logo */
                .logo-img {
                    width: 80px;
                    height: auto;
                    margin-bottom: 10px; /* Memberikan jarak antara gambar dan teks */
                }

                /* Memberikan jarak pada teks di bawah logo */
                .d-flex.justify-content-around p {
                    font-size: 1rem;
                    margin: 0;
                    font-weight: bold;
                }
              </style>

      `;
  } else if (checkoutType === "takeoutOrder") {
      infoCheckout.innerHTML = `
               <div class="d-flex flex-column align-items-center">
                <h2 class="playfair mb-4">Payment Info</h2>
                  <div class="container">
                    <form action="#">
                        <div class="form-group">
                            <label for="name">Nama</label>
                            <input type="text" id="name" placeholder="Enter your name">
                        </div>
                    <h2 class="playfair mb-4">Mohon Bayar Dulu</h2>
                    <div class="d-flex justify-content-around align-items-center w-100">
                        <div class="text-center">
                            <img src="../html/assets/qris.png" alt="QRIS Logo" class="logo-img">
                        </div>
                                        <label for="name">Mohon ditunggu pesanannya, nanti dipanggil</label>

                    </div>

                </div>
                        <button type="submit">Send</button>
                    </form>
                  </div>
            </div>
            <style>
            /* Container utama yang menampung judul dan form */
              .d-flex.flex-column {
                 display: flex;
                  flex-direction: column;
                  align-items: center;
                  text-align: center;
              }

              /* Judul Payment Info */
              h2.playfair {
                  font-family: 'Playfair Display', serif;
                  margin-bottom: 20px; /* Jarak antara judul dan form */
                  font-size: 2rem;
              }

              /* Form Container */
              .container {
                  width: 100%;
                  max-width: 600px;  /* Membatasi lebar form */
                  padding: 20px;
                  border: 1px solid #ccc;  /* Memberikan garis batas di sekitar form */
                  border-radius: 8px;
                  background-color: #f9f9f9; /* Warna latar belakang untuk form */
              }

              /* Setiap grup form */
              .form-group {
                  margin-bottom: 15px;
                  text-align: left;
              }

              /* Label dan input */
              .form-group label {
                  display: block;
                  font-size: 1rem;
                  font-weight: bold;
                  margin-bottom: 5px;
              }

              .form-group input,
              .form-group textarea {
                  width: 100%;
                  padding: 10px;
                  font-size: 1rem;
                  border: 1px solid #ccc;
                  border-radius: 5px;
              }

              .form-group textarea {
                  resize: vertical;  /* Membatasi ukuran textarea agar bisa diperbesar vertikal saja */
                  min-height: 100px;
              }

              /* Tombol kirim */
              button {
                  background-color: #FF0099; /* Warna latar belakang tombol */
                  color: white;
                  padding: 10px 20px;
                  border: none;
                  border-radius: 5px;
                  font-size: 1rem;
                  cursor: pointer;
                  transition: background-color 0.3s ease;
              }

                            /* Container utama yang menampung judul dan logo */
                .d-flex.flex-column {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }

                /* Judul Payment Info */
                h2.playfair {
                    font-family: 'Playfair Display', serif;
                    margin-bottom: 20px; /* Jarak antara judul dan logo */
                    font-size: 2rem;
                }

                /* Container untuk logo QRIS */
                .d-flex.justify-content-around {
                    display: flex;
                    justify-content: center;
                    gap: 20px; /* Memberi jarak antar logo */
                    width: 100%; /* Mengatur agar container bisa menyesuaikan lebar */
                    flex-wrap: wrap; /* Membuat elemen membungkus jika lebar layar kecil */
                }

                /* Style untuk tiap logo */
                .d-flex.justify-content-around .text-center {
                    text-align: center;
                }

                /* Gambar logo QRIS */
                .logo-img {
                    width: 100px;
                    height: auto;
                    margin-bottom: 10px; /* Memberikan jarak antara gambar dan teks */
                }

                /* Memberikan jarak pada teks di bawah logo */
                .d-flex.justify-content-around p {
                    font-size: 1rem;
                    margin: 0;
                    font-weight: bold;
                }


              button:hover {
                  background-color: #FF0099;  /* Efek hover untuk tombol */
              }

              /* Menyusun form di bawah judul dengan jarak yang baik */
              .d-flex.flex-column .container {
                  margin-top: 20px;
              }

            </style>
      `;
  } else if (checkoutType === "dineInOrder") {
      infoCheckout.innerHTML = `
           <div class="d-flex flex-column align-items-center">
                <h2 class="playfair mb-4">Payment Info</h2>
                  <div class="container">
                    <form action="#">
                        <div class="form-group">
                            <label for="name">Nama</label>
                            <input type="text" id="name" placeholder="Enter your name">
                        </div>
                        <div class="form-group">
                            <label for="email">Berapa Orang</label>
                            <input type="email" id="email" placeholder="Enter email address">
                        </div>
                        <div class="form-group">
                            <label for="subject">Jam Datang</label>
                            <input type="text" id="subject" placeholder="Write a subject">
                        </div>
                         <div class="d-flex flex-column align-items-center">
                    <h2 class="playfair mb-4">Mohon Bayar Dulu</h2>
                    <div class="d-flex justify-content-around align-items-center w-100">
                        <div class="text-center">
                            <img src="../html/assets/qris.png" alt="QRIS Logo" class="logo-img">
                        </div>
                        <label for="name">Ketika datang tunjukkan bukti reservasi ke petugas</label>

                    </div>
                </div>
                        <button type="submit">Send</button>
                    </form>
                  </div>
            </div>
            <style>
            /* Container utama yang menampung judul dan form */
              .d-flex.flex-column {
                 display: flex;
                  flex-direction: column;
                  align-items: center;
                  text-align: center;
              }

              /* Judul Payment Info */
              h2.playfair {
                  font-family: 'Playfair Display', serif;
                  margin-bottom: 20px; /* Jarak antara judul dan form */
                  font-size: 2rem;
              }

              /* Form Container */
              .container {
                  width: 100%;
                  max-width: 600px;  /* Membatasi lebar form */
                  padding: 20px;
                  border: 1px solid #ccc;  /* Memberikan garis batas di sekitar form */
                  border-radius: 8px;
                  background-color: #f9f9f9; /* Warna latar belakang untuk form */
              }

              /* Setiap grup form */
              .form-group {
                  margin-bottom: 15px;
                  text-align: left;
              }

              /* Label dan input */
              .form-group label {
                  display: block;
                  font-size: 1rem;
                  font-weight: bold;
                  margin-bottom: 5px;
              }

              .form-group input,
              .form-group textarea {
                  width: 100%;
                  padding: 10px;
                  font-size: 1rem;
                  border: 1px solid #ccc;
                  border-radius: 5px;
              }

              .form-group textarea {
                  resize: vertical;  /* Membatasi ukuran textarea agar bisa diperbesar vertikal saja */
                  min-height: 100px;
              }

              /* Tombol kirim */
              button {
                  background-color: #FF0099; /* Warna latar belakang tombol */
                  color: white;
                  padding: 10px 20px;
                  border: none;
                  border-radius: 5px;
                  font-size: 1rem;
                  cursor: pointer;
                  transition: background-color 0.3s ease;
              }

                            /* Container utama yang menampung judul dan logo */
                .d-flex.flex-column {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }

                /* Judul Payment Info */
                h2.playfair {
                    font-family: 'Playfair Display', serif;
                    margin-bottom: 20px; /* Jarak antara judul dan logo */
                    font-size: 2rem;
                }

                /* Container untuk logo QRIS */
                .d-flex.justify-content-around {
                    display: flex;
                    justify-content: center;
                    gap: 20px; /* Memberi jarak antar logo */
                    width: 100%; /* Mengatur agar container bisa menyesuaikan lebar */
                    flex-wrap: wrap; /* Membuat elemen membungkus jika lebar layar kecil */
                }

                /* Style untuk tiap logo */
                .d-flex.justify-content-around .text-center {
                    text-align: center;
                }

                /* Gambar logo QRIS */
                .logo-img {
                    width: 100px;
                    height: auto;
                    margin-bottom: 10px; /* Memberikan jarak antara gambar dan teks */
                }

                /* Memberikan jarak pada teks di bawah logo */
                .d-flex.justify-content-around p {
                    font-size: 1rem;
                    margin: 0;
                    font-weight: bold;
                }


              button:hover {
                  background-color: #FF0099;  /* Efek hover untuk tombol */
              }

              /* Menyusun form di bawah judul dengan jarak yang baik */
              .d-flex.flex-column .container {
                  margin-top: 20px;
              }

            </style>
      `;
  } else {
      infoCheckout.innerHTML = ""; // Clear content if no option selected
  }
}

