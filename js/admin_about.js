const apiUrl = 'http://localhost/PemrogramanWebsiteTeoriProject/BE/about.php';

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

// Fungsi untuk membuka modal tambah about
function openAddModal() {
    document.getElementById('about-id').value = ''; // Reset form
    document.getElementById('modal-title').innerText = 'Tambah Item About Baru';
    document.getElementById('about-form').reset();
    document.getElementById('about-modal').style.display = 'block';
}

// Fungsi untuk menutup modal
function closeModal() {
    document.getElementById('about-modal').style.display = 'none';
}

// Variabel global untuk menyimpan ID about yang akan dihapus
let aboutToDeleteId = null;

// Fungsi untuk menampilkan modal konfirmasi
function showDeleteConfirmationModal(id_about) {
    aboutToDeleteId = id_about;
    const confirmModal = document.createElement('div');
    confirmModal.id = 'delete-confirmation-modal';
    confirmModal.style.cssText = `
        display: block;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.4);
    `;

    confirmModal.innerHTML = `
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
            <p style="color: #666; margin-bottom: 30px;">Apakah Anda yakin ingin menghapus item About ini? Tindakan ini tidak dapat dibatalkan.</p>
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
                <button onclick="confirmDeleteAbout()" style="
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

    document.body.appendChild(confirmModal);
}

// Fungsi untuk menutup modal konfirmasi
function closeDeleteConfirmationModal() {
    const confirmModal = document.getElementById('delete-confirmation-modal');
    if (confirmModal) {
        confirmModal.remove();
    }
    aboutToDeleteId = null;
}

// Fungsi untuk mengambil about dari database dan menampilkannya
function fetchAboutItems() {
    fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const aboutTableBody = document.getElementById('about-table-body');
        aboutTableBody.innerHTML = ''; // Clear previous rows

        if (data && data.length > 0) {
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.id_about}</td>
                    <td>${item.judul}</td>
                    <td>${item.konten}</td>
                    <td>
                        <button onclick="editAbout(${item.id_about})">Edit</button>
                        <button onclick="deleteAbout(${item.id_about})">Hapus</button>
                    </td>
                `;
                aboutTableBody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4" class="text-center">Tidak ada item About</td>`;
            aboutTableBody.appendChild(row);
        }
    })
    .catch(error => {
        console.error('Error fetching about items:', error);
        showToast('Gagal mengambil data About', 'error');
    });
}

// Fungsi untuk mengedit about
function editAbout(id_about) {
    fetch(`${apiUrl}?id_about=${id_about}`, {
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
            const about = data.find(item => item.id_about == id_about);
            if (about) {
                document.getElementById('about-id').value = about.id_about;
                document.getElementById('judul').value = about.judul;
                document.getElementById('konten').value = about.konten;
                document.getElementById('modal-title').innerText = 'Edit Item About';
                document.getElementById('about-modal').style.display = 'block';
            }
        }
    })
    .catch(error => {
        console.error('Error fetching about item:', error);
        showToast('Gagal mengambil detail About', 'error');
    });
}

// Fungsi untuk menghapus about
function deleteAbout(id_about) {
    showDeleteConfirmationModal(id_about);
}

// Fungsi untuk mengkonfirmasi penghapusan about
function confirmDeleteAbout() {
    if (aboutToDeleteId) {
        fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id_about=${aboutToDeleteId}`
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
                showToast('Item About berhasil dihapus');
                fetchAboutItems(); // Refresh tabel
            } else {
                showToast(data.message || 'Gagal menghapus item About', 'error');
            }
        })
        .catch(error => {
            console.error('Error deleting about item:', error);
            showToast('Gagal menghapus item About', 'error');
        });
    }
}

// Fungsi untuk submit form (add or update about)
document.getElementById('about-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const isUpdate = formData.get('id_about') ? true : false;
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
                ? 'Item About berhasil diperbarui' 
                : 'Item About berhasil ditambahkan';
            
            showToast(message);
            fetchAboutItems(); // Refresh the table after submit
        } else {
            showToast(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error submitting form:', error);
        showToast('Terjadi kesalahan saat menyimpan About', 'error');
    });
});

// Event listener untuk menutup modal jika diklik di luar area modal
document.addEventListener('click', function(event) {
    const deleteModal = document.getElementById('delete-confirmation-modal');
    if (deleteModal && event.target === deleteModal) {
        closeDeleteConfirmationModal();
    }
});

// Inisialisasi saat halaman dimuat
window.addEventListener('DOMContentLoaded', () => {
    fetchAboutItems();
});