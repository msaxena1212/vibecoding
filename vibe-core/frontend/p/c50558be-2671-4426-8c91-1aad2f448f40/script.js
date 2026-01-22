document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu
    const burgerIcon = document.getElementById('burger-menu');
    const mobileMenu = document.getElementById('mobile-nav');
    const closeMenuIcon = document.getElementById('close-menu'); // Ensure this ID exists in your HTML

    if (burgerIcon && mobileMenu && closeMenuIcon) {
        burgerIcon.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        closeMenuIcon.addEventListener('click', () => {
            mobileMenu.classList.add('hidden'); // Hide the menu
        });

        // Close menu when a link is clicked (optional, for single-page apps)
        const navLinks = mobileMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });

    } else {
        console.warn('Burger menu elements not found. Check your HTML.');
    }

    // Reveal on Scroll
    const reveals = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animate-fade-in-up"); // Or your custom animation class
                observer.unobserve(entry.target); // Stop observing after revealing
            }
        });
    }, {
        threshold: 0.2 // Adjust threshold as needed
    });

    reveals.forEach(reveal => {
        observer.observe(reveal);
    });

    // Back to Top Button
    const backToTopButton = document.createElement('button');
    backToTopButton.id = 'back-to-top';
    backToTopButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>'; // Up arrow icon
    backToTopButton.classList.add('fixed', 'bottom-4', 'right-4', 'bg-primary', 'text-white', 'p-2', 'rounded-full', 'shadow-md', 'cursor-pointer', 'opacity-0', 'transition-opacity', 'duration-300', 'ease-in-out', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary');
    backToTopButton.style.zIndex = '50'; // Ensure it's on top

    document.body.appendChild(backToTopButton);

    window.addEventListener('scroll', () => {
        if (document.documentElement.scrollTop > 1000) {
            backToTopButton.classList.remove('opacity-0');
            backToTopButton.classList.add('opacity-100');
        } else {
            backToTopButton.classList.remove('opacity-100');
            backToTopButton.classList.add('opacity-0');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});