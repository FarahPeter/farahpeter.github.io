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
    // Magnetic Buttons
    document.querySelectorAll('.btn, nav ul li a.nav-highlight').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width  / 2;
        const centerY = rect.top  + rect.height / 2;
        const distX = (e.clientX - centerX) * 0.3;
        const distY = (e.clientY - centerY) * 0.3;
        btn.style.transform = `translate(${distX}px, ${distY}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });

    // Header Parallax
    const parallaxImage = document.getElementById('profile-image');
    const parallaxName  = document.querySelector('header h1');
    const parallaxSub   = document.querySelector('.page-subtitle');

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (parallaxImage) parallaxImage.style.transform = `translateY(${y * 0.15}px)`;
      if (parallaxName)  parallaxName.style.transform  = `translateY(${y * 0.08}px)`;
      if (parallaxSub)   parallaxSub.style.transform   = `translateY(${y * 0.05}px)`;
    });

    // --- Initial Glitch Effect ---
    const glitchName = document.querySelector('.glitch-name');
    if (glitchName) {
        glitchName.classList.add('is-glitching');
        setTimeout(() => {
            glitchName.classList.remove('is-glitching');
        }, 5000);
    }
    });

        // Custom Cursor
    const cursorDot  = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');

    if (window.matchMedia('(pointer: fine)').matches) {
      let ringX = 0, ringY = 0;
      let dotX  = 0, dotY  = 0;

      window.addEventListener('mousemove', (e) => {
        dotX = e.clientX;
        dotY = e.clientY;
      });

      (function animateCursor() {
        requestAnimationFrame(animateCursor);

        // Dot snaps instantly
        cursorDot.style.left = dotX + 'px';
        cursorDot.style.top  = dotY + 'px';

        // Ring lerps behind — creates the lag/weight
        ringX += (dotX - ringX) * 0.12;
        ringY += (dotY - ringY) * 0.12;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top  = ringY + 'px';
      })();

      // Expand on interactive elements
      document.querySelectorAll('a, button, .btn, .skill-badge, .timeline-card').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
      });
    }

    // Skill Tooltips
    document.querySelectorAll('.skill-badge[data-level]').forEach(badge => {
      const level = badge.getAttribute('data-level');
      const label = badge.getAttribute('data-label') || '';

      const tip = document.createElement('div');
      tip.className = 'skill-tooltip';
      tip.innerHTML = `
        <span>${label}</span>
        <div class="skill-tooltip-bar-track">
          <div class="skill-tooltip-bar-fill" style="width: 0%"></div>
        </div>
      `;
      badge.appendChild(tip);

      // Animate bar on hover
      badge.addEventListener('mouseenter', () => {
        tip.querySelector('.skill-tooltip-bar-fill').style.width = level + '%';
      });
      badge.addEventListener('mouseleave', () => {
        tip.querySelector('.skill-tooltip-bar-fill').style.width = '0%';
      });
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

// Boot screen — only fires once per session
if (!sessionStorage.getItem('booted')) {
  const bootScreen = document.getElementById('boot-screen');
  const bootLines  = document.getElementById('boot-lines');

  const lines = [
    '> Initializing peterfarah.com...',
    '> Authenticating session...',
    '> Loading profile: Peter Farah',
    '> Role: Automation Engineer @ Murex',
    '> Status: All systems operational ✓',
  ];

  lines.forEach((text, i) => {
    const div = document.createElement('div');
    div.className = 'boot-line';
    div.textContent = text;
    div.style.animationDelay = `${i * 300}ms`;
    bootLines.appendChild(div);
  });

  setTimeout(() => {
    bootScreen.classList.add('fade-out');
    setTimeout(() => bootScreen.remove(), 700);
    sessionStorage.setItem('booted', '1');
  }, lines.length * 300 + 700);
} else {
  document.getElementById('boot-screen')?.remove();
}

// 3D Tilt Effect
document.querySelectorAll('.timeline-card, .job, .project, .certificate').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6; // max 6deg
    const rotateY = ((x - centerX) / centerX) *  6;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});


// Text Scramble on Section Titles
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
    this.original = el.textContent;
    this.frame = 0;
  }

  scramble() {
    let iteration = 0;
    const original = this.original;
    const el = this.el;
    const chars = this.chars;

    clearInterval(this._interval);
    this._interval = setInterval(() => {
      el.textContent = original
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' ';
          if (i < iteration) return original[i];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      if (iteration >= original.length) clearInterval(this._interval);
      iteration += 0.5;
    }, 40);
  }
}

// Attach to all section titles via IntersectionObserver
document.querySelectorAll('.section-title').forEach(title => {
  const scrambler = new TextScramble(title);
  let fired = false;

  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !fired) {
      fired = true;
      scrambler.scramble();
      obs.unobserve(title);
    }
  }, { threshold: 0.5 });

  obs.observe(title);
});

// Konami Code Easter Egg
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiProgress = 0;

window.addEventListener('keydown', (e) => {
  if (e.key === KONAMI[konamiProgress]) {
    konamiProgress++;
    if (konamiProgress === KONAMI.length) {
      konamiProgress = 0;
      triggerEasterEgg();
    }
  } else {
    konamiProgress = 0;
  }
});

function triggerEasterEgg() {
  // Fire the glitch on the name
  const glitch = document.querySelector('.glitch-name');
  if (glitch) {
    glitch.classList.add('is-glitching');
    setTimeout(() => glitch.classList.remove('is-glitching'), 2000);
  }

  // Flash a terminal message
  const toast = document.createElement('div');
  toast.textContent = '> ACCESS GRANTED — Nice try, hacker.';
  toast.style.cssText = `
    position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
    background: #141414; border: 1px solid #4ade80; color: #4ade80;
    font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;
    padding: 12px 24px; border-radius: 8px; z-index: 99999;
    box-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
    animation: cmd-drop 0.2s ease;
    white-space: nowrap;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Mouse Trail
const trailCanvas = document.getElementById('mouse-trail');
const trailCtx    = trailCanvas.getContext('2d');
const trailPoints = []; // { x, y, t }
const TRAIL_MS    = 250;

function resizeTrail() {
  trailCanvas.width  = window.innerWidth;
  trailCanvas.height = window.innerHeight;
}
resizeTrail();
window.addEventListener('resize', resizeTrail);

window.addEventListener('mousemove', (e) => {
  trailPoints.push({ x: e.clientX, y: e.clientY, t: performance.now() });
});

(function drawTrail() {
  requestAnimationFrame(drawTrail);
  trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

  const now = performance.now();

  // Drop points older than 250ms
  while (trailPoints.length && now - trailPoints[0].t > TRAIL_MS) {
    trailPoints.shift();
  }

  if (trailPoints.length < 2) return;

  for (let i = 1; i < trailPoints.length; i++) {
    const p1 = trailPoints[i - 1];
    const p2 = trailPoints[i];
    const age     = now - p2.t;
    const opacity = 1 - age / TRAIL_MS; // 1 at tip, 0 at tail

    trailCtx.beginPath();
    trailCtx.moveTo(p1.x, p1.y);
    trailCtx.lineTo(p2.x, p2.y);
    trailCtx.strokeStyle    = `rgba(192, 192, 192, ${opacity * 0.55})`;
    trailCtx.lineWidth      = opacity * 3;
    trailCtx.lineCap        = 'round';
    trailCtx.lineJoin       = 'round';
    trailCtx.shadowColor    = `rgba(220, 220, 220, ${opacity * 0.8})`;
    trailCtx.shadowBlur     = 8 * opacity;
    trailCtx.stroke();
  }
})();