# CLAUDE.md — project context for `farahpeter.github.io`

**Project:** Peter Farah's personal portfolio. A **static** site (plain HTML +
CSS + vanilla JS) deployed on **GitHub Pages** at **https://peterfarah.com**.
No framework, no build step: edit a file, push to the default branch, it's live.

This file is **context only** — what the project is and how it's put together.
There is no mandated workflow, gate, or review process for this repo.

**Background reading:**
- `docs/PROJECT_CONTEXT.md` — what the project is, who it's for, the owner's factual bio, the design language, deployment, and what to ignore.
- `docs/ARCHITECTURE.md` — file-by-file index, the `script.js` module map, the `styles.css` structure, and coding conventions.
- `docs/IMPROVEMENT_PLAN.md` — the September 2026 audit: what was found, what was changed, and the decisions left to the owner.

---

## Things worth knowing before editing

1. **Archived dirs — `Old/`, `Old2/`, `OLD3/`** are old snapshots. Not part of the live site, and **not in the repo** — they are gitignored and exist only on Peter's machine.
2. **`FUN/`** holds standalone single-file browser tools. Only `FUN/AQMgame.html` is live and maintained (the "AQM Network Visualizer"); the rest are low-priority.
3. **`server.py`, `serverV2.py`, `serverV3.py`** are Flask analytics apps that run on Peter's home server (never on GitHub Pages). **`serverV3.py` is live**: the `telemetry` module in `script.js` posts heartbeats and clicks to it via `https://hook.peterfarah.com`. `server.py` / `serverV2.py` are superseded. All three are kept on purpose — don't delete them — but they are **gitignored**, so they live on Peter's machine only and are never published to the public repo.
4. **`server.html` ≠ `server*.py`.** `server.html` is a public "Service Access Panel" page; the `.py` files are the unrelated dormant backend.
5. **`llms.txt`** is a deliberate public-facing site feature (an AI-crawler easter-egg about the owner), not developer documentation.
6. **Shared files hit every page.** `styles.css` and `script.js` are loaded site-wide, so a change there affects all pages.
7. **Design tokens.** The look comes from the `:root` CSS variables in `styles.css` (liquid-glass, azure-blue, bento). Both dark (default) and light themes exist.
8. **Commented-out blocks are often intentional** — several pages park features in comments.
9. **No build step.** No bundler, framework, or package manager. Test by opening the HTML or running a simple static server.
10. **The owner's bio is factual.** Don't invent skills, jobs, dates, or certs; use what's on the site / in `docs/PROJECT_CONTEXT.md`.

## Cross-references to keep in sync
When a page or section is added or renamed: navbar + mobile-drawer links **and the
footer link row** (every page carries the same set), the command-palette item
list in `script.js` (`palette` module), and `sitemap.xml` — and bump that page's
`<lastmod>` in `sitemap.xml` in the same commit as any content change.

Every page also carries the same `<head>` boilerplate: the one-line boot script
(theme + `html.js`), canonical/Open Graph/Twitter tags with a card from
`Files/images/og/`, the icon set + `site.webmanifest`, and two font preloads.
Copy an existing page's head when adding a new one.

---

## Repo at a glance
```
index.html  journey.html  blog.html  fun.html  server.html  privacy.html  404.html   ← pages (root)
styles.css  script.js                                     ← shared, site-wide
Files/                                                     ← CV, images (+ og/ cards, icons/), fonts/
FUN/AQMgame.html                                           ← live tool (rest of FUN/: standalone)
sitemap.xml  robots.txt  llms.txt  CNAME  site.webmanifest ← SEO / config
server.py  serverV2.py  serverV3.py                        ← Flask telemetry (local-only, gitignored)
docs/                                                      ← project context + architecture
Old/  Old2/  OLD3/                                         ← archived snapshots (local-only, gitignored)
```

## Running it

No build step. From the repo root: `python -m http.server 8873 --bind
127.0.0.1` → http://127.0.0.1:8873/ (mirrors `.claude/launch.json`'s
`static-site` config). JS syntax check: `node --check script.js`. A merge to
`main` deploys to production (GitHub Pages) — merging/pushing is the owner's
call.
