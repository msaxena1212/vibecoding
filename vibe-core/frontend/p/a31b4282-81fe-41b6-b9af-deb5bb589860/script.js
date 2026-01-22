// script.js

console.log("Script loaded successfully!");

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

// Micro-interaction: Slightly scale up elements on hover (example: buttons)
const buttons = document.querySelectorAll('button');

buttons.forEach(button => {
    button.addEventListener('mouseover', () => {
        button.style.transform = 'scale(1.02)';
        button.style.transition = 'transform 0.2s ease-in-out';
    });

    button.addEventListener('mouseout', () => {
        button.style.transform = 'scale(1)';
        button.style.transition = 'transform 0.2s ease-in-out';
    });
});

// Add more interactive features as needed.  The goal is to enhance, not distract.