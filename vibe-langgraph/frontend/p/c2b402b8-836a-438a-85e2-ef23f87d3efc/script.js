// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const burgerIcon = document.querySelector('header button');
    const nav = document.querySelector('header nav');

    burgerIcon.addEventListener('click', function() {
        nav.classList.toggle('hidden');
    });
});
