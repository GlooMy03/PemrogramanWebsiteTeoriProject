const apiUrl = 'http://localhost/PemrogramanWebsiteTeoriProject/BE/admin_users.php';

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

// Fungsi untuk membuka modal tambah user
function openAddModal() {
    document.getElementById('user-id').value = ''; // Reset form
    document.getElementById('modal-title').innerText = 'Tambah User Baru';
    document.getElementById('user-form').reset();
    document.getElementById('user-modal').style.display = 'block';
}

// Fungsi untuk menutup modal
function closeModal() {
    document.getElementById('user-modal').style.display = 'none';
}

// Variabel global untuk menyimpan ID user yang akan dihapus
let userToDeleteId = null;

// Fungsi untuk menampilkan modal konfirmasi
function showDeleteConfirmationModal(id_user) {
    userToDeleteId = id_user;
    const confirmModal = document.getElementById('delete-confirmation-modal');
    confirmModal.style.display = 'block';
}

// Fungsi untuk menutup modal konfirmasi
function closeDeleteConfirmationModal() {
    const confirmModal = document.getElementById('delete-confirmation-modal');
    confirmModal.style.display = 'none';
    userToDeleteId = null;
}

// Fungsi untuk mengambil users dari database dan menampilkannya
function fetchUsers() {
    fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const usersTableBody = document.getElementById('users-table-body');
        usersTableBody.innerHTML = ''; // Clear previous rows

        if (data && data.length > 0) {
            data.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id_user}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>
                        ${user.foto_profil ? 
                            `<img src="../BE/PP/${user.foto_profil}" width="50" alt="${user.username}">` : 
                            'Tidak ada foto profil'}
                    </td>
                    <td>
                        <button onclick="editUser(${user.id_user})">Edit</button>
                        <button onclick="deleteUser(${user.id_user})">Hapus</button>
                    </td>
                `;
                usersTableBody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="6" class="text-center">Tidak ada user</td>`;
            usersTableBody.appendChild(row);
        }
    })
    .catch(error => {
        console.error('Error fetching users:', error);
        showToast('Gagal mengambil data user', 'error');
    });
}

// Fungsi untuk mengedit user
function editUser(id_user) {
    fetch(`${apiUrl}?id_user=${id_user}`, {
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
            const user = data.find(item => item.id_user == id_user);
            if (user) {
                document.getElementById('user-id').value = user.id_user;
                document.getElementById('username').value = user.username;
                document.getElementById('email').value = user.email;
                document.getElementById('role').value = user.role;
                document.getElementById('modal-title').innerText = 'Edit User';
                document.getElementById('user-modal').style.display = 'block';
            }
        }
    })
    .catch(error => {
        console.error('Error fetching user:', error);
        showToast('Gagal mengambil detail user', 'error');
    });
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
            <p style="color: #666; margin-bottom: 30px;">Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.</p>
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
                <button onclick="confirmDeleteUser()" style="
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

// Fungsi untuk menghapus user
function confirmDeleteUser() {
    if (userToDeleteId) {
        fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id_user=${userToDeleteId}`
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
                showToast('User berhasil dihapus');
                fetchUsers(); // Refresh tabel
            } else {
                showToast(data.message || 'Gagal menghapus user', 'error');
            }
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            showToast('Gagal menghapus user', 'error');
        });
    }
}

// Fungsi untuk menampilkan modal konfirmasi delete
function deleteUser(id_user) {
    showDeleteConfirmationModal(id_user);
}

// Fungsi untuk submit form (add or update user)
document.getElementById('user-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const isUpdate = formData.get('id_user') ? true : false;
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
                ? 'User berhasil diperbarui' 
                : 'User berhasil ditambahkan';
            
            showToast(message);
            fetchUsers(); // Refresh the table after submit
        } else {
            showToast(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error submitting form:', error);
        showToast('Terjadi kesalahan saat menyimpan user', 'error');
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
    fetchUsers();
});