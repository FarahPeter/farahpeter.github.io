/* ================================================
   Peter Farah Portfolio — script.js
   All interactive effects, analytics, and UI logic
   ================================================ */

// ===== MOBILE NAVIGATION DRAWER =====
(function initNav() {
  const menuBtn   = document.getElementById('mobile-menu-btn');
  const drawer    = document.getElementById('nav-drawer');
  const overlay   = document.getElementById('nav-overlay');
  const closeBtn  = document.getElementById('drawer-close');

  function openDrawer() {
    drawer?.classList.add('open');
    overlay?.classList.add('open');
    menuBtn?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer?.classList.remove('open');
    overlay?.classList.remove('open');
    menuBtn?.classList.remove('open');
    document.body.style.overflow = '';
  }

  menuBtn?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', closeDrawer);

  // Close on any drawer link click
  drawer?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
})();


// ===== THEME TOGGLE =====
(function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');

  function toggleTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }

  document.querySelectorAll('#theme-toggle, #drawer-theme').forEach(btn => {
    btn?.addEventListener('click', (e) => { e.preventDefault(); toggleTheme(); });
  });
})();


// ===== CUSTOM CURSOR (desktop only) =====
(function initCursor() {
  const cursorDot  = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  if (!cursorDot || !cursorRing) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  let ringX = 0, ringY = 0, dotX = 0, dotY = 0;

  window.addEventListener('mousemove', (e) => { dotX = e.clientX; dotY = e.clientY; });

  (function animateCursor() {
    requestAnimationFrame(animateCursor);
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top  = dotY + 'px';
    ringX += (dotX - ringX) * 0.12;
    ringY += (dotY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
  })();

  document.querySelectorAll('a, button, .btn, .skill-badge, .timeline-card, .blog-cover, .project').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();


// ===== MOUSE TRAIL CANVAS =====
(function initMouseTrail() {
  const canvas = document.getElementById('mouse-trail');
  if (!canvas) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const ctx    = canvas.getContext('2d');
  const points = [];
  const MS     = 250;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    points.push({ x: e.clientX, y: e.clientY, t: performance.now() });
  });

  (function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = performance.now();
    while (points.length && now - points[0].t > MS) points.shift();
    if (points.length < 2) return;
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1], p2 = points[i];
      const age  = now - p2.t;
      const fade = 1 - age / MS;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(34, 211, 238, ${fade * 0.45})`;
      ctx.lineWidth   = fade * 2.5;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.shadowColor = `rgba(34, 211, 238, ${fade * 0.6})`;
      ctx.shadowBlur  = 6 * fade;
      ctx.stroke();
    }
  })();
})();


// ===== SCROLL REVEAL =====
(function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0 });

  reveals.forEach(el => obs.observe(el));

  // Immediately reveal anything already in viewport
  setTimeout(() => {
    reveals.forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('active');
        obs.unobserve(el);
      }
    });
  }, 100);
})();


// ===== ACTIVE NAV LINK (scroll-based) =====
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('nav a[href^="#"], #nav-drawer a[href^="#"]');
  if (!sections.length || !navItems.length) return;

  window.addEventListener('scroll', () => {
    let current = '';
    const trigger = window.scrollY + window.innerHeight / 3;
    sections.forEach(s => {
      if (trigger >= s.offsetTop && trigger < s.offsetTop + s.offsetHeight) {
        current = s.getAttribute('id');
      }
    });
    navItems.forEach(a => {
      a.classList.toggle('active-link', current && a.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });
})();


// ===== SCROLL PROGRESS BAR =====
(function initScrollProgress() {
  const track    = document.getElementById('vertical-scroll-track');
  const progress = document.getElementById('vertical-scroll-progress');
  if (!track || !progress) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollTop  = window.scrollY;
        const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
        const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progress.style.height = pct + '%';
        track.classList.toggle('is-visible', scrollTop > 150);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


// ===== BACK TO TOP =====
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 300);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


// ===== BLOG POST EXPAND / COLLAPSE =====
(function initBlogPosts() {
  document.querySelectorAll('.blog-cover').forEach(cover => {
    cover.addEventListener('click', function () {
      const post = this.closest('.blog-post');
      const wasExpanded = post.classList.contains('expanded');

      document.querySelectorAll('.blog-post').forEach(p => p.classList.remove('expanded'));

      if (!wasExpanded) {
        post.classList.add('expanded');
        setTimeout(() => {
          const navH = document.querySelector('nav')?.offsetHeight || 64;
          const top  = post.getBoundingClientRect().top + window.scrollY - navH - 16;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 80);
      }
    });
  });
})();


// ===== SKILL BADGE TOOLTIPS =====
(function initSkillTooltips() {
  document.querySelectorAll('.skill-badge[data-level]').forEach(badge => {
    const level = badge.getAttribute('data-level');
    const label = badge.getAttribute('data-label') || '';
    const tip = document.createElement('div');
    tip.className = 'skill-tooltip';
    tip.innerHTML = `<span>${label}</span><div class="skill-tooltip-bar-track"><div class="skill-tooltip-bar-fill" style="width:0%"></div></div>`;
    badge.appendChild(tip);
    badge.addEventListener('mouseenter', () => tip.querySelector('.skill-tooltip-bar-fill').style.width = level + '%');
    badge.addEventListener('mouseleave', () => tip.querySelector('.skill-tooltip-bar-fill').style.width = '0%');
  });
})();


// ===== MAGNETIC BUTTONS =====
(function initMagneticBtns() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll('.btn, nav a.nav-highlight').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * 0.3;
      const dy = (e.clientY - (r.top  + r.height / 2)) * 0.3;
      btn.style.transform = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });
})();


// ===== 3D CARD TILT =====
(function initCardTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll('.timeline-card, .project').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r  = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -5;
      const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  5;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });
})();


// ===== HEADER PARALLAX (desktop only) =====
(function initParallax() {
  if (!window.matchMedia('(min-width: 768px)').matches) return;
  const img = document.getElementById('profile-image');
  const h1  = document.querySelector('header h1');
  const sub = document.querySelector('.page-subtitle');
  if (!img && !h1) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (img) img.style.transform = `scale(1) translateY(${y * 0.12}px)`;
    if (h1)  h1.style.transform  = `translateY(${y * 0.06}px)`;
    if (sub) sub.style.transform = `translateY(${y * 0.04}px)`;
  }, { passive: true });
})();


// ===== INITIAL GLITCH EFFECT =====
(function initGlitch() {
  const el = document.querySelector('.glitch-name');
  if (!el) return;
  el.classList.add('is-glitching');
  setTimeout(() => el.classList.remove('is-glitching'), 4000);
})();


// ===== TEXT SCRAMBLE ON SECTION TITLES =====
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
    this.original = el.textContent;
  }
  scramble() {
    let iter = 0;
    const { el, chars, original } = this;
    clearInterval(this._iv);
    this._iv = setInterval(() => {
      el.textContent = original.split('').map((c, i) => {
        if (c === ' ') return ' ';
        if (i < iter) return original[i];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      if (iter >= original.length) clearInterval(this._iv);
      iter++;
    }, 38);
  }
}

document.querySelectorAll('.section-title').forEach(title => {
  const s = new TextScramble(title);
  let fired = false;
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !fired) { fired = true; s.scramble(); obs.unobserve(title); }
  }, { threshold: 0.5 });
  obs.observe(title);
});


// ===== KONAMI CODE EASTER EGG =====
(function initKonami() {
  const CODE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let i = 0;
  window.addEventListener('keydown', (e) => {
    if (e.key === CODE[i]) { i++; if (i === CODE.length) { i = 0; triggerEgg(); } }
    else i = 0;
  });

  function triggerEgg() {
    const g = document.querySelector('.glitch-name');
    if (g) { g.classList.add('is-glitching'); setTimeout(() => g.classList.remove('is-glitching'), 2000); }
    const toast = document.createElement('div');
    toast.textContent = '> ACCESS GRANTED — Nice try, hacker.';
    toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#0c1520;border:1px solid #4ade80;color:#4ade80;font-family:"JetBrains Mono",monospace;font-size:0.85rem;padding:12px 24px;border-radius:8px;z-index:99999;box-shadow:0 0 20px rgba(74,222,128,0.3);white-space:nowrap;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
})();


// ===== BOOT SCREEN (once per session) =====
(function initBoot() {
  const bootScreen = document.getElementById('boot-screen');
  if (!bootScreen) return;

  if (!sessionStorage.getItem('booted')) {
    const bootLines = document.getElementById('boot-lines');
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
      div.style.animationDelay = `${i * 100}ms`;
      bootLines?.appendChild(div);
    });
    setTimeout(() => {
      bootScreen.classList.add('fade-out');
      setTimeout(() => bootScreen.remove(), 700);
      sessionStorage.setItem('booted', '1');
    }, lines.length * 100 + 700);
  } else {
    bootScreen.remove();
  }
})();


// ===== ANALYTICS HEARTBEAT =====
(function initHeartbeat() {
  const pageLoadTime = performance.now();
  let maxScroll = 0;

  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    if (pct > maxScroll) maxScroll = pct;
  }, { passive: true });

  function sendHeartbeat() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const params = new URLSearchParams(window.location.search);
    fetch('https://hook.peterfarah.com/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: window.location.pathname,
        referrer: document.referrer,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        theme: localStorage.getItem('theme') || 'dark',
        max_scroll: maxScroll,
        load_time: pageLoadTime,
        network_type: conn ? conn.effectiveType : 'unknown',
        downlink: conn ? conn.downlink : null,
        device_memory: navigator.deviceMemory || null,
        cores: navigator.hardwareConcurrency || null,
        visibility_state: document.visibilityState,
        utm_source: params.get('utm_source'),
        is_bot: navigator.webdriver ? 1 : 0,
      }),
      keepalive: true,
    }).catch(() => {});
  }

  document.addEventListener('DOMContentLoaded', () => {
    sendHeartbeat();
    setInterval(sendHeartbeat, 10000);
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') sendHeartbeat(); });
  window.addEventListener('pagehide', sendHeartbeat);
})();


// ===== SYSTEM STATUS BADGE =====
(function initStatusBadge() {
  const badge = document.getElementById('system-status');
  if (!badge) return;
  fetch('https://up.peterfarah.com/api/status-page/heartbeat/main', { signal: AbortSignal.timeout(4000) })
    .then(r => r.json())
    .then(data => {
      const up = Object.values(data?.heartbeatList || {}).every(list => list.at(-1)?.status === 1);
      badge.querySelector('.status-text').textContent = up ? 'Systems Online' : 'Degraded';
      if (!up) badge.classList.add('status-error');
    })
    .catch(() => {});
})();