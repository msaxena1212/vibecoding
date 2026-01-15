document.addEventListener('DOMContentLoaded', function() {
  // --- Scroll-Triggered Animations ---
  const sections = document.querySelectorAll('section');

  function checkSlide() {
    sections.forEach(section => {
      const slideInAt = (window.scrollY + window.innerHeight) - section.offsetHeight / 2;
      const sectionBottom = section.offsetTop + section.offsetHeight;
      const isHalfShown = slideInAt > section.offsetTop;
      const isNotScrolledPast = window.scrollY < sectionBottom;

      if (isHalfShown && isNotScrolledPast) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', checkSlide);


  // --- Form Validation and Submission (Example - Contact Form) ---
  const contactForm = document.getElementById('contactForm'); // Assuming you have a contact form with this ID

  if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent default form submission

      // Basic Validation (Expand as needed)
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;

      if (!name || !email || !message) {
        alert('Please fill in all fields.'); // Replace with better UI feedback
        return;
      }

      //  Email Validation (Basic)
      if (!isValidEmail(email)) {
          alert('Please enter a valid email address.');
          return;
      }


      // --- Simulate Form Submission (Replace with actual API call) ---
      setTimeout(() => {
        alert('Message sent successfully!');
        contactForm.reset(); // Clear the form
      }, 1000); // Simulate a 1-second delay

    });

      function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

  }


  // --- Dynamic Content Loading (Example - FAQ) ---
  const faqContainer = document.getElementById('faqContainer'); // Assuming you have a container for FAQs

  if (faqContainer) {
    // Simulate fetching FAQ data from an API or local storage
    const faqData = [
      { question: 'What is Nova Horizon?', answer: 'Nova Horizon is a leading provider of space tourism experiences.' },
      { question: 'How safe is space travel?', answer: 'We prioritize safety with rigorous testing and experienced personnel.' },
      { question: 'What is included in the journey?', answer: 'Our journeys include luxurious accommodations, gourmet meals, and breathtaking views.' }
    ];

    // Create FAQ elements dynamically
    faqData.forEach(faq => {
      const faqItem = document.createElement('div');
      faqItem.classList.add('faq-item', 'mb-4'); // Add Tailwind classes or your own

      const questionElement = document.createElement('h3');
      questionElement.textContent = faq.question;
      questionElement.classList.add('font-bold', 'mb-2');

      const answerElement = document.createElement('p');
      answerElement.textContent = faq.answer;
      answerElement.classList.add('text-gray-700');

      faqItem.appendChild(questionElement);
      faqItem.appendChild(answerElement);
      faqContainer.appendChild(faqItem);
    });
  }


  // --- Performance Optimization (Example - Lazy Loading Images) ---
  const images = document.querySelectorAll('img[loading="lazy"]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src; // Set the actual image source
          image.removeAttribute('data-src'); // Remove the data-src attribute
          imageObserver.unobserve(image); // Stop observing the image
        }
      });
    });

    images.forEach(image => {
      imageObserver.observe(image);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    images.forEach(image => {
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
    });
  }

});


// --- Utility Functions (Example) ---
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}