// script.js

// Smooth Scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Fade In animation for elements with class 'fade-in'
const fadeInElements = document.querySelectorAll('.fade-in');

const fadeIn = function (entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up'); // Assuming you have this class defined in CSS or Tailwind
            observer.unobserve(entry.target);
        }
    });
};

const fadeInObserver = new IntersectionObserver(fadeIn, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1 // Adjust threshold as needed
});

fadeInElements.forEach(element => {
    fadeInObserver.observe(element);
});

// Lazy Loading for images and videos
const lazyLoadImages = document.querySelectorAll('img[loading="lazy"]');
const lazyLoadVideos = document.querySelectorAll('video[loading="lazy"]');

const lazyLoad = function (entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;
            target.src = target.dataset.src; // Or target.srcset if using srcset
            target.removeAttribute('loading');
            observer.unobserve(target);

            target.addEventListener('load', () => {
                target.classList.add('loaded'); // Add a class when loaded, for styling
            });
        }
    });
};

const lazyLoadObserver = new IntersectionObserver(lazyLoad, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
});

lazyLoadImages.forEach(image => {
    lazyLoadObserver.observe(image);
});

lazyLoadVideos.forEach(video => {
    lazyLoadObserver.observe(video);
});

// Form Submission Handling (Example) - Adjust to your specific form and backend
const contactForm = document.getElementById('contact-form'); // Assuming you have a form with this ID

if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData(contactForm);

        // Replace with your actual API endpoint
        fetch('/api/submit-form', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Handle success - display a success message, clear the form, etc.
            alert('Form submitted successfully!');
            contactForm.reset();
        })
        .catch(error => {
            // Handle error - display an error message
            console.error('There was an error submitting the form:', error);
            alert('There was an error submitting the form. Please try again later.');
        });
    });
}

// Add any other interactive elements or animations here