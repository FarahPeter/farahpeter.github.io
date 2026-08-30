# CLAUDE.md — project context for `farahpeter.github.io`

**Project:** Peter Farah's personal portfolio. A **static** site (plain HTML +
CSS + vanilla JS) deployed on **GitHub Pages** at **https://peterfarah.com**.
No framework, no build step: edit a file, push to the default branch, it's live.

This file is **context only** — what the project is and how it's put together.
There is no mandated workflow, gate, or review process for this repo.

**Background reading:**
- `docs/PROJECT_CONTEXT.md` — what the project is, who it's for, the owner's factual bio, the design language, deployment, and what to ignore.
- `docs/ARCHITECTURE.md` — file-by-file index, the `script.js` module map, the `styles.css` structure, and coding conventions.

---

## Things worth knowing before editing

1. **Archived dirs — `Old/`, `Old2/`, `OLD3/`** are old snapshots. Not part of the live site.
2. **`FUN/`** holds standalone single-file browser tools. Only `FUN/AQMgame.html` is live and maintained (the "AQM Network Visualizer"); the rest are low-priority.
3. **`server.py`, `serverV2.py`, `serverV3.py`** are dormant Flask analytics apps from Peter's home server. The site no longer sends them data. They're kept on purpose — don't delete them.
4. **`server.html` ≠ `server*.py`.** `server.html` is a public "Service Access Panel" page; the `.py` files are the unrelated dormant backend.
5. **`llms.txt`** is a deliberate public-facing site feature (an AI-crawler easter-egg about the owner), not developer documentation.
6. **Shared files hit every page.** `styles.css` and `script.js` are loaded site-wide, so a change there affects all pages.
7. **Design tokens.** The look comes from the `:root` CSS variables in `styles.css` (liquid-glass, azure-blue, bento). Both dark (default) and light themes exist.
8. **Commented-out blocks are often intentional** — several pages park features in comments.
9. **No build step.** No bundler, framework, or package manager. Test by opening the HTML or running a simple static server.
10. **The owner's bio is factual.** Don't invent skills, jobs, dates, or certs; use what's on the site / in `docs/PROJECT_CONTEXT.md`.

## Cross-references to keep in sync
When a page or section is added or renamed: navbar + mobile-drawer links, the
command-palette item list in `script.js` (`palette` module), and `sitemap.xml`.

---

## Repo at a glance
```
index.html  journey.html  blog.html  fun.html  server.html  404.html   ← pages (root)
styles.css  script.js                                     ← shared, site-wide
Files/                                                     ← CV, images, favicon
FUN/AQMgame.html                                           ← live tool (rest of FUN/: standalone)
sitemap.xml  robots.txt  llms.txt  CNAME                   ← SEO / config
server.py  serverV2.py  serverV3.py                        ← dormant Flask telemetry (keep)
docs/                                                      ← project context + architecture
Old/  Old2/  OLD3/                                         ← archived snapshots
```

## Running it

No build step. From the repo root: `python -m http.server 8873 --bind
127.0.0.1` → http://127.0.0.1:8873/ (mirrors `.claude/launch.json`'s
`static-site` config). JS syntax check: `node --check script.js`. A merge to
`main` deploys to production (GitHub Pages) — merging/pushing is the owner's
call.
