const apiUrl = 'http://localhost/php_folder_praktikum/teoriweb/PemrogramanWebsiteTeoriProject/BE/admin_users.php';

// Fungsi untuk menampilkan pemberitahuan (toast)
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

    setTimeout(() => toast.remove(), 3000);
}

// Fungsi untuk memuat data pengguna
async function loadUsers() {
    try {
        const response = await fetch(apiUrl);
        const users = await response.json();

        const userTableBody = document.getElementById('user-table-body');
        userTableBody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id_user}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.password}</td>
                <td>
                    <button class="edit-button" onclick="editUser(${user.id_user})">Edit</button>
                    <button onclick="deleteUser(${user.id_user})">Delete</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
    } catch (error) {
        showToast('Gagal memuat data pengguna', 'error');
    }
}

function editUser(id_user) {
    // Temukan data user berdasarkan ID
    fetch(apiUrl)
        .then(response => response.json())
        .then(users => {
            const user = users.find(user => user.id_user === id_user);
            if (user) {
                // Isi data user di modal
                document.getElementById('user-id').value = user.id_user;
                document.getElementById('username').value = user.username;
                document.getElementById('email').value = user.email;
                document.getElementById('password').value = ''; // Kosongkan password untuk keamanan

                // Tampilkan modal
                document.getElementById('user-modal').style.display = 'block';
            } else {
                showToast('Pengguna tidak ditemukan', 'error');
            }
        })
        .catch(error => {
            showToast('Gagal memuat data pengguna', 'error');
        });
}


// Fungsi untuk menyimpan pengguna (tambah/edit)
async function saveUser(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (result.status === 'success') {
            showToast(result.message);
            document.getElementById('user-modal').style.display = 'none';
            loadUsers();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Gagal menyimpan data pengguna', 'error');
    }
}

// Fungsi untuk menghapus pengguna
async function deleteUser(id_user) {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
        try {
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_user }),
            });

            const result = await response.json();
            if (result.status === 'success') {
                showToast(result.message);
                loadUsers();
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast('Gagal menghapus pengguna', 'error');
        }
    }
}

// Fungsi untuk menutup modal
function closeModal() {
    document.getElementById('user-modal').style.display = 'none';
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();

    const form = document.getElementById('user-form');
    form.addEventListener('submit', saveUser);
});
