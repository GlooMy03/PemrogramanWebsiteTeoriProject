const apiUrl = 'http://localhost/php_folder_praktikum/teoriweb/PemrogramanWebsiteTeoriProject/BE/cms.php'; // Replace with your actual API URL

// Function to change content based on the menu clicked
function changeContent(section) {
    // Hide all content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(function (section) {
        section.style.display = 'none';
    });

    // Show the selected content section
    const activeSection = document.getElementById(section + '-content');
    if (activeSection) {
        activeSection.style.display = 'block';
    }
}

// Function to show toast notifications
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

    // Slide in and fade in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    });

    // Slide out and remove
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}

// Function to fetch and display hero content from API
function fetchHeroContent() {
   
    fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const heroSection = document.getElementById('hero');
        heroSection.innerHTML = ''; // Clear previous content

        if (data && data.length > 0) {
            const heroData = data[0]; // Take the first data entry
            const heroHTML = `
                <div class="hero-content">
                    <img src="assets/${heroData.content}" alt="${heroData.title}" class="hero-logo">
                    <h1>${heroData.title}</h1>
                    <p>${heroData.content}</p>
                    <button class="order-now" onclick="location.href='order.html';">Order Now</button>
                </div>
            `;
            heroSection.innerHTML = heroHTML; // Insert new content
        } else {
            heroSection.innerHTML = '<p>No content available</p>'; // If no data
        }
    })
    .catch(error => {
        console.error('Error fetching hero content:', error);
        showToast('Failed to fetch hero content', 'error');
    });
}

// Call fetchHeroContent when the page is loaded
window.addEventListener('DOMContentLoaded', () => {
    fetchHeroContent();
});
