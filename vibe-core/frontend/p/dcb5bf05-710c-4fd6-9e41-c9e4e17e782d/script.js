// script.js

// --- Configuration & Global Variables ---
const designTokens = {
    primary_colors: ["#e2a800", "#f0e090", "#3498db", "#ffffff"],
    typography: ["'Luckiest Guy', cursive", "'Open Sans', sans-serif"],
    spacing_system: "Fluid, with a base unit for consistency, allowing for playful variations.",
    animation_vibe: "Energetic and playful, with smooth transitions and 'pop' effects."
};

// --- Utility Functions ---

/**
 * Smoothly scrolls to a target element.
 * @param {string} targetId - The ID of the element to scroll to.
 * @param {number} offset - The offset from the top of the target element (e.g., for sticky headers).
 */
function smoothScrollTo(targetId, offset = 0) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
            top: targetPosition - offset,
            behavior: 'smooth'
        });
    }
}

/**
 * Toggles the visibility of the mobile navigation menu.
 */
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuToggle = document.getElementById('mobile-menu-toggle');
    if (mobileMenu && menuToggle) {
        mobileMenu.classList.toggle('hidden');
        menuToggle.classList.toggle('open'); // For potential icon animation
    }
}

/**
 * Handles the 'Back to Top' button visibility and scroll functionality.
 */
function setupBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        const scrollThreshold = 1000; // Show button after scrolling 1000px

        const toggleButtonVisibility = () => {
            if (window.scrollY > scrollThreshold) {
                backToTopButton.classList.remove('opacity-0', 'invisible');
                backToTopButton.classList.add('opacity-100', 'visible');
            } else {
                backToTopButton.classList.remove('opacity-100', 'visible');
                backToTopButton.classList.add('opacity-0', 'invisible');
            }
        };

        window.addEventListener('scroll', toggleButtonVisibility);
        toggleButtonVisibility(); // Initial check

        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            smoothScrollTo('hero-section', 0); // Scroll to the top of the page
        });
    }
}

/**
 * Initializes the reveal-on-scroll functionality using Intersection Observer.
 */
function setupRevealOnScroll() {
    const revealElements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                entry.target.classList.remove('opacity-0'); // Ensure it's visible before animating
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    revealElements.forEach(el => {
        el.classList.add('opacity-0', 'transition-all', 'duration-700', 'ease-out'); // Initial hidden state
        observer.observe(el);
    });
}

/**
 * Initializes Chart.js instances if they exist on the page.
 */
function initializeCharts() {
    if (typeof Chart === 'undefined') {
        console.warn("Chart.js is not loaded. Skipping chart initialization.");
        return;
    }

    // Example: Initialize a chart if a canvas with id="doge-stats-chart" exists
    const dogeStatsCanvas = document.getElementById('doge-stats-chart');
    if (dogeStatsCanvas) {
        const ctx = dogeStatsCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Doge Holders (Millions)',
                    data: [1.5, 1.6, 1.8, 2.0, 2.2, 2.5],
                    borderColor: designTokens.primary_colors[0], // Doge yellow
                    backgroundColor: designTokens.primary_colors[0] + '33', // Semi-transparent
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Transactions (Thousands)',
                    data: [500, 550, 600, 750, 800, 950],
                    borderColor: designTokens.primary_colors[2], // Blue
                    backgroundColor: designTokens.primary_colors[2] + '33', // Semi-transparent
                    fill: true,
                    tension: 0.4
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
                        text: 'Dogecoin Community Engagement Metrics (Simulated)',
                        font: {
                            family: designTokens.typography[0], // Luckiest Guy
                            size: 20
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false // Adjust as needed for simulated data
                    }
                }
            }
        });
    }

    // Add more chart initializations here if needed for other parts of the dashboard
    // Example: const anotherChartCanvas = document.getElementById('another-chart');
    // if (anotherChartCanvas) { /* ... initialize another chart ... */ }
}


// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('mobile-menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu when a link is clicked (optional, for single-page apps or smoother UX)
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            const mobileMenu = document.getElementById('mobile-menu');
            const menuToggle = document.getElementById('mobile-menu-toggle');
            if (mobileMenu && menuToggle && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                menuToggle.classList.remove('open');
            }
        });
    });

    // Back to Top Button
    setupBackToTop();

    // Reveal on Scroll
    setupRevealOnScroll();

    // Initialize Charts (if on a dashboard page or page with charts)
    initializeCharts();

    // Add event listeners for internal links to use smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Check if it's an internal fragment link and not just '#'
            if (this.getAttribute('href').length > 1) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                // Adjust offset based on your header height if it's sticky
                const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                smoothScrollTo(targetId, headerHeight);
            }
        });
    });
});

// --- Global Enhancements ---

// Optional: Add a class to the body when the mobile menu is open for styling purposes
document.addEventListener('click', (e) => {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuToggle = document.getElementById('mobile-menu-toggle');

    if (mobileMenu && menuToggle) {
        const isClickInsideMenu = mobileMenu.contains(e.target);
        const isClickOnToggle = menuToggle.contains(e.target);

        if (!isClickInsideMenu && !isClickOnToggle && !mobileMenu.classList.contains('hidden')) {
            // Clicked outside the menu and not on the toggle, close the menu
            mobileMenu.classList.add('hidden');
            menuToggle.classList.remove('open');
        }
    }
});

// Add custom Tailwind animation if needed (example: fade-in-up)
// This part would typically be in tailwind.config.js, but can be defined here for CDN setup if necessary
// For CDN, it's often better to rely on standard Tailwind animations or define them directly in CSS.
// If you need custom animations, consider a build process or inline CSS for simplicity with CDN.

// Example of how to define a custom animation class if not using a config file:
// (This is less ideal for maintainability but works with CDN)
/*
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-down {
  animation: fadeInDown 0.7s ease-out forwards;
}
`;
document.head.appendChild(styleSheet);
*/
// NOTE: The provided prompt uses 'animate-fade-in-up'. Assuming this is a standard Tailwind animation
// or you have it defined elsewhere (e.g., in a linked CSS file or via tailwind.config script).
// If not, you'd need to define it similar to the example above.