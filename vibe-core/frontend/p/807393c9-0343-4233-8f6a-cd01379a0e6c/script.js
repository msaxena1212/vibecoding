document.addEventListener('DOMContentLoaded', function() {
    // Parallax Scrolling
    window.addEventListener('scroll', function() {
        let parallaxElements = document.querySelectorAll('.parallax');
        parallaxElements.forEach(element => {
            let speed = parseFloat(element.dataset.speed || "0.5"); // Default to 0.5 if not specified
            let yOffset = window.pageYOffset * speed;
            element.style.transform = `translateY(${yOffset}px)`;
        });
    });

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Flickering Animation (Example - apply to elements with class 'flicker')
    function flicker(element) {
        setInterval(() => {
            element.style.opacity = Math.random() > 0.5 ? 1 : 0.5;
        }, 150); // Adjust timing as needed
    }

    document.querySelectorAll('.flicker').forEach(element => {
        flicker(element);
    });


    // Interactive Hotspots (Example - for location maps)
    function addHotspotListeners() {
        const hotspots = document.querySelectorAll('.hotspot'); // Assuming hotspots have this class
        hotspots.forEach(hotspot => {
            hotspot.addEventListener('click', function(e) {
                e.preventDefault();
                const locationId = this.dataset.locationId; // Assuming each hotspot has a data-location-id
                alert(`Hotspot clicked for location ID: ${locationId}`); // Replace with your desired action
            });
        });
    }

    addHotspotListeners(); // Call this function after the DOM is fully loaded.

});