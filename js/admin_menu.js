const apiUrl = 'http://localhost/PemrogramanWebsiteTeoriProject/BE/admin_menu.php';

// Fungsi untuk menampilkan toast/pemberitahuan
function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px;
        margin-bottom: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        max-width: 300px;
        transform: translateX(120%);
        transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out;
        opacity: 0;
        z-index: 9999;
    `;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Slide in dan fade in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    });

    // Slide out dan hapus
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}

// Fungsi untuk membuka modal tambah menu
function openAddModal() {
    document.getElementById('menu-id').value = ''; // Reset form
    document.getElementById('modal-title').innerText = 'Tambah Item Menu Baru';
    document.getElementById('menu-form').reset();
    document.getElementById('menu-modal').style.display = 'block';
}

// Fungsi untuk menutup modal
function closeModal() {
    document.getElementById('menu-modal').style.display = 'none';
}

// Variabel global untuk menyimpan ID menu yang akan dihapus
let menuToDeleteId = null;

// Fungsi untuk menampilkan modal konfirmasi
function showDeleteConfirmationModal(id_menu) {
    menuToDeleteId = id_menu;
    const confirmModal = document.getElementById('delete-confirmation-modal');
    confirmModal.style.display = 'block';
}

// Fungsi untuk menutup modal konfirmasi
function closeDeleteConfirmationModal() {
    const confirmModal = document.getElementById('delete-confirmation-modal');
    confirmModal.style.display = 'none';
    menuToDeleteId = null;
}

// Fungsi untuk mengambil menu dari database dan menampilkannya
function fetchMenuItems() {
    fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const menuTableBody = document.getElementById('menu-table-body');
        menuTableBody.innerHTML = ''; // Clear previous rows

        if (data && data.length > 0) {
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.id_menu}</td>
                    <td>${item.nama_menu}</td>
                    <td>${item.kategori}</td>
                    <td>Rp ${parseFloat(item.harga).toLocaleString('id-ID')}</td>
                    <td>${item.stok}</td>
                    <td>${item.deskripsi || 'Tidak ada deskripsi'}</td>
                    <td>
                        ${item.gambar ? `<img src="../BE/uploadsMenu/${item.gambar}" width="50" alt="${item.nama_menu}">` : 'Tidak ada gambar'}
                    </td>
                    <td>
                        <button onclick="editMenu(${item.id_menu})">Edit</button>
                        <button onclick="deleteMenu(${item.id_menu})">Hapus</button>
                    </td>
                `;
                menuTableBody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="8" class="text-center">Tidak ada item menu</td>`;
            menuTableBody.appendChild(row);
        }
    })
    .catch(error => {
        console.error('Error fetching menu items:', error);
        showToast('Gagal mengambil data menu', 'error');
    });
}

// Fungsi untuk mengedit menu
function editMenu(id_menu) {
    fetch(`${apiUrl}?id_menu=${id_menu}`, {
        method: 'GET',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data) {
            const menu = data.find(item => item.id_menu == id_menu);
            if (menu) {
                document.getElementById('menu-id').value = menu.id_menu;
                document.getElementById('nama_menu').value = menu.nama_menu;
                document.getElementById('kategori').value = menu.kategori;
                document.getElementById('harga').value = menu.harga;
                document.getElementById('stok').value = menu.stok;
                document.getElementById('deskripsi').value = menu.deskripsi;
                document.getElementById('modal-title').innerText = 'Edit Item Menu';
                document.getElementById('menu-modal').style.display = 'block';
            }
        }
    })
    .catch(error => {
        console.error('Error fetching menu item:', error);
        showToast('Gagal mengambil detail menu', 'error');
    });
}

// Fungsi untuk menghapus menu
function confirmDeleteMenu() {
    if (menuToDeleteId) {
        fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id_menu=${menuToDeleteId}`
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Close modal first
            closeDeleteConfirmationModal();
            
            // Ensure async operation
            return new Promise(resolve => {
                // Slight delay to allow UI to update
                setTimeout(() => {
                    resolve(data);
                }, 100);
            });
        })
        .then(data => {
            if (data.status === 'success') {
                showToast('Item menu berhasil dihapus');
                fetchMenuItems(); // Refresh tabel
            } else {
                showToast(data.message || 'Gagal menghapus item menu', 'error');
            }
        })
        .catch(error => {
            console.error('Error deleting menu item:', error);
            showToast('Gagal menghapus item menu', 'error');
        });
    }
}

// Fungsi untuk menampilkan modal konfirmasi delete
function deleteMenu(id_menu) {
    showDeleteConfirmationModal(id_menu);
}

// Fungsi untuk membuat modal konfirmasi delete
function createDeleteConfirmationModal() {
    const modal = document.createElement('div');
    modal.id = 'delete-confirmation-modal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.4);
    `;

    modal.innerHTML = `
        <div style="
            background-color: #fefefe;
            margin: 15% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 500px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        ">
            <h2 style="color: #333; margin-bottom: 20px;">Konfirmasi Penghapusan</h2>
            <p style="color: #666; margin-bottom: 30px;">Apakah Anda yakin ingin menghapus item menu ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div style="display: flex; justify-content: center; gap: 15px;">
                <button onclick="closeDeleteConfirmationModal()" style="
                    background-color: #f0f0f0;
                    color: #333;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                " onmouseover="this.style.backgroundColor='#e0e0e0'" 
                   onmouseout="this.style.backgroundColor='#f0f0f0'">
                    Batal
                </button>
                <button onclick="confirmDeleteMenu()" style="
                    background-color: #f44336;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                " onmouseover="this.style.backgroundColor='#d32f2f'" 
                   onmouseout="this.style.backgroundColor='#f44336'">
                    Hapus
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Fungsi untuk submit form (add or update menu)
document.getElementById('menu-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const isUpdate = formData.get('id_menu') ? true : false;
    const url = apiUrl;

    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Close modal first
        closeModal();

        // Create a promise to ensure async operation
        return new Promise(resolve => {
            // Slight delay to allow UI to update
            setTimeout(() => {
                resolve(data);
            }, 100);
        });
    })
    .then(data => {
        if (data.status === 'success') {
            // Tambahkan pesan yang berbeda untuk tambah atau update
            const message = isUpdate 
                ? 'Item menu berhasil diperbarui' 
                : 'Item menu berhasil ditambahkan';
            
            showToast(message);
            fetchMenuItems(); // Refresh the table after submit
        } else {
            showToast(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error submitting form:', error);
        showToast('Terjadi kesalahan saat menyimpan menu', 'error');
    });
});

// Event listener untuk menutup modal jika diklik di luar area modal
document.addEventListener('click', function(event) {
    const deleteModal = document.getElementById('delete-confirmation-modal');
    if (event.target === deleteModal) {
        closeDeleteConfirmationModal();
    }
});

// Inisialisasi saat halaman dimuat
window.addEventListener('DOMContentLoaded', () => {
    createDeleteConfirmationModal();
    fetchMenuItems();
});