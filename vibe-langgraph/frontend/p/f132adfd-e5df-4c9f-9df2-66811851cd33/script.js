document.addEventListener('DOMContentLoaded', function() {
  try {
    // --- Smooth Scroll Animations ---
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');

    function handleScrollAnimation() {
      elementsToAnimate.forEach(element => {
        if (isElementInViewport(element)) {
          element.classList.add('animate-fade-in-up'); // Or any other animation class
        }
      });
    }

    function isElementInViewport(el) {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }

    window.addEventListener('scroll', handleScrollAnimation);
    window.addEventListener('resize', handleScrollAnimation); // In case viewport changes

    // Initial check in case elements are already in view on load
    handleScrollAnimation();


    // --- Form Submission Handling (Example) ---
    const contactForm = document.getElementById('contact-form'); // Replace with your form ID

    if (contactForm) {
      contactForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData(contactForm);

        fetch('/submit-form', { // Replace with your server endpoint
          method: 'POST',
          body: formData
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
          }
          return response.json(); // Or response.text() if not JSON
        })
        .then(data => {
          console.log('Success:', data);
          // Display success message to the user
          alert('Form submitted successfully!');
          contactForm.reset(); // Clear the form
        })
        .catch(error => {
          console.error('Error:', error);
          // Display error message to the user
          alert('An error occurred during form submission. Please try again later.');
        });
      });
    } else {
      console.warn('Contact form not found. Ensure the form has the ID "contact-form".');
    }


  } catch (error) {
    console.error('Critical error during page rendering:', error);
    // Display a user-friendly error message on the page
    const errorContainer = document.createElement('div');
    errorContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background-color: rgba(255, 0, 0, 0.8);
      color: white;
      padding: 16px;
      text-align: center;
      z-index: 10000;
      font-family: sans-serif;
    `;
    errorContainer.textContent = 'A critical error occurred preventing the page from fully loading. Please refresh the page or contact support.';
    document.body.appendChild(errorContainer);

    // Log the error to a server (implementation not included)
    logErrorToServer(error); //  Placeholder function - implement your server-side logging
  }
});

function logErrorToServer(error) {
  //  Implement your error logging mechanism here.
  //  This could involve sending an AJAX request to a server-side endpoint.
  console.error("Attempting to log error to server:", error); // Placeholder
  // Example (replace with your actual endpoint and data format):
  /*
  fetch('/log-error', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: error.message,
      stack: error.stack,
      url: window.location.href
    })
  }).catch(serverError => {
    console.error("Failed to log error to server:", serverError);
  });
  */
}


/*  Tailwind Configuration (if needed - place inside a <script> tag in index.html)

<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: '#007BFF', // Example from design_tokens
          secondary: '#FFFFFF',
        },
        fontFamily: {
          sans: ['Roboto', 'sans-serif'], // Example from design_tokens
          serif: ['Playfair Display', 'serif'],
        },
        animation: {
          'fade-in-up': 'fade-in-up 0.5s ease-out'
        },
        keyframes: {
          'fade-in-up': {
            '0%': {
              opacity: '0',
              transform: 'translateY(20px)'
            },
            '100%': {
              opacity: '1',
              transform: 'translateY(0)'
            },
          }
        }
      },
    },
  }
</script>

*/