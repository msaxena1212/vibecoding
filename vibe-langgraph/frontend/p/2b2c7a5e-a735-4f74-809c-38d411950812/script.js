document.addEventListener('DOMContentLoaded', function() {
  // Image Preloading
  const imagesToPreload = [
    "assets/logo.png",
    "assets/iceland_cover.png",
    "assets/iceland_1.png",
    "assets/iceland_2.png",
    "assets/iceland_3.png",
    "assets/urban_cover.png",
    "assets/urban_1.png",
    "assets/urban_2.png",
    "assets/urban_3.png"
  ];

  imagesToPreload.forEach(imageUrl => {
    const img = new Image();
    img.src = imageUrl;
  });

  // Smooth Scrolling for Internal Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth',
        block: 'start' // Align the top of the element to the top of the viewport
      });
    });
  });

  // Reveal Animation (simple example, can be expanded)
  const elementsToReveal = document.querySelectorAll('.reveal'); // Add class="reveal" to elements you want to animate
  elementsToReveal.forEach(element => {
    element.classList.add('revealed'); // Trigger animation by adding 'revealed' class
  });
});