/* ==========================================================================
   Peter Farah — Portfolio interactions
   Liquid-glass build · vanilla JS, no dependencies
   ========================================================================== */
(function () {
  'use strict';

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const root = document.documentElement;
  root.classList.add('js');   // the <head> boot script does this too; belt and braces
  const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  /* Owner requirement: full motion on every visible page. Do not add OS,
     device, data-saving or inactivity gates. See AGENTS.md. Only hidden tabs
     pause decorative loops; 'pf:motion' wakes them when the tab is visible. */
  const motion = {
    hidden: !!document.hidden,
    get running() { return !this.hidden; }
  };

  /* Restore exactly the background state a dialog inherited. */
  function lockBackground(panel, backdrop) {
    const previousOverflow = document.body.style.overflow;
    const changed = $$('body > *').filter(el => el !== panel && el !== backdrop
      && el.tagName !== 'SCRIPT' && !el.inert);
    changed.forEach(el => { el.inert = true; });
    document.body.style.overflow = 'hidden';
    return () => {
      changed.forEach(el => { el.inert = false; });
      document.body.style.overflow = previousOverflow;
    };
  }

  function navigateSection(hash) {
    let target;
    try { target = document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch (e) { return; }
    if (!target) return;
    const reveal = target.closest('.reveal');
    if (reveal) reveal.classList.add('in');
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
    if (location.hash !== hash) location.hash = hash;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ============================== THEME ============================== */
  (function theme() {
    let saved = null;
    try { saved = localStorage.getItem('pf-theme'); } catch (e) {}
    root.setAttribute('data-theme', saved === 'light' ? 'light' : 'dark');
    const meta = document.querySelector('meta[name="theme-color"]');
    /* Toggle buttons announce their state; the browser chrome follows the canvas colour. */
    function sync() {
      const light = root.getAttribute('data-theme') === 'light';
      ['theme-toggle', 'drawer-theme'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.setAttribute('aria-pressed', String(light));
        el.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
      });
      if (meta) {
        const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
        if (bg) meta.setAttribute('content', bg);
      }
      document.dispatchEvent(new CustomEvent('pf:theme'));
    }
    function toggle() {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('pf-theme', next); } catch (e) {}
      sync();
    }
    ['theme-toggle', 'drawer-theme'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', toggle);
    });
    sync();
  })();

  /* ============================== TAB VISIBILITY ============================== */
  (function motionVisibility() {
    function emit() {
      root.classList.toggle('bg-hidden', motion.hidden);
      document.dispatchEvent(new CustomEvent('pf:motion'));
    }
    document.addEventListener('visibilitychange', () => {
      motion.hidden = document.hidden;
      emit();
    });
    emit();
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
    if (cv) {
      const ctx = cv.getContext('2d');
      if (!ctx) return;
      function size() { cv.width = innerWidth; cv.height = innerHeight; }
      size(); window.addEventListener('resize', size);
      const pts = [];
      let running = false;
      /* The loop only runs while a point is still fading — it stops itself
         (and leaves a cleared canvas) instead of clearing 60 times a second forever. */
      function draw() {
        ctx.clearRect(0, 0, cv.width, cv.height);
        let alive = false;
        for (let k = 0; k < pts.length; k++) {
          const p = pts[k]; p.life -= 0.08;
          if (p.life <= 0) continue;
          alive = true;
          ctx.beginPath();
          ctx.arc(p.x, p.y, (k / pts.length) * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(77, 141, 255, ${p.life * 0.12})`;
          ctx.fill();
        }
        if (alive) requestAnimationFrame(draw);
        else { pts.length = 0; running = false; }
      }
      window.addEventListener('mousemove', e => {
        pts.push({ x: e.clientX, y: e.clientY, life: 1 });
        if (pts.length > 10) pts.shift();
        if (!running) { running = true; requestAnimationFrame(draw); }
      });
    }
  })();

  /* ============================== NETWORK BACKGROUND ============================== */
  (function network() {
    const cv = $('#net-canvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
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
    document.addEventListener('pf:theme', () => { COL = rgb(); });

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
    init();
    window.addEventListener('resize', init);

    function spawnPacket() {
      if (nodes.length < 2) return;
      const a = nodes[(Math.random() * nodes.length) | 0], b = nodes[(Math.random() * nodes.length) | 0];
      if (a === b) return;
      packets.push({ a, b, t: 0, speed: 0.005 + Math.random() * 0.009 });
    }

    let raf = null;
    function frame() {
      raf = null;
      if (!motion.running) return;
      ctx.clearRect(0, 0, w, h);
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
      if (motion.running) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && motion.running) raf = requestAnimationFrame(frame); }
    document.addEventListener('pf:motion', kick);
    kick();
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
        const focusInside = nav.contains(document.activeElement);
        if (st > 340 && st > lastY + 4 && !focusInside) nav.classList.add('nav-hidden');
        else if (st < lastY - 4 || st < 340) nav.classList.remove('nav-hidden');
      }
      lastY = st;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    if (nav) nav.addEventListener('focusin', () => nav.classList.remove('nav-hidden'));
    onScroll();
  })();

  /* ============================== MOBILE DRAWER ============================== */
  (function drawer() {
    const btn = $('#mobile-menu-btn'), dr = $('#nav-drawer'), ov = $('#nav-overlay'), close = $('#drawer-close');
    if (!btn || !dr) return;
    btn.setAttribute('aria-controls', 'nav-drawer');
    let unlock = null;
    dr.inert = true;
    function open() {
      document.dispatchEvent(new CustomEvent('pf:close-overlays'));
      dr.inert = false;
      dr.classList.add('open'); ov && ov.classList.add('open'); btn.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      unlock = lockBackground(dr, ov);
      (close || $('a, button', dr)).focus();
    }
    function shut(restoreFocus = true) {
      if (!dr.classList.contains('open')) return;
      dr.classList.remove('open'); ov && ov.classList.remove('open'); btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      dr.inert = true;
      if (unlock) { unlock(); unlock = null; }
      if (restoreFocus) btn.focus({ preventScroll: true });
    }
    btn.addEventListener('click', () => dr.classList.contains('open') ? shut() : open());
    close && close.addEventListener('click', shut);
    ov && ov.addEventListener('click', shut);
    $$('#nav-drawer a').forEach(a => a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      shut(false);
      if (href && href.startsWith('#')) { e.preventDefault(); navigateSection(href); }
    }));
    window.addEventListener('keydown', e => {
      if (!dr.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); shut(); }
      else if (e.key === 'Tab') {
        const controls = $$('a[href], button:not([disabled])', dr);
        const first = controls[0], last = controls[controls.length - 1];
        if (e.shiftKey && (document.activeElement === first || !dr.contains(document.activeElement))) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !dr.contains(document.activeElement))) {
          e.preventDefault(); first.focus();
        }
      }
    });
    document.addEventListener('pf:close-overlays', () => shut());
    window.matchMedia('(min-width: 901px)').addEventListener('change', e => {
      if (e.matches && dr.classList.contains('open')) {
        shut(false);
        const logo = $('.nav-logo');
        if (logo) logo.focus({ preventScroll: true });
      }
    });
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
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    items.forEach(i => io.observe(i));
    root.classList.add('reveal-ready');
    document.addEventListener('focusin', e => {
      const section = e.target.closest('.reveal');
      if (section) { section.classList.add('in'); io.unobserve(section); }
    });
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
          const p = Math.max(0, Math.min((now - t0) / dur, 1));
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
    const out = $('.typing-out', el) || el;      // .typing-out sits over an invisible full-width sizer
    const text = el.dataset.text || el.textContent.trim();
    out.textContent = '';
    let i = 0;
    (function type() { if (i <= text.length) { out.textContent = text.slice(0, i++); setTimeout(type, 55); } })();
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
        if (e.isIntersecting) {
          links.forEach(l => { l.classList.remove('active'); l.removeAttribute('aria-current'); });
          a.classList.add('active'); a.setAttribute('aria-current', 'location');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(id => { const s = document.getElementById(id); if (s) io.observe(s); });
  })();

  /* ============================== COPY EMAIL ============================== */
  (function copyEmail() {
    const btn = $('#copy-email-btn'), toast = $('#copy-toast');
    if (!btn) return;
    const msg = toast ? toast.textContent : '';
    if (toast) toast.textContent = '';               // empty at rest: a live region only announces changes
    let hide = null;
    btn.addEventListener('click', async () => {
      const email = 'peter@peterfarah.com';
      try { await navigator.clipboard.writeText(email); }
      catch (e) { const t = document.createElement('textarea'); t.value = email; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
      if (toast) {
        toast.textContent = msg; toast.classList.add('show');
        clearTimeout(hide);
        hide = setTimeout(() => { toast.classList.remove('show'); toast.textContent = ''; }, 2000);
      }
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
    const posts = $$('.blog-post');
    if (!posts.length) return;
    function setOpen(post, open) {
      const wrap = $('.blog-content-wrapper', post), cover = $('.blog-cover', post), btn = $('.cover-toggle', post);
      if (!wrap) return;
      wrap.classList.toggle('open', open);
      if ('inert' in wrap) wrap.inert = !open;     // collapsed links leave the tab order
      if (cover) cover.classList.toggle('expanded', open);
      if (btn) {
        btn.setAttribute('aria-expanded', String(open));
        btn.textContent = open ? 'Collapse write-up' : 'Expand & read';
      }
    }
    posts.forEach(post => {
      const wrap = $('.blog-content-wrapper', post), cover = $('.blog-cover', post), btn = $('.cover-toggle', post);
      if (!wrap) return;
      setOpen(post, wrap.classList.contains('open'));
      const flip = () => setOpen(post, !wrap.classList.contains('open'));
      /* The button is the keyboard/AT control; the whole cover stays clickable for mouse users. */
      if (btn) btn.addEventListener('click', e => { e.stopPropagation(); flip(); });
      if (cover) cover.addEventListener('click', flip);
    });
    root.classList.add('blog-ready');
    /* Deep links (blog.html#home-nas) open the post — on load and when the
       hash changes from the page's own nav. */
    function openFromHash() {
      if (!location.hash || location.hash.length < 2) return;
      let target = null;
      try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) { return; }
      if (!target || !target.classList.contains('blog-post')) return;
      setOpen(target, true);
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
    }
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
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
      { label: 'Projects', sub: 'section', icon: ico.hash, href: onIndex ? '#projects' : 'index.html#projects' },
      { label: 'Career Timeline', sub: 'section', icon: ico.hash, href: onIndex ? '#experience' : 'index.html#experience' },
      { label: 'Skills', sub: 'section', icon: ico.hash, href: onIndex ? '#skills' : 'index.html#skills' },
      { label: 'Certificates & Honors', sub: 'section', icon: ico.hash, href: onIndex ? '#certificates' : 'index.html#certificates' },
      { label: 'Contact', sub: 'section', icon: ico.mail, href: onIndex ? '#contact' : 'index.html#contact' },
      { label: 'Home / Profile', sub: 'page', icon: ico.doc, href: 'index.html' },
      { label: 'Journey — My Story', sub: 'page', icon: ico.doc, href: 'journey.html' },
      { label: 'Research & Blog', sub: 'page', icon: ico.doc, href: 'blog.html' },
      { label: 'AQM Research Write-up', sub: 'blog', icon: ico.hash, href: 'blog.html#aqm-research' },
      { label: 'Home Server Architecture', sub: 'blog', icon: ico.hash, href: 'blog.html#home-server' },
      { label: 'Home NAS Architecture', sub: 'blog', icon: ico.hash, href: 'blog.html#home-nas' },
      { label: 'AQM Network Visualizer', sub: 'lab', icon: ico.ext, href: 'FUN/AQMgame.html' },
      { label: 'Interactive Hub', sub: 'page', icon: ico.doc, href: 'fun.html' },
      { label: 'Service Access Panel', sub: 'page', icon: ico.doc, href: 'server.html' },
      { label: 'Download CV', sub: 'pdf', icon: ico.ext, href: 'Files/CV/CV_V16/CV-Peter_Farah.pdf', blank: true },
      { label: 'Email Peter', sub: 'contact', icon: ico.mail, href: 'mailto:peter@peterfarah.com' },
      { label: 'LinkedIn', sub: 'external', icon: ico.ext, href: 'https://www.linkedin.com/in/peter-farah-i', blank: true },
      { label: 'GitHub', sub: 'external', icon: ico.ext, href: 'https://github.com/FarahPeter', blank: true },
      { label: 'Privacy', sub: 'page', icon: ico.doc, href: 'privacy.html' }
    ];
    let filtered = items.slice(), active = 0, lastFocus = null, unlock = null;
    const status = document.createElement('p');
    status.className = 'visually-hidden';
    status.setAttribute('role', 'status');
    pal.appendChild(status);

    /* ARIA combobox → listbox wiring (the markup carries the same attributes;
       setting them here keeps every page consistent). */
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', 'cmd-results');
    input.setAttribute('aria-expanded', 'false');
    if (!input.hasAttribute('aria-label')) input.setAttribute('aria-label', 'Search pages and sections');
    results.setAttribute('role', 'listbox');
    if (trigger) { trigger.setAttribute('aria-haspopup', 'dialog'); trigger.setAttribute('aria-expanded', 'false'); }

    function render() {
      results.innerHTML = '';
      status.textContent = filtered.length ? filtered.length + ' results' : 'No matches found';
      if (!filtered.length) {
        results.innerHTML = '<div class="cmd-empty" role="option" aria-disabled="true" aria-selected="false">No matches found</div>';
        input.removeAttribute('aria-activedescendant');
        return;
      }
      filtered.forEach((it, idx) => {
        const row = document.createElement('div');
        row.className = 'cmd-item' + (idx === active ? ' active' : '');
        row.id = 'cmd-opt-' + idx;
        row.setAttribute('role', 'option');
        row.setAttribute('aria-selected', idx === active ? 'true' : 'false');
        row.innerHTML = `<span class="cmd-ico">${it.icon}</span><span class="cmd-label">${it.label}</span><span class="cmd-sub">${it.sub}</span>`;
        row.addEventListener('click', () => go(it));
        row.addEventListener('mousemove', () => { if (active !== idx) { active = idx; paint(); } });
        results.appendChild(row);
      });
      input.setAttribute('aria-activedescendant', 'cmd-opt-' + active);
    }
    function paint() {
      if (!filtered.length) { input.removeAttribute('aria-activedescendant'); return; }
      $$('.cmd-item', results).forEach((r, i) => {
        const on = i === active;
        r.classList.toggle('active', on);
        r.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      input.setAttribute('aria-activedescendant', 'cmd-opt-' + active);
    }
    function filter(q) {
      q = q.trim().toLowerCase();
      filtered = !q ? items.slice() : items.filter(it => (it.label + ' ' + it.sub).toLowerCase().includes(q));
      active = 0; render();
    }
    function go(it) {
      if (!it) return;
      close(it.href.charAt(0) !== '#');
      if (it.href.charAt(0) === '#') { navigateSection(it.href); }
      else if (it.blank) { window.open(it.href, '_blank', 'noopener'); }
      else { window.location.href = it.href; }
    }
    function isOpen() { return pal.classList.contains('open'); }
    function open() {
      if (isOpen()) return;
      document.dispatchEvent(new CustomEvent('pf:close-overlays'));
      lastFocus = document.activeElement;
      back.classList.add('open'); pal.classList.add('open');
      input.setAttribute('aria-expanded', 'true');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
      input.value = ''; filter('');
      unlock = lockBackground(pal, back);
      input.focus();      // synchronous: the panel's visibility now flips instantly on open
    }
    function close(restoreFocus = true) {
      if (!isOpen()) return;
      back.classList.remove('open'); pal.classList.remove('open');
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (unlock) { unlock(); unlock = null; }
      if (restoreFocus && lastFocus && typeof lastFocus.focus === 'function' && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
      lastFocus = null;
    }

    trigger && trigger.addEventListener('click', open);
    back.addEventListener('click', close);
    input.addEventListener('input', () => filter(input.value));
    input.addEventListener('keydown', e => {
      if (!filtered.length && ['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) { e.preventDefault(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, filtered.length - 1); paint(); scrollActive(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); paint(); scrollActive(); }
      else if (e.key === 'Enter') { e.preventDefault(); go(filtered[active]); }
      else if (e.key === 'Tab') { e.preventDefault(); }   // the input is the dialog's only control: keep focus inside
    });
    function scrollActive() { const el = $$('.cmd-item', results)[active]; if (el) el.scrollIntoView({ block: 'nearest' }); }
    window.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); isOpen() ? close() : open(); }
      else if (e.key === 'Escape' && isOpen()) { close(); }
    });
    document.addEventListener('pf:close-overlays', () => close());
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

  /* ============================== TELEMETRY ============================== */
  /* Heartbeat + click capture for the self-hosted collector at
     hook.peterfarah.com (serverV3.py). Payload keys mirror that app's
     /heartbeat and /track-click handlers exactly. Everything here is
     fire-and-forget and swallows its own errors, so a dead or slow collector
     can never surface to a visitor. */
  (function telemetry() {
    const ENDPOINT = 'https://hook.peterfarah.com';
    const INTERVAL = 10000;   // serverV3 credits 10 active seconds per beat

    // Live site only — keeps localhost and preview hosts out of the database.
    if (!/(^|\.)peterfarah\.com$/i.test(location.hostname)) return;
    // Visitors who ask not to be tracked (Global Privacy Control / Do Not Track) are not.
    if (navigator.globalPrivacyControl || navigator.doNotTrack === '1' || window.doNotTrack === '1') return;

    let maxScroll = 0;
    let loadTime  = null;
    let failures  = 0;    // consecutive; the collector is self-hosted and may be down
    let beat      = null;

    window.addEventListener('scroll', () => {
      const doc = document.documentElement;
      const height = doc.scrollHeight - doc.clientHeight;
      if (height <= 0) return;
      const pct = Math.round(((doc.scrollTop || document.body.scrollTop) / height) * 100);
      if (pct > maxScroll) maxScroll = Math.min(pct, 100);
    }, { passive: true });

    /* Deferred a tick: loadEventEnd is still 0 while the load handler itself runs. */
    window.addEventListener('load', () => setTimeout(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav && nav.loadEventEnd) loadTime = Math.round(nav.loadEventEnd - nav.startTime);
    }, 0));

    /* Give up after MAX_FAILURES consecutive misses. The browser logs its own
       CORS/network error for each attempt no matter what we catch, so an
       unreachable collector would otherwise fill a visitor's console forever. */
    const MAX_FAILURES = 3;

    function post(path, body) {
      if (failures >= MAX_FAILURES) return;
      try {
        fetch(ENDPOINT + path, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          keepalive: true          // still fires if the tab closes or navigates
        })
          .then(r => { failures = r.ok ? 0 : failures + 1; })
          .catch(() => { failures += 1; })
          .then(() => {
            if (failures >= MAX_FAILURES && beat) { clearInterval(beat); beat = null; }
          });
      } catch (e) {}
    }

    function heartbeat() {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const params = new URLSearchParams(location.search);
      let theme = 'dark', tz = 'Unknown';
      try { theme = localStorage.getItem('pf-theme') || 'dark'; } catch (e) {}
      try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown'; } catch (e) {}

      post('/heartbeat', {
        page: location.pathname,
        referrer: document.referrer || 'Direct',
        user_agent: navigator.userAgent,
        screen: screen.width ? screen.width + 'x' + screen.height : 'Unknown',
        language: navigator.language || 'Unknown',
        timezone: tz,
        theme: theme,
        max_scroll: maxScroll,
        load_time: loadTime,
        network_type: conn ? conn.effectiveType : 'unknown',
        downlink: conn ? conn.downlink : null,
        device_memory: navigator.deviceMemory || null,
        cores: navigator.hardwareConcurrency || null,
        visibility_state: document.visibilityState,
        utm_source: params.get('utm_source') || params.get('source') || null,
        is_bot: navigator.webdriver ? 1 : 0
      });
    }

    /* Delegated + capture phase, so links built after load (blog expanders,
       command palette, mobile drawer) are covered without re-binding. */
    document.addEventListener('click', e => {
      const el = e.target && e.target.closest && e.target.closest('a, button');
      if (!el) return;
      post('/track-click', {
        page: location.pathname,
        text: (el.innerText || '').trim().slice(0, 40) || el.getAttribute('aria-label') || 'icon/image',
        url: el.getAttribute('href') || 'button-click'
      });
    }, true);

    function start() { if (!beat && failures < MAX_FAILURES) beat = setInterval(heartbeat, INTERVAL); }
    function stop()  { if (beat) { clearInterval(beat); beat = null; } }
    heartbeat();
    start();
    /* A hidden tab sends one closing beat and then stays quiet until it is
       visible again — no traffic for a tab nobody is looking at. */
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') { heartbeat(); stop(); }
      else { heartbeat(); start(); }
    });
    window.addEventListener('pagehide', heartbeat);
  })();


  /* ============================== SERVICE STATUS PROBE ============================== */
  /* server.html only. Measures each listed service from the visitor's own browser:
     did it answer, and how fast. Deliberately not a health check — see probe(). */
  (function svcStatus() {
    const panel = $('.server-panel');
    if (!panel) return;                                   // every other page: no-op

    const box  = $('#svc-probe');
    const text = $('#svc-probe-text');
    const dot  = $('#svc-probe-dot');
    const foot = $('#svc-probe-foot');
    const btn  = $('#svc-recheck');
    const links = $$('a.btn.svc', panel);                 // commented-out services aren't in the DOM
    if (!box || !text || !dot || !links.length) return;
    if (!window.fetch || !window.AbortController) return; // old browser: leave the panel exactly as authored

    const TIMEOUT = 8000;

    /* Markup ships hidden so a no-JS visitor sees the original panel. */
    box.hidden = false;
    if (foot) foot.hidden = false;

    /* One badge per service row, built once. */
    const rows = links.map(a => {
      const stat = document.createElement('span');
      stat.className = 'svc-stat';
      stat.dataset.state = 'idle';
      stat.innerHTML = '<span class="svc-dot"></span><span class="svc-ms"></span>';
      a.appendChild(stat);
      let sameOrigin = false;
      try { sameOrigin = new URL(a.href, location.href).origin === location.origin; } catch (e) { /* opaque href */ }
      return { a, stat, out: $('.svc-ms', stat), sameOrigin };
    });

    /* title only: an aria-label on the badge would replace the link's own name
       ("Treasury Vault … 123 ms") with the explanation. */
    function paint(r, state, label, title) {
      r.stat.dataset.state = state;
      r.out.textContent = label;
      r.stat.setAttribute('title', title);
    }

    /* Same-origin gets a real, readable HTTP status. Cross-origin runs in `no-cors`,
       which yields an opaque response: it proves something answered and how long it
       took, and nothing else — a 502 from the tunnel looks like a 200 from the app.
       Credentials are omitted, so a visitor's Cloudflare Access session is never
       attached to these requests.

       HEAD over GET is deliberate. One of the services answers HEAD with a 405,
       which the browser logs as a console error, and GET avoids that — but GET
       also pulls a full response body per service on every visit to this page.
       Six wasted document downloads costs the visitor more than one console line
       costs us, and a 405 is still a live host, so HEAD wins. */
    function probe(r) {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), TIMEOUT);
      const t0 = performance.now();
      return fetch(r.a.href, {
        method: 'HEAD',
        mode: r.sameOrigin ? 'same-origin' : 'no-cors',
        cache: 'no-store',
        credentials: 'omit',
        signal: ctl.signal
      })
        .then(res => {
          const ms = Math.round(performance.now() - t0);
          if (!r.sameOrigin) {
            return { up: true, ms, state: 'reach', label: ms + ' ms',
                     title: 'Answered in ' + ms + ' ms. Cross-origin, so the HTTP status is opaque to this page.' };
          }
          /* Any status below 500 still means the server answered for itself, so it is
             up: a 404, or a 405 from a host that refuses HEAD, is a live service and
             not a dead one. Only 5xx says the thing behind the door is broken. */
          const alive = res.status < 500;
          return { up: alive, ms, state: alive ? 'ok' : 'fail',
                   label: res.status + ' \u00b7 ' + ms + ' ms',
                   title: 'HTTP ' + res.status + ' in ' + ms + ' ms. Same-origin, so this is the real status.' };
        })
        .catch(() => ({ up: false, ms: 0, state: 'fail', label: 'no answer',
                        title: 'No response within ' + (TIMEOUT / 1000) + ' s, or the connection failed.' }))
        .then(res => { clearTimeout(timer); return res; });
    }

    function median(xs) {
      if (!xs.length) return 0;
      const s = xs.slice().sort((a, b) => a - b), h = s.length >> 1;
      return s.length % 2 ? s[h] : Math.round((s[h - 1] + s[h]) / 2);
    }

    let running = false;
    function run() {
      if (running) return;
      running = true;
      if (btn) { btn.disabled = true; btn.textContent = 'Checking\u2026'; }
      dot.dataset.state = 'busy';
      text.textContent = 'Probing ' + rows.length + ' service' + (rows.length === 1 ? '' : 's') + '\u2026';
      rows.forEach(r => paint(r, 'busy', '\u2026', 'Probing\u2026'));

      Promise.all(rows.map(r => probe(r).then(res => { paint(r, res.state, res.label, res.title); return res; })))
        .then(results => {
          const up  = results.filter(x => x.up).length;
          const mid = median(results.filter(x => x.up && x.ms).map(x => x.ms));
          let msg = up + '/' + rows.length + ' responding';
          if (mid) msg += ' \u00b7 median ' + mid + ' ms';
          if (!up) {
            dot.dataset.state = 'down';
            msg += navigator.onLine === false
              ? ' \u00b7 your browser reports no network connection'
              : ' \u00b7 nothing answered from here';
          } else {
            dot.dataset.state = up === rows.length ? 'live' : 'partial';
            /* Minutes are precision enough for a status line, and dropping the
               seconds keeps the summary on one row on a phone. */
            msg += ' \u00b7 checked ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
          text.textContent = msg;
        })
        .then(() => {
          running = false;
          if (btn) { btn.disabled = false; btn.textContent = 'Re-check'; }
        });
    }

    /* Run once after the page has loaded (at idle, so six new TLS handshakes never
       compete with the fonts and images), then only on demand — no polling loop
       against Peter's own boxes. */
    if (btn) btn.addEventListener('click', run);
    function first() { ('requestIdleCallback' in window) ? requestIdleCallback(run, { timeout: 2000 }) : setTimeout(run, 0); }
    if (document.readyState === 'complete') first();
    else window.addEventListener('load', first, { once: true });
  })();


})();
