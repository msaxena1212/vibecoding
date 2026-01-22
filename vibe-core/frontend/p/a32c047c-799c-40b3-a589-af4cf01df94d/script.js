document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 20, // Offset to account for potential header
          behavior: 'smooth'
        });
      }
    });
  });

  // Form Validation (example - adjust to specific forms)
  const contactForm = document.getElementById('contactForm'); // Replace with your actual form ID

  if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
      let isValid = true;

      const nameInput = document.getElementById('name'); // Replace with your actual input ID
      const emailInput = document.getElementById('email'); // Replace with your actual input ID
      const messageInput = document.getElementById('message'); // Replace with your actual input ID

      if (nameInput && nameInput.value.trim() === '') {
        isValid = false;
        alert('Please enter your name.');
        event.preventDefault(); // Prevent form submission
        nameInput.focus();
        return;
      }

      if (emailInput && !isValidEmail(emailInput.value)) {
        isValid = false;
        alert('Please enter a valid email address.');
        event.preventDefault(); // Prevent form submission
        emailInput.focus();
        return;
      }

      if (messageInput && messageInput.value.trim() === '') {
        isValid = false;
        alert('Please enter your message.');
        event.preventDefault(); // Prevent form submission
        messageInput.focus();
        return;
      }

      if (!isValid) {
        event.preventDefault(); // Prevent form submission if any validation fails
      }
    });
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }


  // Simple Fade-in Animation (Example - can be extended to more elements)
  const elementsToFade = document.querySelectorAll('.fade-in-element'); // Add this class to elements to fade in

  elementsToFade.forEach(element => {
    element.classList.add('opacity-0'); // Initially hide the element

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          element.classList.remove('opacity-0');
          element.classList.add('opacity-100');
          element.style.transition = 'opacity 1s ease-out';
          observer.unobserve(element); // Stop observing after animation
        }
      });
    }, {
      threshold: 0.2 // Adjust threshold as needed
    });

    observer.observe(element);
  });



  // Example Error Handling (for API calls or similar)
  function handleApiError(error) {
    console.error('API Error:', error);
    // Display a user-friendly error message (e.g., in a modal or alert)
    alert('An error occurred. Please try again later.');
  }

  // Example of debouncing a function (for performance)
  function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  // Example of using debouncing with a window resize event
  const handleResize = () => {
    // Perform actions that need to happen on resize, but not too frequently
    console.log('Window resized (debounced)');
  };

  window.addEventListener('resize', debounce(handleResize, 250)); // Adjust delay as needed
});