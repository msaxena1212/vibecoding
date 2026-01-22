// script.js

// Polyfill for requestAnimationFrame
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                               || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
}());


// Fade-in-up animation on scroll
function reveal() {
  var reveals = document.querySelectorAll(".reveal");

  for (var i = 0; i < reveals.length; i++) {
    var windowHeight = window.innerHeight;
    var elementTop = reveals[i].getBoundingClientRect().top;
    var elementVisible = 150;

    if (elementTop < windowHeight - elementVisible) {
      reveals[i].classList.add("active");
    } else {
      reveals[i].classList.remove("active");
    }
  }
}

window.addEventListener("scroll", reveal);

// Initial reveal on page load
reveal();


// Form Validation (Example - adjust as needed)
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form'); // Assuming you have a form

  if (form) {
    form.addEventListener('submit', function(event) {
      let isValid = true;

      // Example validation - check if required fields are filled
      const requiredFields = form.querySelectorAll('[required]');
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('error'); // Add error class for styling
        } else {
          field.classList.remove('error');
        }
      });

      if (!isValid) {
        event.preventDefault(); // Prevent form submission
        alert('Please fill in all required fields.');
      }
    });
  }
});

// Micro-interactions (Example - adjust as needed)
const buttons = document.querySelectorAll('button'); // Or specific buttons

buttons.forEach(button => {
  button.addEventListener('mouseover', function() {
    button.classList.add('hovered'); // Add a class on hover
  });

  button.addEventListener('mouseout', function() {
    button.classList.remove('hovered');
  });
});