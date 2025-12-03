function toggleMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
}

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu a');

    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            const mobileMenu = document.getElementById('mobile-menu');
            mobileMenu.classList.add('hidden');
        });
    });
});

window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');

    if (window.scrollY > 50) {
        nav.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    } else {
        nav.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const navHeight = document.querySelector('nav').offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});
