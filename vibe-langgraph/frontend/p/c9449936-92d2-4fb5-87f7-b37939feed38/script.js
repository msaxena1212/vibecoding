// Mobile Menu Logic
const menuButton = document.querySelector('.bg-orange-500 .container button');
const nav = document.querySelector('.bg-orange-500 .container nav');

if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
        nav.classList.toggle('hidden');
        nav.classList.toggle('flex');
        nav.classList.toggle('flex-col');
        nav.classList.toggle('absolute');
        nav.classList.toggle('top-full');
        nav.classList.toggle('left-0');
        nav.classList.toggle('w-full');
        nav.classList.toggle('bg-orange-500');
        nav.classList.toggle('p-4');
    });
}

// Intersection Observer for .reveal elements
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15, // Adjust as needed
});

document.querySelectorAll('.reveal').forEach((element) => {
    observer.observe(element);
});
