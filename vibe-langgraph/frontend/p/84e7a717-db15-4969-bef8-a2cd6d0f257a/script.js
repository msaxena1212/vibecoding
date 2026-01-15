document.addEventListener('DOMContentLoaded', () => {
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

  // Micro-interactions (example: card hover effect)
  const sections = document.querySelectorAll('section'); // Assuming sections are the interactive elements

  sections.forEach(section => {
    section.addEventListener('mouseenter', () => {
      section.style.transform = 'translateY(-2px) scale(1.02)';
      section.style.transition = 'transform 0.3s ease-in-out';
    });

    section.addEventListener('mouseleave', () => {
      section.style.transform = 'translateY(0) scale(1)';
      section.style.transition = 'transform 0.3s ease-in-out';
    });
  });
});