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

    // --- Initial Glitch Effect ---
    const glitchName = document.querySelector('.glitch-name');
    if (glitchName) {
        glitchName.classList.add('is-glitching');
        setTimeout(() => {
            glitchName.classList.remove('is-glitching');
        }, 5000);
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

// --- Vertical Scroll Progress Bar Logic ---
const scrollTrack = document.getElementById('vertical-scroll-track');
const scrollProgress = document.getElementById('vertical-scroll-progress');
let scrollTimeout; // Variable to hold the timer

if (scrollTrack && scrollProgress) {
    window.addEventListener('scroll', () => {
        // 1. Calculate the scroll percentage
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;

        // Update the height of the inner progress pill
        scrollProgress.style.height = scrolled + '%';

        // 2. Show the progress bar while actively scrolling
        scrollTrack.classList.add('is-visible');

        // 3. Clear the timer every time the user scrolls
        window.clearTimeout(scrollTimeout);

        // 4. Set a timer to hide the bar after scrolling stops (e.g., 1.2 seconds)
        scrollTimeout = setTimeout(() => {
            scrollTrack.classList.remove('is-visible');
        }, 1200);
    });
}



// --- Visitor IP Logging, Telemetry & Heartbeat ---

// Global states for telemetry
let maxScrollPercent = 0;
let pageLoadTime = null;

// Track Max Scroll
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = Math.round((winScroll / height) * 100);
    if (scrolled > maxScrollPercent) {
        maxScrollPercent = scrolled;
    }
});

// Calculate Page Load Time after everything renders
window.addEventListener('load', () => {
    setTimeout(() => {
        const navEntry = performance.getEntriesByType('navigation')[0];
        if (navEntry) {
            pageLoadTime = Math.round(navEntry.loadEventEnd - navEntry.startTime);
        }
    }, 0);
});

// Track Outbound & CTA Clicks
document.addEventListener('DOMContentLoaded', () => {
    const trackableElements = document.querySelectorAll('a, button');
    trackableElements.forEach(el => {
        el.addEventListener('click', (e) => {
            const url = el.getAttribute('href') || 'button-click';
            const text = el.innerText.trim().substring(0, 40) || el.getAttribute('aria-label') || 'icon/image';

            fetch('https://hook.peterfarah.com/track-click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: url,
                    text: text,
                    page: window.location.pathname
                }),
                keepalive: true // Ensures the request fires even if the tab closes/navigates away
            }).catch(() => {});
        });
    });
});

function sendHeartbeat() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || urlParams.get('source') || null;

    const payload = {
        page: window.location.pathname,
        referrer: document.referrer || 'Direct',
        user_agent: navigator.userAgent,
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language || navigator.userLanguage,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        theme: localStorage.getItem('theme') || 'dark',
        max_scroll: maxScrollPercent,
        load_time: pageLoadTime,
        network_type: connection ? connection.effectiveType : 'unknown',
        downlink: connection ? connection.downlink : null,
        device_memory: navigator.deviceMemory || null,
        cores: navigator.hardwareConcurrency || null,
        visibility_state: document.visibilityState,
        utm_source: utmSource,
        // Native Bot Detection (evaluates to 1 if automated webdriver is present, 0 otherwise)
        is_bot: navigator.webdriver ? 1 : 0
    };

    fetch('https://hook.peterfarah.com/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // Ensures the request finishes firing even if the browser tab closes
        keepalive: true
    }).catch(() => {});
}

document.addEventListener('DOMContentLoaded', () => {
    sendHeartbeat(); // Send immediately on load
    setInterval(sendHeartbeat, 10000); // Send heartbeat every 10 seconds
});

// --- Exit Intent / Page Unload Beacons ---
// Fires the exact moment the user switches tabs or closes the window
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        sendHeartbeat();
    }
});

// Fallback for mobile browsers (especially Safari) that rely on the pagehide event
window.addEventListener('pagehide', () => {
    sendHeartbeat();
});