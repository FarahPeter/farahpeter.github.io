# Architecture & File Index — farahpeter.github.io

> The technical map of the project. Pair with `docs/PROJECT_CONTEXT.md` (the
> "what & why") and the root `CLAUDE.md` (working rules + model routing).

---

## 1. How the site is wired

A flat static site. Every page is a standalone `.html` file at the repo root
that shares **one** stylesheet (`styles.css`) and **one** script (`script.js`).
There is no router, no templating, no bundler — links are plain relative `href`s
between `.html` files.

```
Browser ──> index.html / blog.html / fun.html / server.html / 404.html
                 │              shared
                 ├── styles.css      (all global styling + theming tokens)
                 └── script.js       (all interactions, one IIFE, no dependencies)

Assets ──> Files/  (CV PDF, profile + blog images, favicon)
Tools  ──> FUN/    (self-contained single-file HTML tools; AQMgame.html is the live one)
SEO    ──> sitemap.xml, robots.txt, llms.txt, CNAME
Dormant──> server.py, serverV2.py, serverV3.py  (Flask telemetry — kept, unused)
Archive──> Old/, Old2/, OLD3/  (ignore)
```

No external JS libraries are loaded on the main pages — only Google Fonts via
CSS `@import`. (`FUN/` tools and `AQMgame.html` may contain their own inline
scripts.)

---

## 2. Active file index

### Pages (root)
| File | Lines | Role |
|------|-------|------|
| `index.html` | ~540 | Landing/profile. Hero "bento" grid, count-up stats, About, Experience & Education timeline, Skills (proficiency bars), Projects, Certificates. Contains JSON-LD `Person` structured data. |
| `journey.html` | ~1100 | "Journey" — immersive Apple-style scrollytelling intro. Six pinned, scroll-scrubbed scenes (hero, statement, route timeline, craft gallery, packet flow, finale). Self-contained: page-scoped `<style>` + inline engine, all `jn-` prefixed; static fallback when JS is off or `prefers-reduced-motion` is set. |
| `blog.html` | ~450 | Research blog. Three expandable write-ups: `#aqm-research`, `#home-server`, `#home-nas`. |
| `fun.html` | ~543 | "Interactive Hub" — filterable grid of cards linking into `FUN/`. Has a page-specific `<style>` block (hub grid) and a small inline filter script. |
| `server.html` | ~115 | "Service Access Panel" — buttons linking to self-hosted services behind Cloudflare Zero Trust. Some service groups are commented out. **Not** related to `server*.py`. |
| `404.html` | ~120 | Custom themed 404 ("Packet Dropped — Page Not Found"). |

### Shared assets (root)
| File | Lines | Role |
|------|-------|------|
| `styles.css` | ~570 | Global stylesheet. `:root` design tokens + `[data-theme="light"]` overrides. The single source of truth for the look. |
| `script.js` | ~355 | All interactivity, wrapped in one `(function(){ 'use strict'; … })()`. Vanilla ES6+, no dependencies. See module list below. |

### SEO / config (root)
| File | Role |
|------|------|
| `CNAME` | Custom domain: `peterfarah.com`. |
| `sitemap.xml` | Lists `/`, `blog.html`, `journey.html`, `fun.html`, `server.html`, `AQMgame.html`. |
| `robots.txt` | Allows all; points to sitemap. |
| `llms.txt` | Public "instructions for AI crawlers" easter-egg about the owner. **Site content, not dev docs — keep it.** |

### Assets folder — `Files/`
- `Files/CV/CV_V16/CV-Peter_Farah.pdf` — the résumé linked as "Download CV" across the site. (Versioned folder: the live link currently points at `CV_V16`.)
- `Files/images/profile/` — `profile.jpg`, `profile.PNG`, `profile_old.jpg` (the hero + Open Graph image currently uses `profile_old.jpg`).
- `Files/images/Blog/` — images for each write-up: `AQMResearche/`, `HomeServer/`, `NAS/`.
- `Files/images/Notes/` — misc diagrams.
- Favicon: `Files/images/favicon.ico` (plus an inline SVG favicon defined in each page `<head>`).

### Interactive tools — `FUN/`
- **`FUN/AQMgame.html`** (~1480 lines) — **LIVE & maintained.** "AQM Network Visualizer": animated simulation of RTT signatures for 7 AQM algorithms. Linked from the navbar, projects, blog, and command palette.
- Everything else in `FUN/` (subnet, cidr, chmod, cron, crypto, dns, whois, json, base64, urlencode, mac, jwt, hashing, nmap, password, password-strength, ports, regex, firewall, ping, entropy, sketch, …) — standalone single-file tools. Some are surfaced on `fun.html`, some are commented out. **Owner marked these out of scope; don't deep-dive unless asked.**

### Dormant backend — keep, don't delete
| File | Lines | Role |
|------|-------|------|
| `server.py` | ~672 | v1 Flask telemetry: heartbeat/click ingest → SQLite, basic dashboard. |
| `serverV2.py` | ~532 | v2: adds Flask-Limiter rate limiting + User-Agent parsing. |
| `serverV3.py` | ~940 | v3 (most evolved): GeoIP + UA enrichment, Chart.js dashboard, Prometheus `/metrics`, Docker `/healthz`, env-var config. |

All three ran on Peter's home server, ingesting analytics from the site JS.
The client no longer sends that data, so they're dormant — **retained intentionally.**

### Ignore entirely
- `Old/`, `Old2/`, `OLD3/` — archived older versions of the whole site.

---

## 3. `script.js` — module map

One IIFE containing independent sub-modules (each its own inner IIFE). Helpers:
`$` / `$$` (querySelector wrappers). Note `reduceMotion` is hard-coded `false`
(animations always on).

1. **theme** — applies `data-theme` from `localStorage['pf-theme']` (default `dark`); wires `#theme-toggle` + `#drawer-theme`.
2. **cursor** — soft glow under the pointer + canvas mouse-trail (fine-pointer devices only).
3. **network** — animated node/packet network on `#net-canvas`; colors derive from the live `--accent` CSS variable.
4. **scrollUI** — scroll-progress bar + nav shadow + auto-hide-on-scroll-down.
5. **drawer** — mobile nav drawer open/close + overlay + Esc handling.
6. **reveal** — `IntersectionObserver` adds `.in` to `.reveal` sections; triggers skill-bar fills.
7. **counters** — count-up animation for `.hero-stat-number` (`data-target` / `data-prefix` / `data-suffix`).
8. **typing** — typewriter effect for `.typing-effect` (`data-text`).
9. **activeNav** — highlights the in-view section's nav link.
10. **copyEmail** — copies `peter@peterfarah.com` + shows a toast.
11. **backTop** — back-to-top button visibility + smooth scroll.
12. **blog** — expand/collapse `.blog-cover` cards; auto-opens the post matching `location.hash`.
13. **palette** — ⌘K / Ctrl-K command palette (search + jump to sections/pages/external links). Its item list is hard-coded inside this module — **update it when adding pages or sections.**

---

## 4. `styles.css` — structure

- `@import` Google Fonts (Space Grotesk, Inter, JetBrains Mono).
- `:root` — design tokens: colors (`--bg`, `--accent*`, glass surfaces), radii, shadows, blur, nav height, max width, font families.
- `[data-theme="light"]` — light-mode token overrides.
- Then component styles: nav/drawer, hero bento, tiles, timeline (`.xp-*`), skills (`.skill*`), projects, certificates, blog (`.blog-*`), server panel (`.setup-*`), command palette (`.cmd-*`), cursor/canvas, footer, back-to-top, responsive media queries.
- Page-specific styling that isn't global lives in a `<style>` block in that page (e.g. the hub grid in `fun.html`).

---

## 5. Conventions (follow these)

- **HTML:** semantic HTML5; keep ARIA labels/roles and `aria-*` states intact; maintain mobile + desktop responsiveness.
- **CSS:** use the existing `:root` variables instead of hard-coded values; `kebab-case` class/id names; match the established glassmorphism + reveal patterns. Add light-theme equivalents when adding themed colors.
- **JavaScript:** vanilla ES6+, no dependencies, `camelCase` names. Add new behavior as a self-contained inner module inside the existing IIFE in `script.js`, guarding for missing elements (`if (!el) return;`).
- **Comments:** if a block is commented out, leave it commented unless explicitly asked to change it (several pages intentionally park features in comments).
- **Shared edits propagate:** `styles.css` and `script.js` are loaded by every page — a change affects the whole site. Sanity-check across pages.
- **Keep cross-references in sync:** when adding/renaming a page or major section, update the navbar + mobile drawer links, the command-palette item list in `script.js`, and `sitemap.xml`.
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
| Change a global interaction (cursor, palette, reveal…) | `script.js` |
| Update the command-palette entries | `script.js` → `palette` module |
| Swap the CV or an image | `Files/…` (and update the `href`/`src`) |
| Update crawler/SEO behavior | `sitemap.xml`, `robots.txt`, `llms.txt` |
