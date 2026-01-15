// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Parallax Effect (Example - Adjust as needed for your specific elements)
window.addEventListener('scroll', function() {
    const parallaxElements = document.querySelectorAll('.parallax'); // Add class "parallax" to elements
    parallaxElements.forEach(element => {
        let scrollPosition = window.pageYOffset;
        let speed = element.dataset.parallaxSpeed || 0.5; // Default speed, can be set via data-parallax-speed

        element.style.transform = 'translateY(' + scrollPosition * speed + 'px)';
    });
});

// Form Validation (Basic Example - Customize for your specific form)
const contactForm = document.getElementById('contact-form'); // Replace with your form ID
if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        let isValid = true;

        // Example: Check if name field is empty
        const nameField = document.getElementById('name'); // Replace with your field ID
        if (nameField && nameField.value.trim() === '') {
            alert('Please enter your name.');
            isValid = false;
        }

        // Add more validation checks as needed

        if (!isValid) {
            event.preventDefault(); // Prevent form submission if invalid
        }
    });
}

// Micro-interactions (Example - Add hover effects, animations, etc.)
const hoverElements = document.querySelectorAll('.hover-effect'); // Add class "hover-effect" to elements
hoverElements.forEach(element => {
    element.addEventListener('mouseover', function() {
        this.classList.add('hovered'); // Add a class to trigger a hover effect (defined in CSS)
    });
    element.addEventListener('mouseout', function() {
        this.classList.remove('hovered');
    });
});

// Dynamic Data (Example - Fetch and display data)
// Assuming you have a function to fetch data from an API or local storage
async function fetchData() {
    try {
        // Replace with your data source
        // const response = await fetch('/api/data');
        // const data = await response.json();
        const data = { // Mock Data for demonstration
            "featured_products": [
                {"name": "Quantum Resistance Bands", "description": "Experience unparalleled resistance.", "image": "assets/resistance_bands.jpg"}, // Replace with actual image path
                {"name": "AI Powered Dumbbells", "description": "Smart dumbbells adapt to your strength.", "image": "assets/smart_dumbbells.jpg"} // Replace with actual image path
            ]
        };

        // Display the data
        displayData(data);

    } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error (e.g., display an error message)
    }
}

function displayData(data) {
    // Example: Display featured products in a section with ID "featured-products"
    const featuredProductsSection = document.getElementById('featured-products');
    if (featuredProductsSection && data.featured_products) {
        data.featured_products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.innerHTML = `
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <img src="${product.image}" alt="${product.name}" width="200">
            `;
            featuredProductsSection.appendChild(productElement);
        });
    }
}

// Call the fetch data function when the page loads (if needed)
// window.addEventListener('load', fetchData);

// Helper function to create fade-in animation
function fadeIn(element) {
    element.style.opacity = 0;
    let opacity = 0;
    const interval = setInterval(function() {
        opacity += 0.1;
        element.style.opacity = opacity;
        if (opacity >= 1) {
            clearInterval(interval);
        }
    }, 50); // Adjust timing as needed
}

// Example use:
const elementsToFadeIn = document.querySelectorAll('.fade-in'); // Add class "fade-in" to elements
elementsToFadeIn.forEach(element => {
    fadeIn(element);
});