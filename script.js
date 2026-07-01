/* ==========================================================================
   Peter Farah — Portfolio interactions
   Liquid-glass build · vanilla JS, no dependencies
   ========================================================================== */
(function () {
  'use strict';

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduceMotion = false; // animations always on (was: matchMedia('(prefers-reduced-motion: reduce)').matches)
  const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ============================== THEME ============================== */
  (function theme() {
    const root = document.documentElement;
    let saved = null;
    try { saved = localStorage.getItem('pf-theme'); } catch (e) {}
    root.setAttribute('data-theme', saved || 'dark');
    function toggle() {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('pf-theme', next); } catch (e) {}
    }
    ['theme-toggle', 'drawer-theme'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', toggle);
    });
  })();

  /* ============================== CUSTOM CURSOR ============================== */
  (function cursor() {
    if (!finePointer) return;
    const glow = $('#cursor-dot');               // repurposed: a soft glow under the native arrow
    if (!glow) return;
    let mx = innerWidth / 2, my = innerHeight / 2;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      // small offset so the glow sits under the arrow body rather than its tip
      glow.style.transform = `translate(${mx + 7}px, ${my + 9}px) translate(-50%, -50%)`;
    });
    const hov = 'a, button, summary, .blog-cover, .cmd-item, input, .skill, .project, .hero-stat, .tile-hover';
    document.addEventListener('mouseover', e => { if (e.target.closest(hov)) glow.classList.add('hover'); });
    document.addEventListener('mouseout',  e => { if (e.target.closest(hov)) glow.classList.remove('hover'); });

    const cv = $('#mouse-trail');
    if (cv && !reduceMotion) {
      const ctx = cv.getContext('2d');
      function size() { cv.width = innerWidth; cv.height = innerHeight; }
      size(); window.addEventListener('resize', size);
      const pts = [];
      window.addEventListener('mousemove', e => { pts.push({ x: e.clientX, y: e.clientY, life: 1 }); if (pts.length > 10) pts.shift(); });
      (function draw() {
        ctx.clearRect(0, 0, cv.width, cv.height);
        for (let k = 0; k < pts.length; k++) {
          const p = pts[k]; p.life -= 0.08;
          if (p.life <= 0) continue;
          ctx.beginPath();
          ctx.arc(p.x, p.y, (k / pts.length) * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(77, 141, 255, ${p.life * 0.12})`;
          ctx.fill();
        }
        requestAnimationFrame(draw);
      })();
    }
  })();

  /* ============================== NETWORK BACKGROUND ============================== */
  (function network() {
    const cv = $('#net-canvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let w, h, nodes = [], packets = [];
    const COUNT = () => Math.min(64, Math.round((innerWidth * innerHeight) / 27000));

    function accent() { return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#4d8dff'; }
    function rgb() {
      const a = accent();
      if (a[0] === '#') {
        const n = a.length === 4
          ? a.slice(1).split('').map(c => parseInt(c + c, 16))
          : [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
        return n.join(',');
      }
      return '77,141,255';
    }
    let COL = rgb();

    function init() {
      w = cv.width = innerWidth; h = cv.height = innerHeight;
      const n = COUNT(); nodes = [];
      for (let i = 0; i < n; i++) {
        // ~30% of nodes are "big" (larger radius + brighter); ~70% small/faint
        const big = Math.random() < 0.3;
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
          r: big ? 2.4 : 1.3, a: big ? 0.7 : 0.32
        });
      }
      COL = rgb();
    }
    init(); window.addEventListener('resize', init);

    function spawnPacket() {
      if (nodes.length < 2) return;
      const a = nodes[(Math.random() * nodes.length) | 0], b = nodes[(Math.random() * nodes.length) | 0];
      if (a === b) return;
      packets.push({ a, b, t: 0, speed: 0.005 + Math.random() * 0.009 });
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      COL = rgb();
      for (const nd of nodes) {
        nd.x += nd.vx; nd.y += nd.vy;
        if (nd.x < 0 || nd.x > w) nd.vx *= -1;
        if (nd.y < 0 || nd.y > h) nd.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
          if (d < 150) {
            ctx.strokeStyle = `rgba(${COL}, ${(1 - d / 150) * 0.09})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const nd of nodes) { ctx.beginPath(); ctx.arc(nd.x, nd.y, nd.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(${COL}, ${nd.a})`; ctx.fill(); }
      for (let k = packets.length - 1; k >= 0; k--) {
        const p = packets[k]; p.t += p.speed;
        if (p.t >= 1) { packets.splice(k, 1); continue; }
        const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${COL}, 0.95)`; ctx.shadowBlur = 10; ctx.shadowColor = `rgba(${COL},0.9)`; ctx.fill(); ctx.shadowBlur = 0;
      }
      if (packets.length < 6 && Math.random() < 0.045) spawnPacket();
      if (!reduceMotion) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  /* ============================== SCROLL PROGRESS + NAV ============================== */
  (function scrollUI() {
    const bar = $('#vertical-scroll-progress'), nav = $('nav');
    let lastY = 0;
    function onScroll() {
      const st = window.scrollY || document.documentElement.scrollTop;
      const dh = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.width = (dh > 0 ? (st / dh) * 100 : 0) + '%';
      if (nav) {
        nav.classList.toggle('scrolled', st > 12);
        if (st > 340 && st > lastY + 4) nav.classList.add('nav-hidden');
        else if (st < lastY - 4 || st < 340) nav.classList.remove('nav-hidden');
      }
      lastY = st;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ============================== MOBILE DRAWER ============================== */
  (function drawer() {
    const btn = $('#mobile-menu-btn'), dr = $('#nav-drawer'), ov = $('#nav-overlay'), close = $('#drawer-close');
    if (!btn || !dr) return;
    function open() { dr.classList.add('open'); ov && ov.classList.add('open'); btn.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; }
    function shut() { dr.classList.remove('open'); ov && ov.classList.remove('open'); btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
    btn.addEventListener('click', () => dr.classList.contains('open') ? shut() : open());
    close && close.addEventListener('click', shut);
    ov && ov.addEventListener('click', shut);
    $$('#nav-drawer a').forEach(a => a.addEventListener('click', shut));
    window.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });
  })();

  /* ============================== REVEAL ============================== */
  (function reveal() {
    const items = $$('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          if (en.target.id === 'skills' || en.target.querySelector('.skill-track')) en.target.classList.add('skills-revealed');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(i => io.observe(i));
  })();

  /* ============================== STAT COUNT-UP ============================== */
  (function counters() {
    const wrap = $('.hero-stats');
    if (!wrap) return;
    const nums = $$('.hero-stat-number', wrap);
    let done = false;
    function run() {
      if (done) return; done = true;
      nums.forEach(el => {
        const target = parseFloat(el.dataset.target || '0');
        const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
        const dur = 1500, t0 = performance.now();
        function step(now) {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + Math.round(target * eased) + suf;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }
    if (!('IntersectionObserver' in window)) { run(); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) run(); }), { threshold: 0.4 });
    io.observe(wrap);
  })();

  /* ============================== TYPING ROLE ============================== */
  (function typing() {
    const el = $('.typing-effect');
    if (!el) return;
    const text = el.dataset.text || el.textContent.trim();
    if (reduceMotion) { el.textContent = text; return; }
    el.textContent = '';
    let i = 0;
    (function type() { if (i <= text.length) { el.textContent = text.slice(0, i++); setTimeout(type, 55); } })();
  })();

  /* ============================== ACTIVE NAV ============================== */
  (function activeNav() {
    const links = $$('.nav-links a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    const map = {};
    links.forEach(a => { const id = a.getAttribute('href').slice(1); if (id) map[id] = a; });
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        const a = map[e.target.id]; if (!a) return;
        if (e.isIntersecting) { links.forEach(l => l.classList.remove('active')); a.classList.add('active'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(id => { const s = document.getElementById(id); if (s) io.observe(s); });
  })();

  /* ============================== COPY EMAIL ============================== */
  (function copyEmail() {
    const btn = $('#copy-email-btn'), toast = $('#copy-toast');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const email = 'peter@peterfarah.com';
      try { await navigator.clipboard.writeText(email); }
      catch (e) { const t = document.createElement('textarea'); t.value = email; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
      if (toast) { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); }
    });
  })();

  /* ============================== BACK TO TOP ============================== */
  (function backTop() {
    const btn = $('#back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 520), { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  })();

  /* ============================== BLOG EXPAND ============================== */
  (function blog() {
    const covers = $$('.blog-cover');
    if (!covers.length) return;
    function toggle(cover, force) {
      const wrap = cover.nextElementSibling;
      if (!wrap || !wrap.classList.contains('blog-content-wrapper')) return;
      const open = force != null ? force : !wrap.classList.contains('open');
      wrap.classList.toggle('open', open);
      cover.classList.toggle('expanded', open);
      const btn = $('.cover-toggle', cover);
      if (btn) btn.textContent = open ? 'Collapse write-up' : 'Click to Expand & Read';
    }
    covers.forEach(c => c.addEventListener('click', () => toggle(c)));
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target && target.classList.contains('blog-post')) {
        const cover = $('.blog-cover', target);
        if (cover) { toggle(cover, true); setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400); }
      }
    }
  })();

  /* ============================== COMMAND PALETTE ============================== */
  (function palette() {
    const pal = $('#cmd-palette'), back = $('#cmd-backdrop'), input = $('#cmd-input'), results = $('#cmd-results');
    if (!pal || !input || !results) return;
    const trigger = $('#cmd-trigger');
    const onIndex = !!document.getElementById('about');

    const ico = {
      doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
      hash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>',
      ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>',
      mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>'
    };
    const items = [
      { label: 'About', sub: 'section', icon: ico.hash, href: onIndex ? '#about' : 'index.html#about' },
      { label: 'Career Timeline', sub: 'section', icon: ico.hash, href: onIndex ? '#experience' : 'index.html#experience' },
      { label: 'Skills', sub: 'section', icon: ico.hash, href: onIndex ? '#skills' : 'index.html#skills' },
      { label: 'Projects', sub: 'section', icon: ico.hash, href: onIndex ? '#projects' : 'index.html#projects' },
      { label: 'Certificates & Honors', sub: 'section', icon: ico.hash, href: onIndex ? '#certificates' : 'index.html#certificates' },
      { label: 'Home / Profile', sub: 'page', icon: ico.doc, href: 'index.html' },
      { label: 'Research & Blog', sub: 'page', icon: ico.doc, href: 'blog.html' },
      { label: 'AQM Research Write-up', sub: 'blog', icon: ico.hash, href: 'blog.html#aqm-research' },
      { label: 'Home Server Architecture', sub: 'blog', icon: ico.hash, href: 'blog.html#home-server' },
      { label: 'Home NAS Architecture', sub: 'blog', icon: ico.hash, href: 'blog.html#home-nas' },
      { label: 'AQM Simulation Game', sub: 'lab', icon: ico.ext, href: 'FUN/AQMgame.html' },
      { label: 'Interactive Hub', sub: 'page', icon: ico.doc, href: 'fun.html' },
      { label: 'Service Access Panel', sub: 'page', icon: ico.doc, href: 'server.html' },
      { label: 'Download CV', sub: 'pdf', icon: ico.ext, href: 'Files/CV/CV_V16/CV-Peter_Farah.pdf', blank: true },
      { label: 'Email Peter', sub: 'contact', icon: ico.mail, href: 'mailto:peter@peterfarah.com' },
      { label: 'LinkedIn', sub: 'external', icon: ico.ext, href: 'https://www.linkedin.com/in/peter-farah-i', blank: true },
      { label: 'GitHub', sub: 'external', icon: ico.ext, href: 'https://github.com/FarahPeter', blank: true }
    ];
    let filtered = items.slice(), active = 0;

    function render() {
      results.innerHTML = '';
      if (!filtered.length) { results.innerHTML = '<div class="cmd-empty">No matches found</div>'; return; }
      filtered.forEach((it, idx) => {
        const row = document.createElement('div');
        row.className = 'cmd-item' + (idx === active ? ' active' : '');
        row.innerHTML = `<span class="cmd-ico">${it.icon}</span><span class="cmd-label">${it.label}</span><span class="cmd-sub">${it.sub}</span>`;
        row.addEventListener('click', () => go(it));
        row.addEventListener('mousemove', () => { active = idx; paint(); });
        results.appendChild(row);
      });
    }
    function paint() { $$('.cmd-item', results).forEach((r, i) => r.classList.toggle('active', i === active)); }
    function filter(q) {
      q = q.trim().toLowerCase();
      filtered = !q ? items.slice() : items.filter(it => (it.label + ' ' + it.sub).toLowerCase().includes(q));
      active = 0; render();
    }
    function go(it) {
      close(); if (!it) return;
      if (it.href.charAt(0) === '#') { const t = document.querySelector(it.href); if (t) t.scrollIntoView({ behavior: 'smooth' }); }
      else if (it.blank) { window.open(it.href, '_blank', 'noopener'); }
      else { window.location.href = it.href; }
    }
    function open() { back.classList.add('open'); pal.classList.add('open'); input.value = ''; filter(''); setTimeout(() => input.focus(), 30); }
    function close() { back.classList.remove('open'); pal.classList.remove('open'); }

    trigger && trigger.addEventListener('click', open);
    back.addEventListener('click', close);
    input.addEventListener('input', () => filter(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, filtered.length - 1); paint(); scrollActive(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); paint(); scrollActive(); }
      else if (e.key === 'Enter') { e.preventDefault(); go(filtered[active]); }
      else if (e.key === 'Escape') { close(); }
    });
    function scrollActive() { const el = $$('.cmd-item', results)[active]; if (el) el.scrollIntoView({ block: 'nearest' }); }
    window.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.classList.contains('open') ? close() : open(); }
    });
  })();

  /* ============================== CURSOR SPOTLIGHT ============================== */
  /* Delegated, rAF-throttled pointer tracking. Sets element-local --mx/--my (px)
     on the nearest spotlight-capable card so its CSS radial glow follows the cursor. */
  (function spotlight() {
    if (!finePointer) return;
    const SEL = '.tile-hover, .hub-card, .blog-cover';
    let px = 0, py = 0, cur = null, queued = false;
    function apply() {
      queued = false;
      if (!cur) return;
      const r = cur.getBoundingClientRect();
      cur.style.setProperty('--mx', (px - r.left) + 'px');
      cur.style.setProperty('--my', (py - r.top) + 'px');
    }
    document.addEventListener('pointermove', e => {
      const el = e.target.closest ? e.target.closest(SEL) : null;
      cur = el; px = e.clientX; py = e.clientY;
      if (el && !queued) { queued = true; requestAnimationFrame(apply); }
    }, { passive: true });
  })();

  /* ============================== 3D TILT (HERO PHOTO) ============================== */
  (function tilt() {
    if (!finePointer) return;
    const el = $('.hero-photo');
    if (!el) return;
    const MAX = 4; // degrees
    let queued = false, px = 0, py = 0;
    function apply() {
      queued = false;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const rx = Math.max(-MAX, Math.min(MAX, -((py - cy) / (r.height / 2)) * MAX));
      const ry = Math.max(-MAX, Math.min(MAX,  ((px - cx) / (r.width  / 2)) * MAX));
      el.style.transform = `perspective(800px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    }
    el.addEventListener('pointermove', e => {
      px = e.clientX; py = e.clientY;
      el.classList.add('tilt-3d');
      if (!queued) { queued = true; requestAnimationFrame(apply); }
    }, { passive: true });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
      el.classList.remove('tilt-3d');
    }, { passive: true });
  })();

  /* ============================== MAGNETIC BUTTONS ============================== */
  /* Pull the element a few px toward the cursor via --mag-x/--mag-y (composed
     into the element's CSS transform so the hover lift still applies). */
  (function magnetic() {
    if (!finePointer) return;
    const els = $$('.btn, .copy-email-btn, .social-icons a');
    if (!els.length) return;
    const MAX = 4; // px
    els.forEach(el => {
      let queued = false, px = 0, py = 0;
      function apply() {
        queued = false;
        const r = el.getBoundingClientRect();
        const dx = (px - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (py - (r.top + r.height / 2)) / (r.height / 2);
        el.style.setProperty('--mag-x', (Math.max(-1, Math.min(1, dx)) * MAX).toFixed(2) + 'px');
        el.style.setProperty('--mag-y', (Math.max(-1, Math.min(1, dy)) * MAX).toFixed(2) + 'px');
      }
      el.addEventListener('pointermove', e => {
        px = e.clientX; py = e.clientY;
        if (!queued) { queued = true; requestAnimationFrame(apply); }
      }, { passive: true });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--mag-x', '0px');
        el.style.setProperty('--mag-y', '0px');
      }, { passive: true });
    });
  })();

  /* ============================== REVEAL STAGGER ============================== */
  /* When a .reveal section enters, assign an incremental --i to its grid items
     so their CSS entrance transitions fan out. Watches the .in class via an
     observer so it composes with the existing reveal module (semantics intact). */
  (function stagger() {
    const sections = $$('.reveal');
    if (!sections.length) return;
    const GROUPS = [
      ['.projects-grid', ':scope > .project'],
      ['.skills-grid',   ':scope > .skills-container'],
      ['.cert-list',     ':scope > li'],
      ['.xp-list',       ':scope > .xp-row']
    ];
    function assign(section) {
      GROUPS.forEach(([container, child]) => {
        const box = section.querySelector(container);
        if (!box) return;
        let kids;
        try { kids = box.querySelectorAll(child); }
        catch (e) { kids = box.children; }
        Array.prototype.forEach.call(kids, (k, i) => k.style.setProperty('--i', i));
      });
    }
    if (!('MutationObserver' in window)) { sections.forEach(assign); return; }
    sections.forEach(section => {
      if (section.classList.contains('in')) { assign(section); return; }
      const mo = new MutationObserver(() => {
        if (section.classList.contains('in')) { assign(section); mo.disconnect(); }
      });
      mo.observe(section, { attributes: true, attributeFilter: ['class'] });
    });
  })();

})();
