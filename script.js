document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (menuBtn && navMenu) {
        // Toggle the menu when the hamburger icon is clicked
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });

        // Close the menu automatically when a link is clicked
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
            });
        });
    }
});

// --- Back to Top Button Logic ---
    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        // Show or hide the button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        // Smooth scroll to top when clicked
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

// --- Scroll Reveal Logic ---
    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Stop observing once revealed
            }
        });
    }, {
        rootMargin: "0px 0px -50px 0px", // Still waits until the element is 50px above the bottom of the screen
        threshold: 0 // <--- CHANGED THIS FROM 0.1 TO 0
    });

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });

    // Fallback: Manually trigger the reveal for elements already at the top of the page on load
    setTimeout(() => {
        reveals.forEach(reveal => {
            const rect = reveal.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                reveal.classList.add('active');
                revealObserver.unobserve(reveal);
            }
        });
    }, 100);

// --- Active Navigation Highlight ---
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('nav ul li a[href^="#"]');

    window.addEventListener('scroll', () => {
        let current = '';

        // Creates an imaginary activation line 1/3 of the way down the screen.
        // If you want it to trigger exactly in the middle of the screen, change '3' to '2'.
        const triggerPoint = window.scrollY + (window.innerHeight / 3);

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            // Check if the activation line is currently inside this section
            if (triggerPoint >= sectionTop && triggerPoint < sectionBottom) {
                current = section.getAttribute('id');
            }
        });

        // Update the navigation links
        navItems.forEach(a => {
            a.classList.remove('active-link');
            if (current && a.getAttribute('href') === `#${current}`) {
                a.classList.add('active-link');
            }
        });
    });

// --- Dark/Light Mode Toggle ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rootElement = document.documentElement;

    // 1. Check if the user already chose a theme in a previous session
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        rootElement.setAttribute('data-theme', 'light');
    }

    // 2. Handle the click event to swap themes
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent the link from jumping to the top of the page

            const currentTheme = rootElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            rootElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme); // Save preference
        });
    }