document.addEventListener('DOMContentLoaded', function() {

  // Store Locator Functionality (Example - Replace with actual API/Data)
  function initializeStoreLocator() {
    const storeList = document.getElementById('storeList');
    if (!storeList) return; // Exit if the storeList element doesn't exist

    const stores = [
      { name: 'Chai Sutta Bar - Downtown', location: '123 Main St' },
      { name: 'Chai Sutta Bar - Uptown', location: '456 Oak Ave' },
      { name: 'Chai Sutta Bar - Midtown', location: '789 Pine Ln' }
    ];

    stores.forEach(store => {
      const listItem = document.createElement('li');
      listItem.textContent = `${store.name} - ${store.location}`;
      storeList.appendChild(listItem);
    });
  }

  // Form Validation (Example - Customize for your forms)
  function initializeFormValidation() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(event) {
      let isValid = true;

      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');

      if (!nameInput.value.trim()) {
        alert('Name is required.');
        isValid = false;
      }

      if (!emailInput.value.trim()) {
        alert('Email is required.');
        isValid = false;
      } else if (!isValidEmail(emailInput.value.trim())) {
        alert('Invalid email format.');
        isValid = false;
      }

      if (!messageInput.value.trim()) {
        alert('Message is required.');
        isValid = false;
      }


      if (!isValid) {
        event.preventDefault(); // Prevent form submission if validation fails
      }
    });

    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  }

  // Scroll Animations (Example - Requires Tailwind or Custom CSS)
  function initializeScrollAnimations() {
    const elements = document.querySelectorAll('.animate-fade-in-up'); // Target elements with this class

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible'); // Add a class to trigger the animation
          observer.unobserve(entry.target); // Stop observing after animation
        }
      });
    }, {
      threshold: 0.2 // Trigger when 20% of the element is visible
    });

    elements.forEach(element => {
      observer.observe(element);
    });
  }


  // Initialize Functions
  initializeStoreLocator();
  initializeFormValidation();
  initializeScrollAnimations();

});


/*  TAILWIND CONFIG (If needed, define it directly in a <script> tag in index.html)

 <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#A0522D', // Brown
            secondary: '#F5F5DC', // Beige
            white: '#FFFFFF',
          },
          fontFamily: {
            'sans': ['Inter', 'sans-serif'],
            'serif': ['Playfair Display', 'serif'],
          },
          animation: {
            'fade-in-up': 'fade-in-up 0.75s ease-out forwards'
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
              }
            }
          }
        }
      }
    }
  </script>

  /* CSS transition for visibility (style.css or <style> tag)

  .animate-fade-in-up {
    opacity: 0;
  }

  .animate-fade-in-up.animate-visible {
    opacity: 1;
    transition: opacity 0.75s ease-out, transform 0.75s ease-out;
    transform: translateY(0);
  }

*/