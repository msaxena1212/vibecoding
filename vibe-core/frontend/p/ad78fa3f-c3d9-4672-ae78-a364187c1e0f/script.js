// script.js

// --- Tailwind CSS Configuration (Optional: for dynamic theme colors) ---
// This script tag should ideally be placed in the <head> of your HTML files.
// If you need to dynamically set Tailwind themes based on JS variables,
// you can do it here or in a separate config file if using a build process.
// For this example, we'll assume static colors are set in Tailwind's config or CSS.

// --- Mobile Navigation Toggle ---
document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-menu-overlay');

    if (menuButton && mobileMenu && overlay) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            overlay.classList.toggle('hidden');
            menuButton.classList.toggle('animate-spin'); // Example animation for button
        });

        // Close menu if clicking outside of it
        overlay.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            overlay.classList.add('hidden');
            menuButton.classList.remove('animate-spin');
        });
    }

    // --- Reveal-on-Scroll Functionality ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Unobserve after revealing to prevent re-triggering
                // observer.unobserve(entry.target);
            } else {
                // Optional: Remove class if you want elements to hide when scrolled out of view
                // entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    revealElements.forEach(el => {
        // Add initial hidden state if not already present (e.g., for fade-in-up)
        el.classList.add('invisible', 'opacity-0', 'translate-y-8'); // Default hidden state for fade-in-up
        revealObserver.observe(el);
    });

    // --- Back-to-Top Button Functionality ---
    const backToTopButton = document.getElementById('back-to-top-button');

    if (backToTopButton) {
        const scrollThreshold = 500; // Show button after scrolling 500px

        const toggleBackToTopButton = () => {
            if (window.scrollY > scrollThreshold) {
                backToTopButton.classList.remove('hidden');
            } else {
                backToTopButton.classList.add('hidden');
            }
        };

        window.addEventListener('scroll', toggleBackToTopButton);

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Initial check on page load
        toggleBackToTopButton();
    }

    // --- Form Validation Utilities (Example) ---
    // This is a basic example. You'd likely want more robust validation.
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validateForm = (formId) => {
        const form = document.getElementById(formId);
        if (!form) return false;

        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('border-red-500'); // Highlight error
                isValid = false;
            } else {
                field.classList.remove('border-red-500');
                if (field.type === 'email') {
                    if (!validateEmail(field.value)) {
                        field.classList.add('border-red-500');
                        isValid = false;
                    } else {
                        field.classList.remove('border-red-red-500');
                    }
                }
            }
        });

        // Add more specific validation rules as needed
        // e.g., password length, phone number format, etc.

        return isValid;
    };

    // Example usage: Attach to a form's submit event
    const contactForm = document.getElementById('contact-form'); // Assuming your contact form has this ID
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            if (!validateForm('contact-form')) {
                event.preventDefault(); // Prevent form submission if invalid
                alert('Please fill out all required fields correctly.');
            } else {
                // Optionally, show a success message or redirect
                console.log('Form submitted successfully!');
                // event.preventDefault(); // Uncomment if you want to handle submission via AJAX
            }
        });
    }

    // --- Dynamic Chart Updates (Placeholder) ---
    // If you are NOT using a framework like React/Vue/Angular,
    // you might need to manually update charts.
    // This function would typically fetch new data and re-render a chart instance.
    // Example:
    // const updateEmissionChart = (chartInstance, newData) => {
    //     chartInstance.data.datasets[0].data = newData.values;
    //     chartInstance.data.labels = newData.labels;
    //     chartInstance.update();
    // };

    // --- Global Event Listeners (Example) ---
    // Add any global event listeners here, e.g., for detecting page changes
    // or initializing components on different pages.

});

// --- Helper function for CSS transitions based on Intersection Observer ---
// This function should be called after the DOM is ready and elements with
// the 'reveal' class are present.
document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal');

    const observerOptions = {
        root: null, // relative to document viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add Tailwind classes for animation
                entry.target.classList.add('animate-fade-in-up', 'visible', 'opacity-100', 'translate-y-0');
                entry.target.classList.remove('invisible', 'opacity-0', 'translate-y-8');
                // Stop observing the element once it's revealed
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        // Ensure elements are initially hidden for the animation to work
        el.classList.add('invisible', 'opacity-0', 'translate-y-8');
        observer.observe(el);
    });
});

// --- Navigation Map Configuration (for consistency across pages) ---
// This is a conceptual example. In a real app, you might load this dynamically
// or ensure navigation HTML is identical across all files.
const navigationMap = [
    { name: "Home", url: "index.html" },
    { name: "Dashboard", url: "dashboard.html" },
    { name: "Services", url: "services.html" },
    { name: "About", url: "about.html" },
    { name: "Contact", url: "contact.html" },
    { name: "Privacy Policy", url: "privacy.html" },
    { name: "Terms of Service", url: "terms.html" },
    { name: "FAQ", url: "faq.html" }
];

// You can use this `navigationMap` array to dynamically generate navigation
// links if needed, ensuring consistency. For example, in a header or footer
// component.