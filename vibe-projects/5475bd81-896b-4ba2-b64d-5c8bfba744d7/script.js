// script.js

// --- Tailwind CSS CDN ---
// Included in the HTML head for global availability.

// --- Google Fonts ---
// Ensured in the HTML head via <link> tags for Roboto Slab and Montserrat.

// --- Design Tokens Configuration ---
// This script tag is placed in the HTML <head> to configure Tailwind CSS.
/*
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: '#00bcd4', // Cyan
          secondary: '#3f51b5', // Indigo
          background: '#ffffff', // White
          text: '#212121', // Dark Gray
          'primary-dark': '#0097a7',
          'secondary-dark': '#303f9f',
        },
        fontFamily: {
          sans: ['Montserrat', 'sans-serif'],
          serif: ['Roboto Slab', 'serif'],
        },
        spacing: {
          '128': '32rem',
          '144': '36rem',
        },
        animation: {
          'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
          'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
          'slide-in-right': 'slideInRight 0.5s ease-out forwards',
          'zoom-in': 'zoomIn 0.5s ease-out forwards',
        },
        keyframes: {
          fadeInUp: {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          slideInLeft: {
            '0%': { opacity: '0', transform: 'translateX(-20px)' },
            '100%': { opacity: '1', transform: 'translateX(0)' },
          },
          slideInRight: {
            '0%': { opacity: '0', transform: 'translateX(20px)' },
            '100%': { opacity: '1', transform: 'translateX(0)' },
          },
          zoomIn: {
            '0%': { opacity: '0', transform: 'scale(0.9)' },
            '100%': { opacity: '1', transform: 'scale(1)' },
          },
        },
      },
    },
    plugins: [],
  };
</script>
*/

// --- Navigation Toggle ---
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const overlay = document.getElementById('mobile-menu-overlay');

if (mobileMenuButton && mobileMenu && overlay) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        overlay.classList.toggle('hidden');
        mobileMenuButton.classList.toggle('text-white'); // Example: change icon color
        mobileMenuButton.classList.toggle('text-primary');
    });

    // Close menu when clicking outside of it or on the overlay
    overlay.addEventListener('click', () => {
        if (!mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            overlay.classList.add('hidden');
            mobileMenuButton.classList.remove('text-white');
            mobileMenuButton.classList.add('text-primary');
        }
    });
}

// --- Reveal on Scroll Functionality ---
const revealElements = document.querySelectorAll('.reveal');

const observerOptions = {
    root: null, // relative to viewport
    rootMargin: '0px',
    threshold: 0.1 // trigger when 10% of the element is visible
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up'); // Use a standard animation class
            // Or use custom keyframes defined in Tailwind config:
            // entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target); // Stop observing once animated
        }
    });
}, observerOptions);

revealElements.forEach(el => {
    observer.observe(el);
});

// --- Basic Form Validation ---
const forms = document.querySelectorAll('form');

forms.forEach(form => {
    form.addEventListener('submit', function(event) {
        let isValid = true;
        const requiredFields = this.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('border-red-500'); // Highlight invalid field
                isValid = false;
            } else {
                field.classList.remove('border-red-500');
            }
        });

        // Specific email validation example
        const emailField = this.querySelector('input[type="email"]');
        if (emailField && emailField.value.trim() && !/\S+@\S+\.\S+/.test(emailField.value.trim())) {
            emailField.classList.add('border-red-500');
            isValid = false;
        } else if (emailField) {
            emailField.classList.remove('border-red-500');
        }

        if (!isValid) {
            event.preventDefault(); // Prevent form submission if invalid
            alert('Please fill out all required fields correctly.');
        }
    });
});

// --- Interactive Chart Initialization (Chart.js Example) ---
// This is a placeholder. You'll need to include Chart.js library in your HTML.
// Example: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

document.addEventListener('DOMContentLoaded', () => {
    const chartCanvasSales = document.getElementById('salesChart');
    if (chartCanvasSales) {
        const ctxSales = chartCanvasSales.getContext('2d');
        new Chart(ctxSales, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Sales',
                    data: [120, 190, 300, 500, 200, 600],
                    borderColor: 'rgba(0, 188, 212, 1)', // Primary color
                    backgroundColor: 'rgba(0, 188, 212, 0.2)',
                    fill: true,
                    tension: 0.4 // Smooth curve
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Monthly Sales Trends'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    const chartCanvasInventory = document.getElementById('inventoryChart');
    if (chartCanvasInventory) {
        const ctxInventory = chartCanvasInventory.getContext('2d');
        new Chart(ctxInventory, {
            type: 'bar',
            data: {
                labels: ['Electronics', 'Apparel', 'Home Goods', 'Groceries'],
                datasets: [{
                    label: 'Stock Levels',
                    data: [50, 120, 80, 200],
                    backgroundColor: [
                        'rgba(63, 81, 181, 0.6)', // Secondary color
                        'rgba(0, 188, 212, 0.6)', // Primary color
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(75, 192, 192, 0.6)'
                    ],
                    borderColor: [
                        'rgba(63, 81, 181, 1)',
                        'rgba(0, 188, 212, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Inventory Levels by Category'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});

// --- Back to Top Button ---
const backToTopButton = document.getElementById('back-to-top');

if (backToTopButton) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // Show button after scrolling down 300px
            backToTopButton.classList.remove('hidden');
            backToTopButton.classList.add('opacity-100', 'translate-y-0');
        } else {
            backToTopButton.classList.add('hidden');
            backToTopButton.classList.remove('opacity-100', 'translate-y-0');
        }
    });

    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// --- Helper function to check if an element is in viewport ---
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}