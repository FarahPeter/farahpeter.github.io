# Project Context — farahpeter.github.io

> Written for a future AI assistant. Read this first to understand **what this
> project is** before touching anything. For the technical map (files, JS/CSS
> modules, conventions, what to ignore), read `docs/ARCHITECTURE.md`.
> For repo-level notes and things to know before editing, read the root
> `AGENTS.md` and `CLAUDE.md`.

---

## 1. One-line summary

A **static personal portfolio website** for **Peter Farah** — a Cybersecurity /
Network / Infrastructure-Automation engineer — built with **plain HTML, CSS, and
vanilla JavaScript**, deployed on **GitHub Pages** at **https://peterfarah.com**.

No framework, no build step, no bundler. Editing a file and pushing to the
default branch publishes it live.

---

## 2. Who it's for and what it does

- **Audience:** recruiters, hiring managers, and fellow engineers.
- **Goal:** present Peter's experience, research, projects, and résumé in a
  polished, performant, accessible way, with a distinctive "cyber / network
  engineering" aesthetic.
- **Content pillars:**
  1. **Profile** (`index.html`) — hero, career timeline, skills, projects, certificates.
  2. **Research blog** (`blog.html`) — three long-form technical write-ups.
  3. **Interactive Hub** (`fun.html`) — a grid of standalone in-browser tools/simulators.
  4. **Service Access Panel** (`server.html`) — links to Peter's self-hosted services (behind Cloudflare Zero Trust).
  5. **Journey** (`journey.html`) — immersive scroll-driven ("scrollytelling") introduction: Beirut → Paris → Beirut, research, homelab, automation.

---

## 3. About the owner (factual reference — do not invent beyond this)

These facts come from the site itself (`index.html`, `blog.html`, JSON-LD,
`llms.txt`). Use them as ground truth; **do not hallucinate skills, jobs,
certifications, or dates that aren't here or already on the site.**

- **Name:** Peter Farah
- **Current role:** Infrastructure Automation Engineer at **Murex**, Beirut, Lebanon (Mar 2026 – present). Stack: Ansible, Jenkins, Git, Kubernetes.
- **Education:**
  - M.Sc. Computer Science / Cybersecurity — **Institut Polytechnique de Paris** (graduated with highest distinction in M2).
  - B.E. Computer & Communication Engineering — **American University of Beirut** (Dean's Honor List).
- **Notable past experience:** Network Security Researcher (Polytechnique & Télécom SudParis — AQM research), SOC R&D Intern (Exeo), Cybersecurity & Network Engineer (Dar), Cyber Threat Intelligence Officer Intern (POTECH).
- **Contact / links:** peter@peterfarah.com · https://www.linkedin.com/in/peter-farah-i · https://github.com/FarahPeter
- **Domains/services:** peterfarah.com (site) plus subdomains for self-hosted apps (e.g. `nas-grafana.`, `nas-vault.`, `nas-poker.`, `ssh.`, `grafana.`, `up.`, `access.peterfarah.com`).

### The three blog write-ups (`blog.html`)
1. **`#aqm-research`** — Active Queue Management classification & analysis. Custom C testbed measuring bottleneck bitrates + UDP RTT traces; a two-stage Python classifier using Dynamic Time Warping (DTW) to identify AQM algorithms (CoDel, FQ-CoDel, Cake, PIE, RED, FIFO, FQ).
2. **`#home-server`** — Home server (Ubuntu VM) running Python services, an automated YouTube pipeline, a custom Python FTP ingestion service, Prometheus + Grafana observability, and Cloudflare Zero Trust remote access.
3. **`#home-nas`** — Synology DS925+ NAS (2×18 TB Exos, SHR-1), snapshots, Docker apps via Container Manager, OpenWrt, and Cloudflare Zero Trust.

---

## 4. Design language (the "look")

Defined centrally in `styles.css` (`:root` tokens). The aesthetic is
**"liquid glass · electric azure-blue · bento layouts."**

- **Theme:** dark mode by default; a light theme is available via toggle (persisted in `localStorage` under key `pf-theme`).
- **Canvas:** deep blue background (`--bg: #07112e`), glassmorphism surfaces, soft glows.
- **Accents:** azure `#4d8dff`, cyan `#22d3ee`, indigo `#818cf8`.
- **Fonts (Google Fonts):** Space Grotesk (display/headings), Inter (body), JetBrains Mono (code/labels).
- **Signature interactions (all vanilla JS in `script.js`):** animated network-node canvas background, custom cursor glow + mouse trail, reveal-on-scroll, count-up hero stats, typing role effect, scrolling/​auto-hiding nav, command palette (⌘K / Ctrl-K), mobile drawer, copy-email toast, expandable blog cards.

Keep new work visually consistent with these tokens and patterns. Reuse the CSS
variables instead of hard-coding colors.

**Owner requirement — full motion stays enabled.** Never restore reduced-motion
or low-motion modes, motion-preference gates, or device/save-data/battery/idle
animation suppression. Journey must keep its animated pinned layout. Only an
explicit new request from Peter can change this requirement. `AGENTS.md` defines
the permitted no-JS, missing-API, engine-failure, print and visibility fallbacks
and the regression checks. Earlier audit recommendations on motion are superseded.

---

## 5. Deployment & infrastructure

- **Hosting:** GitHub Pages, repo `https://github.com/FarahPeter/farahpeter.github.io`, served from the repo root.
- **Custom domain:** `peterfarah.com` (set in `CNAME`).
- **No build pipeline:** it's a static site. A push to the default branch deploys it. There is nothing to compile or transpile.
- **SEO / crawler files:** `sitemap.xml`, `robots.txt`, and `llms.txt`. (`llms.txt` is a deliberate, public-facing "instructions for AI crawlers" easter-egg about the owner — it is **site content/marketing, not developer documentation**. Don't confuse it with the files in `docs/` or `CLAUDE.md`, and don't delete it as part of any "AI docs cleanup".)

---

## 6. The telemetry servers (`server.py`, `serverV2.py`, `serverV3.py`)

Flask backend apps that sit in Peter's working copy but run on his **home server**, never
on GitHub Pages. All three are **kept on purpose** — do not delete them — and all three are
**gitignored**, so they are local-only and never published to the public repo.

- They originally received analytics **heartbeats / click events** from the
  website's JS, enriched them with GeoIP + User-Agent data, stored them in
  SQLite, and served a real-time dashboard (`serverV3.py` is the most evolved:
  Chart.js dashboard, Prometheus `/metrics`, Docker `/healthz`).
- **`serverV3.py` is the live collector.** The site sends to it again: the
  **telemetry** module in `script.js` POSTs `/heartbeat` (on load, every 10 s, on
  tab-hide and on `pagehide`) and `/track-click`, to
  `https://hook.peterfarah.com` — the same host `server.html` links to for the
  admin dashboard. `server.py` and `serverV2.py` are superseded, not wired up.
- Capture only produces data while that origin is actually running behind
  Cloudflare. When it isn't, the collector returns 502 and the client fails
  silently — nothing on the site changes.
- The client is guarded to `*.peterfarah.com`, so local development and preview
  hosts never write into the database.
- What a heartbeat records: IP (via `CF-Connecting-IP`) plus GeoIP country/city/ISP,
  user-agent, page, referrer, screen, language, timezone, theme, scroll depth, load
  time, connection info, and `utm_source`; clicks record the link text and target.
- **Naming caution:** `server.html` (a public "Service Access Panel" page) is
  unrelated to `server*.py` (the dormant backend). Don't conflate them.

---

## 7. What to ignore (owner's instruction)

The owner has explicitly marked these as **old / unused — do not read, index, or
modify** them unless specifically asked:

(All three archive dirs below are gitignored — local-only, absent from a fresh clone.)

- `Old/`
- `Old2/`
- `OLD3/` (a full older snapshot of the site, including its own stale `AGENTS.md` and `llms.txt`)
- `FUN/` — **except `FUN/AQMgame.html`**, which is the live flagship "AQM Network Visualizer" (linked from the navbar, the projects/blog sections, and the command palette).

`FUN/` otherwise holds an assortment of self-contained, single-file browser
tools (subnet calc, JWT decoder, crypto playground, etc.). Several are surfaced
on `fun.html`; some are commented out there. Treat them as standalone and
low-priority — out of scope for this context pass.

---

## 8. Pointers

- **Technical map / file-by-file index / conventions →** `docs/ARCHITECTURE.md`
- **Repo-level notes / things to know before editing →** `CLAUDE.md` (repo root)
