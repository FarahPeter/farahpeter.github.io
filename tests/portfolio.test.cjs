'use strict';

// DOM regressions only: these checks do not replace visual or assistive-technology QA.
// Dependency setup and the run command are in docs/PORTFOLIO_REVIEW_2026-09-13.md.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const postcss = require('postcss');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = fs.readdirSync(root).filter(file => file.endsWith('.html'));

function setup(file = 'index.html', options = {}) {
  const dom = new JSDOM(read(file), { url: `https://portfolio.test/${file}`, runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window, d = w.document, observers = [], frames = [], media = new Map(), canvasDraws = new Map();
  w.matchMedia = query => {
    if (!media.has(query)) media.set(query, {
      matches: query.includes('prefers-reduced-motion') ? !!options.reduceMotion : query.includes('pointer: fine') && !!options.finePointer,
      addEventListener(type, listener) { this.listener = listener; }
    });
    return media.get(query);
  };
  Object.defineProperty(w.HTMLElement.prototype, 'inert', {
    get() { return this.hasAttribute('inert'); },
    set(value) { this.toggleAttribute('inert', !!value); }
  });
  Object.defineProperties(w.navigator, {
    connection: { value: { saveData: !!options.saveData } },
    deviceMemory: { value: options.deviceMemory ?? 8 },
    hardwareConcurrency: { value: options.cores ?? 8 }
  });
  w.HTMLCanvasElement.prototype.getContext = function () {
    const id = this.id;
    return options.noCanvas ? null : new Proxy({}, { get: (_, name) => () => {
      if (name === 'clearRect') canvasDraws.set(id, (canvasDraws.get(id) || 0) + 1);
    } });
  };
  w.HTMLElement.prototype.scrollIntoView = function (options) { this.dataset.scrolled = 'true'; this.scrollOptions = options; };
  w.scrollTo = options => { w.lastScroll = options; };
  w.requestAnimationFrame = callback => { frames.push(callback); return frames.length; };
  w.cancelAnimationFrame = () => {};
  w.IntersectionObserver = class {
    constructor(callback, config) { this.callback = callback; this.config = config; this.targets = []; observers.push(this); }
    observe(target) { this.targets.push(target); }
    unobserve() {}
    disconnect() {}
  };
  const clock = { now: 0 };
  if (options.clock) {
    const timers = new Map();
    let nextId = 0;
    w.performance.now = () => clock.now;
    w.setTimeout = (callback, delay = 0) => {
      const id = ++nextId;
      timers.set(id, { at: clock.now + delay, callback });
      return id;
    };
    w.clearTimeout = id => timers.delete(id);
    clock.advance = ms => {
      const end = clock.now + ms;
      let next;
      while ((next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0])) {
        timers.delete(next[0]);
        clock.now = next[1].at;
        next[1].callback();
      }
      clock.now = end;
    };
  }
  const runFrame = () => frames.splice(0).forEach(callback => callback(clock.now));
  const setVisible = visible => {
    Object.defineProperty(d, 'hidden', { configurable: true, value: !visible });
    Object.defineProperty(d, 'visibilityState', { configurable: true, value: visible ? 'visible' : 'hidden' });
    d.dispatchEvent(new w.Event('visibilitychange'));
  };
  if (options.hidden) setVisible(false);
  if (options.theme) w.localStorage.setItem('pf-theme', options.theme);
  d.querySelectorAll('head script:not([type])').forEach(script => w.eval(script.textContent));
  if (options.load !== false) w.eval(read('script.js'));
  const key = (element, name, extra = {}) => {
    const event = new w.KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...extra });
    element.dispatchEvent(event);
    return event;
  };
  const search = value => {
    const input = d.getElementById('cmd-input');
    input.value = value;
    input.dispatchEvent(new w.Event('input', { bubbles: true }));
    return input;
  };
  return { dom, w, d, key, search, observers, frames, media, clock, runFrame, canvasDraws, setVisible };
}

for (const file of pages) {
  test(`${file}: shared script initializes and navigation has no HUB link`, t => {
    const { dom, d } = setup(file);
    t.after(() => dom.window.close());
    assert.equal(d.querySelectorAll('nav a[href$="fun.html"], #nav-drawer a[href$="fun.html"]').length, 0);
    assert.ok(d.querySelector('.footer-links a[href$="fun.html"]'), 'the existing page remains reachable');
    const ids = [...d.querySelectorAll('[id]')].map(el => el.id);
    assert.equal(new Set(ids).size, ids.length, 'no duplicate IDs');
    for (const list of d.querySelectorAll('.nav-links')) {
      for (const item of list.children) {
        assert.equal(item.tagName, 'LI');
        assert.equal(item.querySelectorAll('a').length, 1, 'one destination per navbar item');
      }
    }
    assert.equal(d.getElementById('nav-drawer').inert, true);
    assert.equal(d.getElementById('theme-toggle').getAttribute('aria-pressed'), 'false');
  });
}

test('homepage puts project evidence early and keeps working without the shared script', t => {
  const { dom, d } = setup('index.html', { load: false });
  t.after(() => dom.window.close());
  assert.deepEqual([...d.querySelectorAll('main > section')].map(el => el.id),
    ['about', 'projects', 'experience', 'skills', 'certificates', 'contact']);
  assert.equal(d.querySelector('.hero .btn-primary').getAttribute('href'), '#projects');
  assert.deepEqual([...d.querySelectorAll('.hero-stat-number')].map(el => el.textContent), ['3+', '7', '100+', '36 TB']);
  assert.equal(d.querySelector('.typing-out').textContent, 'Infrastructure Automation Engineer');
  assert.equal(d.documentElement.classList.contains('reveal-ready'), false);
  assert.equal(d.querySelectorAll('.project.feature').length, 3);
  assert.equal(d.querySelectorAll('.nav-links a[href="#projects"]').length, 1);
  assert.equal(d.querySelectorAll('#nav-drawer a[href="#projects"]').length, 1);
  for (const img of d.querySelectorAll('.project-image')) {
    assert.ok(fs.existsSync(path.join(root, img.getAttribute('src'))));
    assert.equal(img.getAttribute('loading'), 'lazy');
    assert.ok(Number(img.getAttribute('width')) > 0 && Number(img.getAttribute('height')) > 0);
  }
});

test('palette keeps empty results valid and leaves text editing keys alone', t => {
  const { dom, d, key, search } = setup();
  t.after(() => dom.window.close());
  const trigger = d.getElementById('cmd-trigger');
  trigger.focus(); trigger.click();
  const input = search('no-result-xyz');
  for (const name of ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter']) key(input, name);
  assert.equal(input.hasAttribute('aria-activedescendant'), false);
  assert.equal(d.querySelector('#cmd-palette').classList.contains('open'), true);
  assert.equal(d.querySelector('#cmd-palette [role="status"]').textContent, 'No matches found');
  search('projects');
  assert.ok(d.getElementById(input.getAttribute('aria-activedescendant')));
  assert.equal(key(input, 'Home').defaultPrevented, false);
  assert.equal(key(input, 'End').defaultPrevented, false);
  assert.equal(key(input, 'Tab').defaultPrevented, true);
  key(input, 'Escape');
  assert.equal(d.activeElement, trigger);
  assert.equal(d.querySelector('main').inert, false);
});

test('palette section navigation updates the URL and moves focus to the destination', t => {
  const { dom, w, d, key, search } = setup();
  t.after(() => dom.window.close());
  d.getElementById('cmd-trigger').click();
  key(search('Projects'), 'Enter');
  assert.equal(w.location.hash, '#projects');
  assert.equal(d.activeElement.id, 'projects');
  assert.equal(d.getElementById('projects').dataset.scrolled, 'true');
  assert.equal(d.querySelector('#cmd-palette').classList.contains('open'), false);
  assert.equal(d.querySelector('main').inert, false);
});

test('drawer wraps focus, restores previous state, and hands off cleanly to search', t => {
  const { dom, d, key } = setup();
  t.after(() => dom.window.close());
  const footer = d.querySelector('footer');
  footer.inert = true;
  d.body.style.overflow = 'clip';
  const menu = d.getElementById('mobile-menu-btn');
  menu.click();
  const close = d.getElementById('drawer-close'), last = d.getElementById('drawer-theme');
  assert.equal(d.activeElement, close);
  key(close, 'Tab', { shiftKey: true });
  assert.equal(d.activeElement, last);
  key(last, 'Tab');
  assert.equal(d.activeElement, close);
  key(close, 'k', { ctrlKey: true });
  assert.equal(d.getElementById('nav-drawer').classList.contains('open'), false);
  assert.equal(d.getElementById('cmd-palette').classList.contains('open'), true);
  assert.equal(d.activeElement.id, 'cmd-input');
  assert.equal(d.activeElement.closest('[inert]'), null);
  key(d.activeElement, 'Escape');
  assert.equal(d.activeElement, menu);
  assert.equal(footer.inert, true, 'pre-existing inert state survives');
  assert.equal(d.querySelector('main').inert, false);
  assert.equal(d.body.style.overflow, 'clip');
});

test('drawer section links and desktop resizing release the page', t => {
  const { dom, w, d, media } = setup();
  t.after(() => dom.window.close());
  d.getElementById('mobile-menu-btn').click();
  d.querySelector('#nav-drawer a[href="#projects"]').click();
  assert.equal(w.location.hash, '#projects');
  assert.equal(d.activeElement.id, 'projects');
  d.getElementById('mobile-menu-btn').click();
  media.get('(min-width: 901px)').listener({ matches: true });
  assert.equal(d.querySelector('main').inert, false);
  assert.equal(d.body.style.overflow, '');
  assert.equal(d.activeElement, d.querySelector('nav .nav-logo'));
});

test('blog buttons and hash changes keep the expanded state accessible', t => {
  const { dom, w, d } = setup('blog.html');
  t.after(() => dom.window.close());
  const post = d.getElementById('aqm-research');
  const button = post.querySelector('.cover-toggle'), content = post.querySelector('.blog-content-wrapper');
  assert.equal(d.documentElement.classList.contains('blog-ready'), true);
  assert.equal(content.inert, true);
  button.click();
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(content.inert, false);
  button.click();
  w.location.hash = '#aqm-research';
  w.dispatchEvent(new w.HashChangeEvent('hashchange'));
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(content.inert, false);
});

test('reveals use viewport entry and reveal immediately on keyboard focus', t => {
  const { dom, w, d, observers, frames } = setup('index.html', { reduceMotion: false });
  t.after(() => dom.window.close());
  const reveal = observers.find(io => io.targets.some(target => target.id === 'projects'));
  assert.equal(reveal.config.threshold, 0, 'tall sections do not require an unreachable visible ratio');
  d.querySelector('#projects a').focus();
  assert.equal(d.getElementById('projects').classList.contains('in'), true);
  const counters = observers.find(io => io.targets.some(target => target.classList.contains('hero-stats')));
  counters.callback([{ isIntersecting: true }]);
  const pending = frames.splice(0);
  pending.forEach(callback => callback(0));
  for (const value of d.querySelectorAll('.hero-stat-number')) assert.ok(parseFloat(value.textContent) >= 0);
  assert.equal(w.document.documentElement.classList.contains('reveal-ready'), true);
});

test('missing canvas support does not stop theme, navigation, or search', t => {
  const { dom, d } = setup('index.html', { noCanvas: true, theme: 'light' });
  t.after(() => dom.window.close());
  assert.equal(d.getElementById('theme-toggle').getAttribute('aria-pressed'), 'true');
  d.getElementById('cmd-trigger').click();
  assert.equal(d.activeElement.id, 'cmd-input');
});

test('CSS parses and preserves fallback visibility and short-screen scrolling', () => {
  const css = postcss.parse(read('styles.css'));
  const rules = [];
  css.walkRules(rule => rules.push(rule));
  assert.ok(rules.some(rule => rule.selector === '.nav-drawer' && rule.nodes.some(n => n.prop === 'overflow-y' && n.value === 'auto')));
  assert.ok(rules.some(rule => rule.selector === 'html:not(.blog-ready) .blog-content-wrapper' && rule.nodes.some(n => n.prop === 'grid-template-rows' && n.value === '1fr')));
  assert.ok(!rules.some(rule => /html\.js \.reveal/.test(rule.selector)));
});

// The owner requires the full animated experience even when these settings
// would otherwise select a static mode. Exercise observable behavior, not flags.
for (const [label, options] of [
  ['OS reduced motion', { reduceMotion: true }],
  ['save-data', { saveData: true }],
  ['2 GB device', { deviceMemory: 2 }],
  ['2 CPU cores', { cores: 2 }],
  ['all settings combined', { reduceMotion: true, saveData: true, deviceMemory: 1, cores: 1 }]
]) {
  test(`full motion survives ${label} and 60 seconds without input`, t => {
    const { dom, w, d, observers, clock, runFrame, canvasDraws } = setup('index.html', { ...options, finePointer: true, clock: true });
    t.after(() => dom.window.close());

    runFrame(); runFrame();
    assert.equal(canvasDraws.get('net-canvas'), 2, 'network keeps drawing frames');
    w.dispatchEvent(new w.MouseEvent('mousemove', { clientX: 50, clientY: 50 }));
    runFrame();
    assert.ok(canvasDraws.get('mouse-trail') > 0, 'pointer trail remains enabled');

    const reveal = observers.find(io => io.targets.some(target => target.id === 'projects'));
    assert.ok(reveal, 'reveals keep their viewport animation');
    assert.equal(d.getElementById('projects').classList.contains('in'), false);
    reveal.callback([{ target: d.getElementById('projects'), isIntersecting: true }]);
    assert.equal(d.getElementById('projects').classList.contains('in'), true);

    observers.find(io => io.targets.some(target => target.classList.contains('hero-stats')))
      .callback([{ isIntersecting: true }]);
    runFrame();
    assert.equal(d.querySelector('.hero-stat-number').textContent, '0+', 'counter starts an animation');
    clock.advance(110); runFrame();
    const out = d.querySelector('.typing-out');
    const fullRole = d.querySelector('.typing-effect').dataset.text;
    assert.ok(out.textContent.length > 0 && out.textContent.length < fullRole.length, 'role types progressively');

    clock.advance(60000); runFrame();
    assert.equal(out.textContent, fullRole);
    assert.equal(d.querySelector('.hero-stat-number').textContent, '3+');
    const before = canvasDraws.get('net-canvas');
    runFrame(); runFrame();
    assert.equal(canvasDraws.get('net-canvas'), before + 2, 'reading without input never freezes the background');
    assert.equal(d.documentElement.classList.contains('bg-idle'), false);
    assert.equal(d.documentElement.classList.contains('bg-static'), false);
    d.getElementById('back-to-top').click();
    assert.equal(w.lastScroll.behavior, 'smooth');
    d.getElementById('mobile-menu-btn').click();
    d.querySelector('#nav-drawer a[href="#projects"]').click();
    assert.equal(d.getElementById('projects').scrollOptions.behavior, 'smooth');
  });
}

test('network pauses in hidden tabs and resumes, including an initially hidden load', t => {
  const { dom, d, runFrame, canvasDraws, setVisible } = setup('index.html', { hidden: true, clock: true });
  t.after(() => dom.window.close());
  runFrame();
  assert.equal(canvasDraws.get('net-canvas') || 0, 0);
  setVisible(true); runFrame(); runFrame();
  assert.equal(canvasDraws.get('net-canvas'), 2);
  setVisible(false); runFrame(); runFrame();
  assert.equal(canvasDraws.get('net-canvas'), 2);
  assert.equal(d.documentElement.classList.contains('bg-hidden'), true);
  setVisible(true); runFrame(); runFrame();
  assert.equal(canvasDraws.get('net-canvas'), 4);
  assert.equal(d.documentElement.classList.contains('bg-hidden'), false);
});

for (const reduceMotion of [false, true]) {
  test(`Journey boots and updates animated scenes with OS reduced motion ${reduceMotion}`, t => {
    const { dom, w, d, observers, runFrame } = setup('journey.html', { reduceMotion, clock: true });
    t.after(() => dom.window.close());
    assert.equal(d.documentElement.classList.contains('jn-on'), true, 'pinned layout starts in the head script');
    d.querySelectorAll('body script:not([src]):not([type])').forEach(script => w.eval(script.textContent));
    assert.equal(d.documentElement.classList.contains('jn-boot'), true, 'full engine initializes');
    assert.ok(d.querySelectorAll('#jn-hero-name .jn-l').length > 0);
    const scene = d.getElementById('jn-s1');
    const sceneObserver = observers.find(io => io.config.rootMargin === '50% 0px 50% 0px');
    assert.equal(sceneObserver.targets.length, 9, 'all nine scenes register');
    sceneObserver.callback([{ target: scene, isIntersecting: true }]);
    runFrame();
    assert.equal(scene.classList.contains('jn-live'), true);
    assert.match(d.getElementById('jn-hero-name').style.transform, /^scale\(/, 'engine renders the active scene');
    assert.equal(d.querySelectorAll('.jn-rail-ring').length, 9);
    assert.equal(d.querySelectorAll('.jn-frame').length, 13, 'all photo-reel frames are retained');
  });
}
