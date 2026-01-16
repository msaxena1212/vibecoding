document.addEventListener('DOMContentLoaded', function() {
    // Parallax Scrolling
    document.addEventListener('scroll', function() {
        const parallaxElements = document.querySelectorAll('.parallax');
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallaxSpeed) || 0.5; // Default speed
            const offset = window.pageYOffset * speed;
            element.style.transform = `translateY(${offset}px)`;
        });
    });

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 50, // Adjust for header height if needed
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form Submission Handling (Example)
    const contactForm = document.getElementById('contactForm'); // Replace with your form ID
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Basic Form Validation (Expand as needed)
            const nameInput = document.getElementById('name'); // Replace with your input IDs
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');

            if (!nameInput.value || !emailInput.value || !messageInput.value) {
                displayMessage('Please fill in all fields.', 'error');
                return;
            }

            // Simulate form submission (Replace with actual AJAX call)
            setTimeout(() => {
                // Simulate success
                displayMessage('Message sent successfully!', 'success');
                contactForm.reset();

                // Simulate error
                // displayMessage('An error occurred. Please try again later.', 'error');
            }, 1000);
        });
    }

    // Display Message Function
    function displayMessage(message, type) {
        const messageContainer = document.getElementById('messageContainer'); // Create this element in your HTML
        messageContainer.textContent = message;
        messageContainer.className = `message ${type}`; // Add classes for styling (success/error)

        // Clear message after a few seconds
        setTimeout(() => {
            messageContainer.textContent = '';
            messageContainer.className = 'message';
        }, 5000);
    }

    // Fade-in Animation (Example - you can expand this)
    const fadeInElements = document.querySelectorAll('.fade-in-up');
    fadeInElements.forEach(element => {
        element.classList.add('animate-fade-in-up'); // Trigger Tailwind animation
    });

    // Observer for adding animations on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            } else {
                entry.target.classList.remove('show');
            }
        });
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));

});