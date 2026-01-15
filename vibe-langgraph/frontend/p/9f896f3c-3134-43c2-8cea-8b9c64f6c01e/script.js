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

  // Scroll-triggered animations (example - you'll need to adapt this)
  const sections = document.querySelectorAll('section');

  const revealSection = function(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('reveal');
      observer.unobserve(entry.target);
    });
  };

  const sectionObserver = new IntersectionObserver(revealSection, {
    root: null,
    threshold: 0.15,
  });

  sections.forEach(section => {
    sectionObserver.observe(section);
    section.classList.add('section--hidden'); // Hide initially, reveal later
  });

  // Example Form Validation (adapt to your form)
  const contactForm = document.querySelector('#contact-form'); // Assuming you have a form with this ID

  if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent default form submission

      // Basic validation example
      const nameInput = document.querySelector('#name');
      const emailInput = document.querySelector('#email');
      const messageInput = document.querySelector('#message');

      if (!nameInput.value || !emailInput.value || !messageInput.value) {
        alert('Please fill in all fields.');
        return;
      }

      // More advanced email validation (basic regex)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value)) {
        alert('Please enter a valid email address.');
        return;
      }

      // In a real application, you'd send the form data to a server here
      // using fetch or XMLHttpRequest.  For this example, we'll just
      // simulate a successful submission.

      alert('Message sent successfully!');
      contactForm.reset(); // Clear the form
    });
  }

  // Dynamic content updates based on mock_data (example)
  //  Since mock_data is empty, this is just a placeholder.
  //  Adapt this to your actual data structure.

  // Example: Updating project descriptions
  // const projectDescriptions = document.querySelectorAll('.project-description');
  // if (projectDescriptions && mock_data.projects) {
  //   projectDescriptions.forEach((description, index) => {
  //     if (mock_data.projects[index] && mock_data.projects[index].description) {
  //       description.textContent = mock_data.projects[index].description;
  //     }
  //   });
  // }

  // Example of Reveal Animation using Keyframes (applied in CSS)
  // The CSS class 'reveal' is added/removed by the IntersectionObserver

  // More advanced functionality can be added here, such as:
  // - Fetching data from an API
  // - Implementing interactive UI components (e.g., modals, sliders)
  // - Handling user authentication
});