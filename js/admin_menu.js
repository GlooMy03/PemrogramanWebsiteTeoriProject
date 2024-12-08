const apiUrl = 'http://localhost/PemrogramanWebsiteTeoriProject/BE/admin_menu.php';

// Fungsi untuk membuka modal
function openAddModal() {
    document.getElementById('menu-id').value = ''; // Reset form
    document.getElementById('modal-title').innerText = 'Add New Menu Item';
    document.getElementById('menu-form').reset();
    document.getElementById('menu-modal').style.display = 'block';
}

// Fungsi untuk menutup modal
function closeModal() {
    document.getElementById('menu-modal').style.display = 'none';
}

// Fungsi untuk mengambil menu dari database dan menampilkannya
function fetchMenuItems() {
    fetch(apiUrl)
    .then(response => response.json())
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
                        ${item.gambar ? `<img src="uploads/${item.gambar}" width="50" alt="${item.nama_menu}">` : 'Tidak ada gambar'}
                    </td>
                    <td>
                        <button onclick="editMenu(${item.id_menu})">Edit</button>
                        <button onclick="deleteMenu(${item.id_menu})">Delete</button>
                    </td>
                `;
                menuTableBody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="8">Tidak ada item menu</td>`;
            menuTableBody.appendChild(row);
        }
    })
    .catch(error => {
        console.error('Error fetching menu items:', error);
        alert('Gagal mengambil data menu');
    });
}

// Fungsi untuk mengedit menu
function editMenu(id_menu) {
    fetch(`${apiUrl}?id_menu=${id_menu}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.length > 0) {
            const menu = data[0];
            document.getElementById('menu-id').value = menu.id_menu;
            document.getElementById('nama_menu').value = menu.nama_menu;
            document.getElementById('kategori').value = menu.kategori;
            document.getElementById('harga').value = menu.harga;
            document.getElementById('stok').value = menu.stok;
            document.getElementById('deskripsi').value = menu.deskripsi;
            document.getElementById('modal-title').innerText = 'Edit Item Menu';
            document.getElementById('menu-modal').style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error fetching menu item:', error);
        alert('Gagal mengambil detail menu');
    });
}

// Fungsi untuk menghapus menu
function deleteMenu(id_menu) {
    if (confirm('Apakah Anda yakin ingin menghapus item menu ini?')) {
        fetch(`${apiUrl}?id_menu=${id_menu}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Item menu berhasil dihapus');
                fetchMenuItems(); // Refresh tabel
            } else {
                alert('Gagal menghapus item menu: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting menu item:', error);
            alert('Gagal menghapus item menu');
        });
    }
}

// Fungsi untuk submit form (add or update menu)
document.getElementById('menu-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const method = formData.get('id_menu') ? 'POST' : 'POST'; // POST for both add and update
    const url = formData.get('id_menu') ? apiUrl : apiUrl;

    fetch(url, {
        method: method,
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            fetchMenuItems(); // Refresh the table after submit
            closeModal(); // Close modal
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error submitting form:', error);
    });
});

// Fetch menu items when the page loads
window.onload = fetchMenuItems;
