# Improvement Plan — peterfarah.com (September 2026)

> Scope: the live site — `index.html`, `journey.html`, `blog.html`, `fun.html`,
> `server.html`, `404.html`, `styles.css`, `script.js`, the SEO files and the
> assets under `Files/`. **`FUN/` is out of scope by the owner's request** and is
> not touched; links *to* it are.
>
> Method: the six pages were rendered headlessly (Chromium, 1366×900 and 390×844,
> dark and light, with the real web fonts) and audited through ten lenses —
> accessibility, SEO/sharing, performance, JavaScript correctness, cross-page
> consistency, content accuracy, CSS/theming, privacy, responsive layout and
> visual polish. Every item below was confirmed against the source or reproduced
> in the browser before it made the list; a handful of candidate findings were
> dropped because they did not hold up (for example the navbar does fit in the
> 901–1220 px band with ~200 px to spare).

---

## 1. What was found

Severity: **H** = broken, blocking or misleading · **M** = noticeably degrades
UX, SEO, accessibility or performance · **L** = polish.

### 1.1 Broken or missing (H)

| # | Finding | Where |
|---|---------|-------|
| 1 | `Files/images/favicon.ico` is linked from every page but does not exist → a 404 on every page load; no PNG icon, no apple-touch-icon, no web manifest. | all pages `<head>` |
| 2 | Command palette (⌘K) is keyboard-dead in Chromium: focus never leaves the trigger because `#cmd-palette` transitions `visibility` over .2 s and `input.focus()` fires at 30 ms, so typing does nothing and Escape does not close it. | `script.js` palette, `styles.css` `#cmd-palette` |
| 3 | Blog write-ups cannot be expanded with a keyboard or a screen reader: the expander is a `<span class="btn">` inside a clickable `<div>` with no role, no `tabindex`, no `aria-expanded`; the collapsed body's links still receive focus at 0 px height. | `blog.html`, `script.js` blog |
| 4 | The closed mobile drawer is in the tab order on every page (hidden only by `translateX`), so keyboard users tab through 8–12 off-screen links before reaching content; opening it moves no focus. | `styles.css` `.nav-drawer`, `script.js` drawer |
| 5 | With JavaScript unavailable, everything below the hero is invisible: `.reveal { opacity: 0 }` is only undone by the IntersectionObserver. | `styles.css` reveal |
| 6 | Light-theme users get a dark flash on every navigation: `data-theme` is applied by `script.js` at the end of `<body>`. | all pages |
| 7 | `fun.html` (Interactive Hub) is an orphan: no crawlable link from any page; navbars differ on every page (4 different link sets, 2 different home hrefs, palette only on 2 of 6 pages). | all navs |
| 8 | Largest-contentful-paint images are oversized: hero portrait 614 KB (1920×2560) into a ~340 px slot; blog covers 1.9 MB PNG + 1.9 MB 24-MP JPEG into an 854×373 slot, first cover `loading="lazy"`; no `srcset`, no `width`/`height` (CLS). | `index.html`, `blog.html` |
| 9 | No `rel="canonical"` on any page; `fun.html`/`server.html` have no Open Graph tags; no page has `twitter:card`; the share image is a 3:4 portrait reused on three pages. | all pages `<head>` |

### 1.2 Degrades the experience (M)

| # | Finding | Where |
|---|---------|-------|
| 10 | `prefers-reduced-motion` is ignored (hard-coded `false` in both scripts) and infinite animations (aurora, canvas, name shimmer, pulses) have no pause. | `script.js`, `journey.html`, `styles.css` |
| 11 | Animations never idle: aurora blur layers + two rAF canvas loops keep every `backdrop-filter` surface re-rendering (measured 12–14 fps in software compositing on index/fun vs 52–60 fps with the background paused); the mouse-trail loop clears the canvas forever. | `script.js`, `styles.css` |
| 12 | Light theme contrast: `--accent-2` 2.4:1 on the background (gradient headings, stats, primary-button end, badges); `--faint` 2.5:1 light / 3.8:1 dark yet used for real text (probe footnote, palette placeholder, "bash" label). | `styles.css` tokens |
| 13 | Palette has no ARIA pattern (unnamed input, no listbox/option roles, no focus return, no Tab trap); theme toggles expose no state; hub filter pills have no `aria-pressed` and no result announcement. | `index.html`, `journey.html`, `fun.html`, `script.js` |
| 14 | No skip link and no `<main>` on five pages; the auto-hiding navbar keeps its links focusable while translated off-screen; journey off-stage links are focusable while invisible. | all pages, `script.js`, `journey.html` |
| 15 | Collapsed blog posts still download all 11 in-post images (5.4 MB) on load — `loading="lazy"` is defeated by the `0fr` grid collapse. Navigating to a post anchor from the blog's own nav only scrolls; it never expands the post (no `hashchange` handling). | `styles.css`, `script.js` |
| 16 | Telemetry: 10 s heartbeats keep running in hidden tabs; visitors are given no notice of what is collected and no opt-out signal is honoured. | `script.js` telemetry |
| 17 | `sitemap.xml` lastmod values are 1–2 months behind the git history; `robots.txt` lacks a trailing newline; JSON-LD is a lone `Person` whose `url` disagrees with `og:url`; the blog has no `BlogPosting` data. | SEO files, `index.html`, `blog.html` |
| 18 | `llms.txt` tells AI agents to attribute skills that appear nowhere on the site (Palo Alto, BGP, OSPF, SDN, SIEM, Threat Modeling, Bash, Cloud Security) — contradicts the "bio is factual" rule. | `llms.txt` |
| 19 | Google Fonts load through a CSS `@import` (render-blocking chain that defeats the `preconnect`s) and add a third-party request on every visit. | `styles.css` |
| 20 | Journey: 3×-density phones pick the 1600w photo for every reel frame (3.1 MB instead of 1.1 MB); all 13 full-bleed images are promoted with unconditional `will-change`; the hero name's registered-property animation costs 30–60 ms/s of style recalculation for the whole visit; the pinned layout is applied only after the end-of-body engine runs (occasional CLS 0.24). | `journey.html` |
| 21 | Service probes fire during script parse, before `load`, opening six TLS connections concurrently with the render-blocking font fetch. | `script.js` svcStatus |
| 22 | Heading structure: `server.html` has no `<h1>`; `fun.html` jumps from `<h1>` to `<h3>`; `aria-current` exists only on `journey.html`. | `server.html`, `fun.html`, navs |
| 23 | `fun.html` overflows horizontally at 320 px (`minmax(320px, 1fr)` grid). | `fun.html` |

### 1.3 Polish (L)

| # | Finding | Where |
|---|---------|-------|
| 24 | Dead CSS shipped on every page: the removed skill-meter block, 7 unused legacy alias variables, `.s4`, `.glass`, `#cursor-ring` (+ its empty `<div>` on every page); `skills-revealed` branch in `script.js`. | `styles.css`, `script.js`, all pages |
| 25 | Alt text: the AQM cover and the architecture diagram share an alt; `FullArchitecture.JPG` is loaded twice with two alts; "Grafana dashboard 2"; the blog results legend is colour-only and its literal colours fail contrast in light mode; 404's `#ef4444` is 3.6:1 on light. | `blog.html`, `404.html` |
| 26 | Live regions: the copy-email toast text never changes, so nothing is announced. Journey's split hero name reads as "PETERFARAH"; timeline `h3`s read as "EngineerMurex". | `script.js`, `journey.html`, `index.html` |
| 27 | Undersized targets: drawer close button (18×24), journey rail dots (12 px tall); rail labels never appear on keyboard focus. Lists with `list-style: none` lose list semantics in VoiceOver. In-text links are colour-only. | `styles.css`, `journey.html` |
| 28 | Repeated link text ("Open Tool" ×5, "View on GitHub →" ×3, "Read the write-up →" ×2). | `fun.html`, `index.html`, `journey.html` |
| 29 | `.photo-geo` caption on the hero portrait is unreadable on the light theme. The role line's typing effect wraps late on phones (small CLS). "36TB" lacks a space. | `styles.css`, `index.html` |
| 30 | Copy: "Telecom Sud-Paris" (official: Télécom SudParis), "Clash Royal" (Royale), mixed British/American spelling in the NAS post and hub cards, `index.html` `<title>` over 70 characters, `id="rainbow-btn"` with no styling, the "Journey" kicker on the index timeline while a Journey page exists. | various |
| 31 | `404.html` is indexable when requested directly; its menu button lacks `aria-expanded`. `meta theme-color` never follows the light theme. | `404.html`, `script.js` |
| 32 | No print stylesheet: printing the profile yields a dark page with fixed nav, canvases and collapsed content. | `styles.css` |
| 33 | `docs/ARCHITECTURE.md` line counts and the module list have drifted (index ~540→605, styles ~570→906, script ~475→705). | `docs/` |

---

## 2. The plan

Work is grouped so that shared files change once and every page then gets the
same chrome. Everything stays plain HTML/CSS/vanilla JS with no build step.

### Phase A — Assets (new files under `Files/`)
- **Icons:** rasterise the existing inline SVG mark to `favicon.ico` (16/32/48),
  `apple-touch-icon.png` (180, opaque), `icon-192.png`, `icon-512.png`; add
  `site.webmanifest` at the root. *(fixes 1)*
- **Images:** responsive derivatives (WebP + JPEG) for the hero portrait
  (480/720/960/1280 w) and the three blog covers (900/1600 w); WebP twins for
  the two heaviest in-post figures. Originals stay in place for the JSON-LD
  portrait and as sources. *(fixes 8)*
- **Share cards:** 1200×630 Open Graph cards for home, journey, research, hub and
  server. *(fixes 9)*
- **Fonts:** self-host Inter, Space Grotesk and JetBrains Mono as variable
  WOFF2 (latin + latin-ext, SIL OFL) under `Files/fonts/`, replacing the
  `@import`. *(fixes 19; also removes the Google Fonts third-party request)*

### Phase B — `styles.css` (site-wide)
- `@font-face` block with `font-display: swap` and `unicode-range`; drop the `@import`.
- Tokens: light `--accent-2` → `#0e7490`; `--faint` raised to pass 4.5:1 in
  both themes; white-on-gradient controls start from `--accent-deep` on light. *(12)*
- Palette and drawer: `visibility` flips instantly on open, delayed on close;
  `.nav-drawer` hidden from the tab order when closed. *(2, 4)*
- `html.js .reveal` guard so content is visible without JavaScript. *(5)*
- `@media (prefers-reduced-motion: reduce)` block that stops every infinite
  animation and smooth scrolling; `html.bg-idle` / `html.bg-static` rules that
  pause the aurora when the visitor is idle or on a low-end device. *(10, 11)*
- Skip link, `<main>` support, footer link row, print stylesheet, in-text link
  underlines, larger drawer close target, readable `.photo-geo` on light,
  typing-effect sizer, `content-visibility: hidden` for collapsed blog bodies,
  a `--danger` token, blog measure cap, blog cover as a real `<button>`. *(14, 15, 25, 27, 29, 32)*
- Remove the dead rules. *(24)*

### Phase C — `script.js` (site-wide)
- **theme:** sync `aria-pressed`, a descriptive label and `meta theme-color` on load and toggle. *(13, 31)*
- **palette:** focus the input synchronously, ARIA combobox/listbox/option
  wiring, `aria-activedescendant`, Tab trap, focus return, Escape handled in
  the window listener. *(2, 13)*
- **drawer:** move focus in/out, `inert` the page behind it, `aria-expanded`
  everywhere. *(4)*
- **scrollUI:** never hide the nav while focus is inside it. *(14)*
- **reveal / motion:** honour `prefers-reduced-motion`; add a small `motion`
  module that marks the page idle after ~4 s without input, pauses the network
  canvas and aurora, runs the mouse trail only while points are alive, and
  stops both loops in hidden tabs. *(10, 11)*
- **blog:** expander is a button with `aria-expanded`; collapsed bodies are
  `inert`; `hashchange` opens the target post. *(3, 15)*
- **copyEmail:** re-insert the toast text so the live region announces. *(26)*
- **activeNav:** set `aria-current="location"` with the `.active` class. *(22)*
- **telemetry:** stop the heartbeat while hidden and resume on visible;
  skip entirely when the browser sends Global Privacy Control or Do Not Track. *(16)*
- **svcStatus:** first probe deferred to idle time after `load`; drop the
  per-badge `aria-label` that was overriding each link's name. *(21, 26)*
- Add `html.js` as early as possible (also in a `<head>` boot script). *(5, 6)*

### Phase D — every page's `<head>` and chrome
- One-line boot script in `<head>`: apply the saved theme before first paint
  and add `html.js`. Journey's boot script also adds `jn-on`. *(6, 5, 20)*
- `rel="canonical"`, complete Open Graph + `twitter:card` + `og:image` size/alt
  on every page, icon links + manifest, font preloads, `Referrer-Policy` meta. *(1, 9)*
- One navigation model on every page: primary links **Home · Journey ·
  Research · Hub · Server · CV** (`index.html` and `journey.html` keep the
  section anchors in front of them; `blog.html` keeps its three post anchors),
  `aria-current="page"` on the current page, identical mobile drawer, the
  ⌘K palette on every content page, `type="button"` on every button. *(7, 13, 22)*
- Skip link + `<main>` on every page; a footer with the same links, the
  privacy note and the email. *(14, 7)*
- `journey.html`: `--jn-len` in markup, `jn-live` gating for `will-change` and
  the decorative loops, `sizes` cap for 3× phones, `aria-label` on the split
  name, off-stage links removed from the tab order until visible, fix the
  undefined `--stroke`, rail focus label. *(20, 26, 27)*
- `blog.html`: `<button>` expanders, responsive covers with
  `fetchpriority`/`width`/`height`, intrinsic sizes on every figure, corrected
  alts, themed legend with a non-colour cue, `Blog`/`BlogPosting` JSON-LD,
  spelling normalised. *(3, 8, 17, 25, 30)*
- `index.html`: responsive hero portrait with `<picture>`, `@graph` JSON-LD
  (WebSite + ProfilePage + Person), shorter `<title>`, "36 TB", Télécom
  SudParis, "Career" kicker, `role="list"`, named GitHub links. *(8, 17, 26, 28, 30)*
- `fun.html`: `<h2>` card titles, `aria-pressed` pills + status region,
  specific launch-link names, grid `minmax(min(320px,100%),1fr)`. *(13, 22, 23, 28)*
- `server.html`: `<h1>`, Clash Royale, consistent host labels. *(22, 30)*
- `404.html`: `noindex`, `aria-expanded`, `--danger`. *(31)*
- New `privacy.html`: what the telemetry records, why, retention, how to opt
  out (GPC/DNT); linked from every footer, the palette and the sitemap. *(16)*

### Phase E — SEO files and docs
- `sitemap.xml` real lastmod dates + `privacy.html`; `robots.txt` newline;
  `llms.txt` skills trimmed to what the site lists. *(17, 18)*
- `docs/ARCHITECTURE.md` refreshed (file index, module map, fonts, icons);
  `CLAUDE.md` cross-reference note gains "bump the sitemap lastmod";
  `CHANGELOG.md` Unreleased entry. *(33)*

### Verification
`node --check script.js`; `html-validate` on all pages (remaining reports are
intentional inline styles only); Chromium renders of every page in both
themes at 1366 and 390 with reveals triggered; interaction checks for the
palette, drawer, blog expanders, hash deep links and the no-JS fallback;
an adversarial review of the final diff.

### Status

Phases A–E were applied in this pass (see `CHANGELOG.md` → Unreleased). Checks
run on the result: `node --check script.js` and the inline journey engine;
`html-validate` on all seven pages (remaining reports are the intentional
inline `style` attributes, `role="list"` on styled lists and the palette's
`role="listbox"` div); Chromium renders of every page in both themes at 1366
and 390 px with the real typefaces and reveals triggered; scripted checks of
the palette, drawer, blog expanders, hash deep links, hub filters, theme
toggle, idle pause, reduced motion and the no-JS fallback; and an independent
review of the diff.

---

## 3. Decisions left to the owner (not applied)

1. **4.9 MB of unreferenced assets** — `profile.jpg` (2.7 MB), `profile.PNG`,
   `Notes/*`, three HomeServer screenshots. Nothing links to them; they may
   be sources you still want. Delete, or gitignore, at your discretion.
2. **`/portfoliobuilder`** on `server.html` has no file in this repo; if
   Cloudflare does not route it, the same-origin probe will show a green
   "404" dot. Point it at `builder.peterfarah.com` or add the page.
3. **Blog publication dates** — `BlogPosting` data ships without
   `datePublished` because the real dates are not in the repo. Add them (and a
   visible date under each title) when known.
4. **`llms.txt` skills** — the unsupported items were removed; if any are real
   (Bash, BGP/OSPF, SIEM…), add them to the Skills section first and then back
   to `llms.txt`.
5. **"36 TB" and "50+ automated workflows"** — the storage figure is raw
   capacity (SHR-1 usable is ~18 TB) and the workflow count has no source on
   the site. Both kept as written.
6. **Content-Security-Policy** — considered and not added: with inline scripts
   on four pages a meta CSP would need `'unsafe-inline'` and add risk to the
   service probes for little gain.
7. **Splitting the three write-ups into their own pages** would give each a
   real URL and title; it is a larger content change than this pass.
