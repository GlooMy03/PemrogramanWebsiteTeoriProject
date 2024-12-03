const menuTableBody = document.getElementById("menu-table-body");
const saveButton = document.getElementById("save-button");
const modal = document.getElementById("menu-modal");

// Fetch menu items from the backend
async function fetchMenuItems() {
    try {
        const response = await fetch('http://localhost/php_folder_praktikum/teoriweb/PemrogramanWebsiteTeoriProject/BE/admin_menu.php');
        const menuItems = await response.json();
        renderMenuItems(menuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
    }
}

// Render menu items in the table
function renderMenuItems(menuItems) {
    menuTableBody.innerHTML = '';
    menuItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id_menu}</td>
            <td>${item.nama_menu}</td>
            <td>${item.kategori}</td>
            <td>Rp ${item.harga.toLocaleString()}</td>
            <td>${item.stok}</td>
            <td>${item.deskripsi}</td>
            <td><img src="data:image/jpeg;base64,${item.gambar}" alt="${item.nama_menu}" width="100"></td>
            <td>
                <button onclick="openEditModal(${item.id_menu})">Edit</button>
                <button onclick="deleteMenuItem(${item.id_menu})">Delete</button>
            </td>
        `;
        menuTableBody.appendChild(row);
    });
}

// Open the add menu modal
function openAddModal() {
    document.getElementById('modal-title').textContent = 'Add New Menu Item';
    document.getElementById('menu-form').reset();
    modal.style.display = 'block';
}

// Open the edit modal with the current menu item data
function openEditModal(id) {
    fetch(`http://localhost/php_folder_praktikum/teoriweb/PemrogramanWebsiteTeoriProject/BE/admin_menu.php?id_menu=${id}`)
        .then(response => response.json())
        .then(item => {
            document.getElementById('modal-title').textContent = 'Edit Menu Item';
            document.getElementById('menu-id').value = item.id_menu;
            document.getElementById('name').value = item.nama_menu;
            document.getElementById('category').value = item.kategori;
            document.getElementById('price').value = item.harga;
            document.getElementById('stock').value = item.stok;
            document.getElementById('description').value = item.deskripsi;
            modal.style.display = 'block';
        })
        .catch(error => console.error('Error fetching menu item:', error));
}

// Close the modal
function closeModal() {
    modal.style.display = 'none';
}

// Save a new or updated menu item
// Modifikasi fungsi saveButton
saveButton.addEventListener('click', async (event) => {
    event.preventDefault();

    // Validasi input
    const name = document.getElementById('name').value.trim();
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const stock = document.getElementById('stock').value;
    const description = document.getElementById('description').value.trim();
    const image = document.getElementById('image').files[0];

    // Validasi input
    if (!name || !category || !price || !stock || !description) {
        alert('Mohon lengkapi semua field');
        return;
    }

    if (image && !['image/jpeg', 'image/png', 'image/gif'].includes(image.type)) {
        alert('Format gambar tidak valid. Gunakan JPEG, PNG, atau GIF.');
        return;
    }

    const formData = new FormData();
    formData.append('nama_menu', name);
    formData.append('kategori', category);
    formData.append('harga', price);
    formData.append('stok', stock);
    formData.append('deskripsi', description);
    
    // Tambahkan gambar hanya jika dipilih
    if (image) {
        formData.append('gambar', image);
    }

    const id = document.getElementById('menu-id').value;
    const url = id 
        ? `http://localhost/php_folder_praktikum/teoriweb/PemrogramanWebsiteTeoriProject/BE/admin_menu.php?id_menu=${id}`
        : 'http://localhost/php_folder_praktikum/teoriweb/PemrogramanWebsiteTeoriProject/BE/admin_menu.php';
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            body: formData
        });

        const result = await response.json();

        if (result.status === 'success') {
            alert(result.message);
            closeModal();
            fetchMenuItems();
        } else {
            alert(`Gagal: ${result.message}`);
        }
    } catch (error) {
        console.error('Error saving menu item:', error);
        alert('Terjadi kesalahan saat menyimpan item menu');
    }
});

// Modifikasi fungsi deleteMenuItem
async function deleteMenuItem(id) {
    const confirmation = confirm("Apakah Anda yakin ingin menghapus item menu ini?");
    if (!confirmation) return;

    try {
        const response = await fetch('http://localhost/php_folder_praktikum/teoriweb/PemrogramanWebsiteTeoriProject/BE/admin_menu.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_menu: id })
        });

        const result = await response.json();

        if (result.status === 'success') {
            alert(result.message);
            fetchMenuItems();
        } else {
            alert(`Gagal: ${result.message}`);
        }
    } catch (error) {
        console.error('Error deleting menu item:', error);
        alert('Terjadi kesalahan saat menghapus item menu');
    }
}

// Initial fetch
fetchMenuItems();
