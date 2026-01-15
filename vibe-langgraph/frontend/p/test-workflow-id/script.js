document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling function
  function smoothScroll(target, duration) {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;

    const startPosition = window.pageYOffset;
    const targetPosition = targetElement.offsetTop;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // Easing function (easeOutQuad)
    function ease(t, b, c, d) {
      t /= d;
      return -c * t*(t-2) + b;
    };

    requestAnimationFrame(animation);
  }

  // Event listener for smooth scrolling links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      smoothScroll(targetId, 1000); // Adjust duration as needed
    });
  });

  // Scroll-triggered animations (example - fade-in-up)
  const elementsToAnimate = document.querySelectorAll('.animate-fade-in-up');

  function handleScrollAnimations() {
    elementsToAnimate.forEach(element => {
      if (isElementInViewport(element)) {
        element.classList.add('animate-active'); // Add a class to trigger the animation
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

  window.addEventListener('scroll', handleScrollAnimations);
  handleScrollAnimations(); // Trigger on load in case elements are already in view


  // Form submission handling (example)
  const contactForm = document.getElementById('contactForm'); // Replace with your actual form ID

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);

      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/submit-form', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          alert('Form submitted successfully!');
          contactForm.reset(); // Clear the form after submission
        } else {
          alert('Form submission failed. Please try again.');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('An error occurred. Please try again later.');
      }
    });
  }


  // Fetch and display trip packages (example)
  async function fetchTripPackages() {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/trip-packages');
      const packages = await response.json();

      // Assuming you have a container with id 'tripPackagesContainer'
      const container = document.getElementById('tripPackagesContainer');
      if (container) {
        packages.forEach(packageData => {
          const packageElement = createPackageElement(packageData);
          container.appendChild(packageElement);
        });
      }
    } catch (error) {
      console.error('Error fetching trip packages:', error);
    }
  }

  // Function to create a trip package element (example)
  function createPackageElement(packageData) {
    const packageDiv = document.createElement('div');
    packageDiv.classList.add('trip-package'); // Add your styling classes here

    const imageElement = document.createElement('img');
    imageElement.src = packageData.image;
    imageElement.alt = packageData.name;
    packageDiv.appendChild(imageElement);

    const nameElement = document.createElement('h3');
    nameElement.textContent = packageData.name;
    packageDiv.appendChild(nameElement);

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = packageData.description;
    packageDiv.appendChild(descriptionElement);

    // Add more elements as needed (price, features, etc.)

    return packageDiv;
  }


  // Fetch and display testimonials (example)
  async function fetchTestimonials() {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/testimonials');
      const testimonials = await response.json();

      // Assuming you have a container with id 'testimonialsContainer'
      const container = document.getElementById('testimonialsContainer');
      if (container) {
        testimonials.forEach(testimonialData => {
          const testimonialElement = createTestimonialElement(testimonialData);
          container.appendChild(testimonialElement);
        });
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  }

  // Function to create a testimonial element (example)
  function createTestimonialElement(testimonialData) {
    const testimonialDiv = document.createElement('div');
    testimonialDiv.classList.add('testimonial'); // Add your styling classes here

    const quoteElement = document.createElement('p');
    quoteElement.textContent = testimonialData.quote;
    testimonialDiv.appendChild(quoteElement);

    const authorElement = document.createElement('p');
    authorElement.textContent = `- ${testimonialData.author}`;
    testimonialDiv.appendChild(authorElement);

    // Add more elements as needed (image, rating, etc.)

    return testimonialDiv;
  }


  // Example hover effect (add to your CSS for styling)
  const hoverElements = document.querySelectorAll('.hover-effect'); // Replace with your target elements

  hoverElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      element.classList.add('hovered'); // Add a class on hover
    });
    element.addEventListener('mouseleave', () => {
      element.classList.remove('hovered'); // Remove the class on mouse leave
    });
  });

  // Call the fetch functions (if you have those endpoints)
  // fetchTripPackages();
  // fetchTestimonials();

});