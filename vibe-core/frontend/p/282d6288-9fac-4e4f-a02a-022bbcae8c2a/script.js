document.addEventListener('DOMContentLoaded', function() {

  // Smooth Scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  // Micro-interaction: Button Hover Effect (Example)
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('mouseover', () => {
      button.classList.add('hover:scale-105', 'transition-all', 'duration-300', 'ease-out'); // Tailwind classes example
    });
    button.addEventListener('mouseout', () => {
      button.classList.remove('hover:scale-105', 'transition-all', 'duration-300', 'ease-out'); // Tailwind classes example
    });
  });


  //Fade-in animation

  const fadeInElements = document.querySelectorAll('.fade-in');

  fadeInElements.forEach(element => {
    element.classList.add('opacity-0'); // Initially hide elements
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          element.classList.remove('opacity-0');
          element.classList.add('opacity-100', 'transition-opacity', 'duration-700');
          observer.unobserve(element); // Stop observing after fade-in
        }
      });
    });
    observer.observe(element);
  });



  // Form Validation Example (Basic) - Adapt as needed for specific forms
  const contactForm = document.getElementById('contact-form'); // Example ID
  if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
      let isValid = true;
      const nameInput = document.getElementById('name'); // Example ID
      const emailInput = document.getElementById('email'); // Example ID
      const messageInput = document.getElementById('message'); // Example ID

      if (!nameInput.value.trim()) {
        alert('Please enter your name.');
        isValid = false;
        nameInput.focus();
      } else if (!emailInput.value.trim()) {
        alert('Please enter your email.');
        isValid = false;
        emailInput.focus();
      } else if (!messageInput.value.trim()) {
        alert('Please enter your message.');
        isValid = false;
        messageInput.focus();
      }

      if (!isValid) {
        event.preventDefault(); // Prevent form submission if validation fails
      }
    });
  }


  // Cart Updates (Placeholder - adapt based on actual cart functionality)
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      const productId = this.dataset.productId; // Assuming product ID is stored as a data attribute
      alert(`Added product ${productId} to cart (Placeholder)`);
      // In a real implementation, you would update the cart using AJAX or local storage.
    });
  });

});