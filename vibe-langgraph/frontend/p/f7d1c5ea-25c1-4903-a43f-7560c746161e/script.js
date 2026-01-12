document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth',
                block: 'start' // Align the top of the element to the top of the viewport
            });
        });
    });

    // Hover effects for project cards (if project cards exist)
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px) scale(1.02)';
            card.style.transition = 'transform 0.3s ease-in-out';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.transition = 'transform 0.3s ease-in-out';
        });
    });

    // Hover effects for buttons (if buttons exist)
    const buttons = document.querySelectorAll('button, .button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px) scale(1.02)';
            button.style.transition = 'transform 0.3s ease-in-out';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0) scale(1)';
            button.style.transition = 'transform 0.3s ease-in-out';
        });
    });

    // Scroll animations for revealing content
    function revealOnScroll() {
        const reveals = document.querySelectorAll(".reveal");

        for (let i = 0; i < reveals.length; i++) {
            let windowHeight = window.innerHeight;
            let elementTop = reveals[i].getBoundingClientRect().top;
            let elementVisible = 150;

            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add("active");
            } else {
                reveals[i].classList.remove("active");
            }
        }
    }

    window.addEventListener("scroll", revealOnScroll);

    // Initial call to revealOnScroll to show elements that are already in view on page load
    revealOnScroll();
});