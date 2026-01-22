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

  // Scroll-triggered animations (example: fade-in)
  const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target); // Stop observing after animation
      }
    });
  }, {
    threshold: 0.2 // Trigger when 20% of the element is visible
  });

  elementsToAnimate.forEach(element => {
    observer.observe(element);
  });

  // Form submission handling (example - replace with your actual form ID and logic)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission

      const formData = new FormData(contactForm);

      try {
        // Simulate a successful form submission (replace with your actual API call)
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        alert('Form submitted successfully!');
        contactForm.reset(); // Clear the form
      } catch (error) {
        console.error('Form submission error:', error);
        alert('An error occurred while submitting the form.');
      }
    });
  }

  // Accessibility enhancements - example of adding focus styles
  const interactiveElements = document.querySelectorAll('a, button, input, select, textarea');
  interactiveElements.forEach(element => {
    element.addEventListener('focus', () => {
      element.classList.add('focus-visible');
    });

    element.addEventListener('blur', () => {
      element.classList.remove('focus-visible');
    });
  });

  // Performance - Lazy load images (basic example)
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  lazyImages.forEach(img => {
    img.onload = () => {
      img.classList.add('loaded'); // Add a class when image is loaded
    };
  });
});