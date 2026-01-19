document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Functionality
    const mobileMenuTrigger = document.querySelector('.nav-mobile-trigger');
    const mobileMenu = document.querySelector('.nav-mobile');

    if (mobileMenuTrigger && mobileMenu) {
        mobileMenuTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            mobileMenu.classList.toggle('active');
        });

        // Close menu if clicked outside
        document.addEventListener('click', function(event) {
            if (!mobileMenu.contains(event.target) && !mobileMenuTrigger.contains(event.target) && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
            }
        });
    } else {
        console.warn('Mobile menu trigger or menu not found.');
    }

    // Reveal-on-Scroll Functionality
    function revealOnScroll() {
        const reveals = document.querySelectorAll(".reveal");

        for (let i = 0; i < reveals.length; i++) {
            let windowHeight = window.innerHeight;
            let elementTop = reveals[i].getBoundingClientRect().top;
            let elementVisible = 150;

            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add("active");
            } else {
                reveals[i].classList.remove("active"); // Uncomment this to re-hide on scroll up
            }
        }
    }

    // Back-to-Top Button Functionality
    const backToTopButton = document.createElement('button');
    backToTopButton.id = 'back-to-top';
    backToTopButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>';
    backToTopButton.classList.add('hidden', 'fixed', 'bottom-5', 'right-5', 'bg-white/10', 'backdrop-blur-lg', 'border', 'border-white/20', 'text-white', 'p-3', 'rounded-full', 'cursor-pointer', 'z-50', 'focus:outline-none', 'focus:ring-2', 'ring-primary');
    document.body.appendChild(backToTopButton);

    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    function toggleBackToTopButton() {
        if (document.documentElement.scrollTop > 1000) {
            backToTopButton.classList.remove('hidden');
        } else {
            backToTopButton.classList.add('hidden');
        }
    }

    // Event Listeners with Debouncing for Performance
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    window.addEventListener('scroll', debounce(function() {
        revealOnScroll();
        toggleBackToTopButton();
    }, 20)); // Debounce delay of 20ms

    // Initial call to revealOnScroll and toggleBackToTopButton to handle cases where the page loads scrolled
    revealOnScroll();
    toggleBackToTopButton();

    // Fade-in Animation (CSS Trigger)
    function fadeInElements() {
        const elements = document.querySelectorAll('.animate-fade-in-up');
        elements.forEach(element => {
            element.classList.add('active');
        });
    }

    // Initialize Fade-in after a short delay
    setTimeout(fadeInElements, 100);

    //Interactive Elements - Example (Expandable Sections)

    const expandableSections = document.querySelectorAll('.expandable-section');

    expandableSections.forEach(section => {
        const header = section.querySelector('.expandable-header');
        const content = section.querySelector('.expandable-content');

        if (header && content) {
            header.addEventListener('click', () => {
                section.classList.toggle('active');
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            });
        }
    });

});