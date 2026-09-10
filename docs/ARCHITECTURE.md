# Architecture & File Index — farahpeter.github.io

> The technical map of the project. Pair with `docs/PROJECT_CONTEXT.md` (the
> "what & why") and the root `CLAUDE.md` (repo-level notes).

---

## 1. How the site is wired

A flat static site. Every page is a standalone `.html` file at the repo root
that shares **one** stylesheet (`styles.css`) and **one** script (`script.js`).
There is no router, no templating, no bundler — links are plain relative `href`s
between `.html` files.

```
Browser ──> index.html / journey.html / blog.html / fun.html / server.html / privacy.html / 404.html
                 │              shared
                 ├── styles.css      (all global styling + theming tokens + self-hosted @font-face)
                 └── script.js       (all interactions, one IIFE, no dependencies)

Assets ──> Files/  (CV PDF, profile + blog images and their responsive derivatives,
                    fonts/ (variable WOFF2), images/og/ (share cards), images/icons/, favicon.ico)
Tools  ──> FUN/    (self-contained single-file HTML tools; AQMgame.html is the live one)
SEO    ──> sitemap.xml, robots.txt, llms.txt, CNAME, site.webmanifest
Local  ──> server.py, serverV2.py, serverV3.py  (Flask telemetry — gitignored)
Archive──> Old/, Old2/, OLD3/  (gitignored — ignore)
```

No external resources are loaded by the main pages at all: the three typefaces
are self-hosted under `Files/fonts/` (`@font-face` at the top of `styles.css`,
SIL OFL — see `Files/fonts/LICENSE.md`). (`FUN/` tools and `AQMgame.html` may
contain their own inline scripts.)

**Every page shares the same chrome**, in this order: a one-line boot `<script>`
in `<head>` (restores the saved theme before first paint and adds `html.js`),
canonical + Open Graph + Twitter tags pointing at a card in `Files/images/og/`,
the icon set + manifest, two font preloads, then the body: skip link →
background layers → `<nav>` (Home · Journey · Research · Hub · Server · CV,
with `aria-current="page"`) → mobile drawer → `<main id="main">` → footer (same
links + Privacy) → back-to-top → ⌘K palette markup. Copy an existing page when
adding one.

---

## 2. Active file index

### Pages (root)
| File | Lines | Role |
|------|-------|------|
| `index.html` | ~660 | Landing/profile. Hero "bento" grid (responsive WebP portrait), count-up stats, About, Experience & Education timeline, Skills (tag tiles), Projects, Certificates, Contact. Contains a JSON-LD `@graph` (WebSite + ProfilePage + Person). |
| `journey.html` | ~2060 | "Journey" — immersive Apple-style scrollytelling intro. Nine pinned, scroll-scrubbed scenes: hero, statement, route timeline, **photo reel (`jn-s3b`, "Two years, away")**, craft gallery, **photo reel (`jn-s4b`, "Where it actually runs")**, packet flow, **photo reel (`jn-s5b`, "And the rest of it")**, finale. The three reels share one `buildReel()` factory (full-bleed dissolve + Ken Burns) and derive every timing, the counter and the tick strip from the number of `.jn-frame` figures in the markup — adding a photo is a markup-only change. Photos live in `Files/images/journey/web/` at two widths (`-900`/`-1600`), EXIF-stripped. Self-contained: page-scoped `<style>` + inline engine, all `jn-` prefixed; static fallback when JS is off, when `prefers-reduced-motion` is set, or if the engine throws. The `<head>` boot script adds `jn-on` before first paint; the engine's IntersectionObserver toggles `.jn-live` on the scene on screen, which is what scopes `will-change` and the decorative loops. |
| `blog.html` | ~560 | Research blog. Three expandable write-ups: `#aqm-research`, `#home-server`, `#home-nas`; each cover has a real `<button class="cover-toggle" aria-expanded>` and a `…-body` wrapper. Covers are responsive WebP/JPEG derivatives. Carries `Blog`/`BlogPosting` JSON-LD (no dates — the owner has to add `datePublished`). |
| `fun.html` | ~780 | "Interactive Hub" — filterable grid of cards linking into `FUN/`. Has a page-specific `<style>` block (hub grid) and a small inline filter script (`aria-pressed` pills + a live result count). |
| `server.html` | ~330 | "Service Access Panel" — buttons linking to self-hosted services behind Cloudflare Zero Trust, each showing a live reachability dot + RTT from the **svcStatus** module. Page-specific probe styling lives in its inline `<style>`. Some service groups are commented out. **Not** related to `server*.py`. |
| `privacy.html` | ~170 | What the telemetry records, why, and how to opt out (GPC / DNT). Linked from every footer and the palette. |
| `404.html` | ~160 | Custom themed 404 ("Packet Dropped — Page Not Found"); `noindex`; root-relative asset paths because GitHub Pages serves it at any depth. |

### Shared assets (root)
| File | Lines | Role |
|------|-------|------|
| `styles.css` | ~1000 | Global stylesheet. `@font-face` block, `:root` design tokens + `[data-theme="light"]` overrides, components, motion-budget / reduced-motion / print blocks, responsive queries. The single source of truth for the look. |
| `script.js` | ~880 | All interactivity, wrapped in one `(function(){ 'use strict'; … })()`. Vanilla ES6+, no dependencies. See module list below. |

### SEO / config (root)
| File | Role |
|------|------|
| `CNAME` | Custom domain: `peterfarah.com`. |
| `sitemap.xml` | Lists `/`, `blog.html`, `journey.html`, `fun.html`, `server.html`, `AQMgame.html`, `privacy.html`. Bump `<lastmod>` with every content change. |
| `robots.txt` | Allows all; points to sitemap. |
| `llms.txt` | Public "instructions for AI crawlers" easter-egg about the owner. **Site content, not dev docs — keep it.** Its skills list mirrors the Skills section on `index.html` — keep them in sync. |
| `site.webmanifest` | Name, colours and the 192/512 px icons for "add to home screen". |

### Assets folder — `Files/`
- `Files/CV/CV_V16/CV-Peter_Farah.pdf` — the résumé linked as "Download CV" across the site. (Versioned folder: the live link currently points at `CV_V16`.)
- `Files/images/profile/` — `profile_old.jpg` is the source portrait (used only as the JSON-LD Person image); the hero and the journey finale use the `profile-{480,720,960,1280}.{webp,jpg}` derivatives. `profile.jpg` / `profile.PNG` are unreferenced.
- `Files/images/Blog/` — images for each write-up: `AQMResearche/`, `HomeServer/`, `NAS/`. The three covers and the heaviest figures have `-900`/`-1600` (or `-1467`) WebP/JPEG derivatives next to the originals.
- `Files/images/og/` — 1200×630 share cards, one per page (`og-home`, `og-journey`, `og-blog`, `og-hub`, `og-server`).
- `Files/images/icons/` — `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`; `Files/images/favicon.ico` (16/32/48, PNG-in-ICO). All rendered from the inline SVG mark each page also declares.
- `Files/fonts/` — Inter, Space Grotesk, JetBrains Mono as variable WOFF2 (latin + latin-ext) + `LICENSE.md`.
- `Files/images/Notes/` — misc diagrams (unreferenced).

### Interactive tools — `FUN/`
- **`FUN/AQMgame.html`** (~1480 lines) — **LIVE & maintained.** "AQM Network Visualizer": animated simulation of RTT signatures for 7 AQM algorithms. Linked from the navbar, projects, blog, and command palette.
- Everything else in `FUN/` (subnet, cidr, chmod, cron, crypto, dns, whois, json, base64, urlencode, mac, jwt, hashing, nmap, password, password-strength, ports, regex, firewall, ping, entropy, sketch, …) — standalone single-file tools. Some are surfaced on `fun.html`, some are commented out. **Owner marked these out of scope; don't deep-dive unless asked.**

### Telemetry backend — local-only, keep, don't delete
| File | Lines | Role |
|------|-------|------|
| `server.py` | ~672 | v1 Flask telemetry: heartbeat/click ingest → SQLite, basic dashboard. |
| `serverV2.py` | ~532 | v2: adds Flask-Limiter rate limiting + User-Agent parsing. |
| `serverV3.py` | ~940 | v3 (most evolved): GeoIP + UA enrichment, Chart.js dashboard, Prometheus `/metrics`, Docker `/healthz`, env-var config. |

All three run on Peter's home server, never on GitHub Pages. `script.js`'s **telemetry**
module sends to `serverV3.py` (behind `https://hook.peterfarah.com`); `server.py` and
`serverV2.py` are superseded but **retained intentionally.** Capture only works while that
origin is actually running — the client fails silently when it isn't.

All three are **gitignored** — present in Peter's working copy, absent from the repo. Don't
expect to find them in a fresh clone, and don't `git add` them.

### Ignore entirely
- `Old/`, `Old2/`, `OLD3/` — archived older versions of the whole site. Gitignored, so
  they exist only in Peter's working copy.

---

## 3. `script.js` — module map

One IIFE containing independent sub-modules (each its own inner IIFE). Helpers:
`$` / `$$` (querySelector wrappers). Note `reduceMotion` is hard-coded `false`
(animations always on).

Shared state at the top of the IIFE: `reduceMotion` (the OS preference),
`lowEnd` (save-data / ≤2 GB / ≤2 cores) and a `motion` object (`idle`,
`hidden`, `static`, `running`) that the decorative loops consult.

1. **theme** — applies `data-theme` from `localStorage['pf-theme']` (default `dark`); wires `#theme-toggle` + `#drawer-theme`; keeps `aria-pressed`, the toggle label and `meta[name=theme-color]` in sync; fires `pf:theme`.
2. **motionBudget** — sets `html.bg-idle` after 6 s without input (removed on the next pointer/scroll/key event), `html.bg-static` for reduced-motion / low-end devices, tracks tab visibility, and fires `pf:motion` so loops can stop and restart.
3. **cursor** — soft glow under the pointer + canvas mouse-trail (fine-pointer devices only); the trail loop runs only while a point is fading.
4. **network** — animated node/packet network on `#net-canvas`; colors derive from the live `--accent` CSS variable (re-read on `pf:theme`); pauses while `motion.running` is false; draws one still frame under reduced motion.
5. **scrollUI** — scroll-progress bar + nav shadow + auto-hide-on-scroll-down (never while focus is inside the nav).
6. **drawer** — mobile nav drawer open/close + overlay + Esc handling; moves focus in/out and makes the rest of the page `inert` while open.
7. **reveal** — `IntersectionObserver` adds `.in` to `.reveal` sections (CSS only hides them under `html.js`).
8. **counters** — count-up animation for `.hero-stat-number` (`data-target` / `data-prefix` / `data-suffix`); instant under reduced motion.
9. **typing** — typewriter effect for `.typing-effect` (`data-text`), typing into `.typing-out` over an invisible `.typing-sizer` so the line never reflows.
10. **activeNav** — highlights the in-view section's nav link (`.active` + `aria-current="location"`).
11. **copyEmail** — copies `peter@peterfarah.com` + shows (and announces) a toast.
12. **backTop** — back-to-top button visibility + smooth scroll.
13. **blog** — expand/collapse posts via the `.cover-toggle` button (`aria-expanded`, collapsed bodies `inert`); opens the post matching `location.hash` on load and on `hashchange`.
14. **palette** — ⌘K / Ctrl-K command palette (search + jump to sections/pages/external links). Combobox/listbox ARIA, Tab trap, focus return, Escape. Its item list is hard-coded inside this module — **update it when adding pages or sections.**
15. **spotlight** — delegated, rAF-throttled pointer tracking; sets element-local `--mx`/`--my` on the nearest `.tile-hover`/`.hub-card`/`.blog-cover` so its CSS radial glow follows the cursor (fine-pointer only).
16. **tilt** — 3D tilt (max 4°) on `.hero-photo` via pointermove + rAF; adds/removes `.tilt-3d` (fine-pointer only).
17. **magnetic** — pulls `.btn`, `.copy-email-btn`, and `.social-icons a` a few px toward the cursor via `--mag-x`/`--mag-y` (fine-pointer only).
18. **stagger** — when a `.reveal` section gains `.in`, assigns incremental `--i` to grid items (projects/skills/certs/xp rows) so CSS entrance transitions fan out; watches the class via MutationObserver.
19. **telemetry** — analytics capture for the self-hosted collector at `hook.peterfarah.com` (`serverV3.py`). POSTs a `/heartbeat` on load, every 10 s while the tab is visible (the interval stops on hide and restarts on show), on `visibilitychange`→hidden and on `pagehide`; POSTs `/track-click` from a delegated capture-phase listener on `a, button`. Guarded to `*.peterfarah.com`, so localhost and preview hosts never report, and skipped entirely for browsers that send Global Privacy Control or Do Not Track (what is collected is described on `privacy.html`). Every request is fire-and-forget with `keepalive` and swallows its own errors, and the module stops itself after 3 consecutive failures so an unreachable collector can't fill a visitor's console.

20. **svcStatus** — live reachability probe for `server.html` only; returns immediately on every other page (it needs `.server-panel`). After `load` (at idle) it `HEAD`s each listed service and appends a dot + round-trip time to that service's row, then summarises them as “N/M responding · median X ms”. Cross-origin hosts are fetched with `mode: 'no-cors'`, so the response is opaque — it proves the edge answered and how fast, never that the app behind it is healthy; only same-origin services expose a real HTTP status, where anything under 500 counts as up. Credentials are omitted so a visitor's Cloudflare Access session is never attached. 8 s timeout, no polling loop — one run on load, then the Re-check button.

---

## 4. `styles.css` — structure

- `@font-face` for the self-hosted Space Grotesk, Inter and JetBrains Mono (variable, `font-display: swap`, latin / latin-ext `unicode-range`).
- `:root` — design tokens: colors (`--bg`, `--accent*`, `--danger`, glass surfaces), radii, shadows, blur, nav height, max width, font families.
- `[data-theme="light"]` — light-mode token overrides (`--accent-2` and `--faint` are tuned to pass AA on the light canvas).
- Base: `[hidden]`, `main`, body layers (aurora, grid, grain), typography, `.skip-link`, `.visually-hidden`, focus ring.
- Then component styles: nav/drawer (drawer is `visibility:hidden` while closed), hero bento (typing sizer), tiles, timeline (`.xp-*`), skills tiles, projects, certificates, footer (`.footer-links`), back-to-top, command palette (`.cmd-*`, `visibility` flips instantly on open), blog (`.blog-*`, collapsed bodies use `content-visibility: hidden`), server panel (`.setup-*`), 404, reveal (guarded by `html.js`).
- `html.bg-idle` / `html.bg-static` pause rules, a `prefers-reduced-motion` block, a `@media print` block, then the responsive media queries.
- Page-specific styling that isn't global lives in a `<style>` block in that page (e.g. the hub grid in `fun.html`, the reachability badges in `server.html`).

---

## 5. Conventions (follow these)

- **HTML:** semantic HTML5; keep ARIA labels/roles and `aria-*` states intact; maintain mobile + desktop responsiveness.
- **CSS:** use the existing `:root` variables instead of hard-coded values; `kebab-case` class/id names; match the established glassmorphism + reveal patterns. Add light-theme equivalents when adding themed colors.
- **JavaScript:** vanilla ES6+, no dependencies, `camelCase` names. Add new behavior as a self-contained inner module inside the existing IIFE in `script.js`, guarding for missing elements (`if (!el) return;`).
- **Comments:** if a block is commented out, leave it commented unless explicitly asked to change it (several pages intentionally park features in comments).
- **Shared edits propagate:** `styles.css` and `script.js` are loaded by every page — a change affects the whole site. Sanity-check across pages.
- **Keep cross-references in sync:** when adding/renaming a page or major section, update the navbar + mobile drawer + footer links on every page, the command-palette item list in `script.js`, and `sitemap.xml` (with a fresh `<lastmod>`).
- **Motion:** decorative loops must check `motion.running` and listen for `pf:motion`; anything infinite in CSS should be listed in the `html.bg-idle` / `html.bg-static` rule so the idle pause covers it. `prefers-reduced-motion` is honoured — do not hard-code it off again.
- **Images:** give every `<img>` `width`/`height`; anything above ~150 KB gets a WebP/JPEG derivative and `srcset` (the originals stay as sources).
- **No build step:** test by opening the HTML directly or via a simple static server; there's nothing to compile.

---

## 6. Quick "where do I…?" map

| I want to… | Go to |
|------------|-------|
| Change colors, spacing, fonts, the overall look | `styles.css` `:root` |
| Edit profile content, timeline, skills, projects | `index.html` |
| Edit a research write-up | `blog.html` (`#aqm-research` / `#home-server` / `#home-nas`) |
| Add/lay out an interactive tool card | `fun.html` (links into `FUN/`) |
| Edit the self-hosted service links | `server.html` |
| Change how services are probed for status | `script.js` (**svcStatus**) + `server.html` inline `<style>` |
| Change a global interaction (cursor, palette, reveal…) | `script.js` |
| Update the command-palette entries | `script.js` → `palette` module |
| Swap the CV or an image | `Files/…` (and update the `href`/`src`; regenerate the `-900`/`-1600` derivatives for large images) |
| Change the share card of a page | `Files/images/og/` + that page's `og:image` / `twitter:image` |
| Update crawler/SEO behavior | `sitemap.xml`, `robots.txt`, `llms.txt`, each page's `<head>` |
| Change what the privacy page says | `privacy.html` (and the `telemetry` module if what is sent changes) |
