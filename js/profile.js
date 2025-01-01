// Fungsi untuk mendapatkan data user dari session storage
function getCurrentUser() {
  const userData = sessionStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
}

// Fungsi untuk memperbarui data user di session storage
function updateSessionUser(userData) {
  sessionStorage.setItem('user', JSON.stringify(userData));
}

// Fungsi untuk menampilkan toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
      toast.remove();
  }, 3000);
}

// Fungsi untuk mengambil data profil user dari database
async function fetchUserProfile() {
  const user = getCurrentUser();
  if (!user || !user.id_user) {
      window.location.href = 'login.html';
      return;
  }

  try {
      const response = await fetch(`http://localhost/PemrogramanWebsiteTeoriProject/BE/admin_users.php?id_user=${user.id_user}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      const userProfile = data.find(item => item.id_user == user.id_user);
      
      if (userProfile) {
          // Update displayed information
          document.getElementById('username-display').textContent = userProfile.username;
          document.getElementById('user-email').textContent = userProfile.email;
          document.getElementById('new-username').value = userProfile.username;
          
          // Update profile image
          if (userProfile.foto_profil) {
              document.getElementById('profile-image').src = `../BE/PP/${userProfile.foto_profil}`;
          }
      }
  } catch (error) {
      console.error('Error fetching profile:', error);
      showToast('Gagal mengambil data profil', 'error');
  }
}

// Preview foto profil sebelum update
function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validasi tipe file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
      showToast('Tipe file tidak didukung. Gunakan JPG, PNG, atau GIF', 'error');
      event.target.value = '';
      return;
  }

  // Validasi ukuran file (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran file terlalu besar. Maksimal 2MB', 'error');
      event.target.value = '';
      return;
  }

  // Preview image
  const reader = new FileReader();
  reader.onload = function(e) {
      document.getElementById('profile-image').src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Fungsi untuk update profil
async function updateProfile() {
  try {
      const user = getCurrentUser();
      if (!user) throw new Error('User not logged in');

      const newUsername = document.getElementById('new-username').value;
      const fileInput = document.getElementById('image-picker');
      
      if (!newUsername) {
          showToast('Username tidak boleh kosong', 'error');
          return;
      }

      const formData = new FormData();
      formData.append('id_user', user.id_user);
      formData.append('username', newUsername);
      formData.append('email', user.email); // Maintain existing email
      formData.append('password', user.password); // Maintain existing password
      
      if (fileInput.files[0]) {
          formData.append('foto_profil', fileInput.files[0]);
      }

      const response = await fetch('http://localhost/PemrogramanWebsiteTeoriProject/BE/admin_users.php', {
          method: 'POST',
          body: formData
      });

      const data = await response.json();
      
      if (data.status === 'success') {
          showToast('Profil berhasil diperbarui');
          // Update session storage with new data
          const updatedUser = {
              ...user,
              username: newUsername
          };
          updateSessionUser(updatedUser);
          // Refresh profile display
          fetchUserProfile();
          // Reset file input
          fileInput.value = '';
      } else {
          throw new Error(data.message || 'Update failed');
      }
  } catch (error) {
      console.error('Error updating profile:', error);
      showToast(error.message || 'Gagal memperbarui profil', 'error');
  }
}

// Fungsi logout
function logout() {
  sessionStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
  fetchUserProfile();
});