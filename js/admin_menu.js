// Get the modal
const modal = document.getElementById("menu-modal");
const saveButton = document.getElementById("save-button");
const menuTableBody = document.getElementById("menu-table-body");

// Fetch menu items from the backend
async function fetchMenuItems() {
    try {
        const response = await fetch('/api/menu-items');
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
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>Rp ${item.price.toLocaleString()}</td>
            <td>${item.stock}</td>
            <td>${item.description}</td>
            <td><img src="${item.image}" alt="${item.name}"></td>
            <td>
                <button class="action-button edit" onclick="openEditModal(${item.id})">Edit</button>
                <button class="action-button delete" onclick="deleteMenuItem(${item.id})">Delete</button>
            </td>
        `;
        menuTableBody.appendChild(row);
    });
}

// Open the add/edit menu item modal
function openAddModal() {
    document.getElementById('modal-title').textContent = 'Add New Menu Item';
    document.getElementById('menu-form').reset();
    modal.style.display = 'block';
}

function openEditModal(id) {
    // Fetch the menu item data from the backend
    fetch(`/api/menu-items/${id}`)
        .then(response => response.json())
        .then(item => {
            document.getElementById('modal-title').textContent = 'Edit Menu Item';
            document.getElementById('name').value = item.name;
            document.getElementById('category').value = item.category;
            document.getElementById('price').value = item.price;
            document.getElementById('stock').value = item.stock;
            document.getElementById('description').value = item.description;
            document.getElementById('image').value = item.image;
            saveButton.dataset.id = item.id;
            modal.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching menu item:', error);
        });
}

// Close the modal
function closeModal() {
    modal.style.display = 'none';
}

// Save a new or updated menu item
saveButton.addEventListener('click', (event) => {
    event.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        category: document.getElementById('category').value,
        price: parseFloat(document.getElementById('price').value),
        stock: parseInt(document.getElementById('stock').value),
        description: document.getElementById('description').value,
        image: document.getElementById('image').value
    };

    const id = saveButton.dataset.id;
    const url = id ? `/api/menu-items/${id}` : '/api/menu-items';
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        closeModal();
        fetchMenuItems();
    })
    .catch(error => {
        console.error('Error saving menu item:', error);
    });
});

