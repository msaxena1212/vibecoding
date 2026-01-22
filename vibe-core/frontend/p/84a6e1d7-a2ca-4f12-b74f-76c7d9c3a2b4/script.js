document.addEventListener('DOMContentLoaded', function() {
  // Mobile Menu Functionality
  const mobileMenuTrigger = document.querySelector('.nav-mobile-trigger');
  const mobileMenu = document.querySelector('.nav-mobile');
  const body = document.body;

  if (mobileMenuTrigger && mobileMenu) {
    mobileMenuTrigger.addEventListener('click', function(e) {
      e.preventDefault();
      mobileMenu.classList.toggle('active');
      body.classList.toggle('overflow-hidden'); // Prevent scrolling when menu is open
    });

    // Close menu when clicking outside (optional, but good UX)
    document.addEventListener('click', function(event) {
      if (!mobileMenu.contains(event.target) && !mobileMenuTrigger.contains(event.target) && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        body.classList.remove('overflow-hidden');
      }
    });
  } else {
    console.warn('Mobile menu trigger or menu not found.');
  }

  // Reveal on Scroll Functionality (Intersection Observer)
  const reveals = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target); // Stop observing after revealed
      }
    });
  }, { threshold: 0.2 }); // Adjust threshold as needed

  reveals.forEach(reveal => {
    observer.observe(reveal);
  });

  // Back to Top Button
  const backToTopButton = document.createElement('button');
  backToTopButton.id = 'back-to-top';
  backToTopButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>'; // Up arrow icon
  backToTopButton.classList.add('fixed', 'bottom-4', 'right-4', 'bg-blue-500', 'text-white', 'p-2', 'rounded-full', 'shadow-md', 'cursor-pointer', 'opacity-0', 'transition-opacity', 'duration-300', 'ease-in-out');
  document.body.appendChild(backToTopButton);

  // Show/Hide Back to Top Button
  window.addEventListener('scroll', () => {
    if (document.documentElement.scrollTop > 1000) {
      backToTopButton.classList.remove('opacity-0');
      backToTopButton.classList.add('opacity-100');
    } else {
      backToTopButton.classList.remove('opacity-100');
      backToTopButton.classList.add('opacity-0');
    }
  });

  // Smooth Scroll to Top
  backToTopButton.addEventListener('click', (e) => {
    e.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Smooth Scrolling for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Adjust offset if needed for sticky header
          behavior: 'smooth'
        });

        // Close mobile menu if open (scrolling from a menu link)
        if(mobileMenu.classList.contains('active')){
          mobileMenu.classList.remove('active');
          body.classList.remove('overflow-hidden');
        }
      }
    });
  });

  // Interactive Chart Functionality (Example)
  const charts = document.querySelectorAll('.interactive-chart'); // Add this class to your chart containers

  charts.forEach(chart => {
    chart.addEventListener('mouseover', (event) => {
      // Example: Highlight the hovered data point
      if (event.target.classList.contains('data-point')) {
        event.target.classList.add('highlighted');
      }
    });

    chart.addEventListener('mouseout', (event) => {
      // Remove highlight when mouse leaves
      if (event.target.classList.contains('data-point')) {
        event.target.classList.remove('highlighted');
      }
    });

    // Add more complex interaction logic here (tooltips, data updates, etc.)
  });
});