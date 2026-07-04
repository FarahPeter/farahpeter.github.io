# CLAUDE.md — instructions for AI assistants working on this repo

**Project:** `farahpeter.github.io` — Peter Farah's personal portfolio. A
**static** site (plain HTML + CSS + vanilla JS) deployed on **GitHub Pages** at
**https://peterfarah.com**. No framework, no build step: edit a file, push to the
default branch, it's live.

**Read these before doing real work:**
- `docs/PROJECT_CONTEXT.md` — what the project is, who it's for, the owner's factual bio, the design language, deployment, and what to ignore.
- `docs/ARCHITECTURE.md` — file-by-file index, the `script.js` module map, the `styles.css` structure, and coding conventions.

---

## Model routing

Routing is implemented by the **`planner` skill** (`.claude/skills/planner/`)
plus three implementer subagents (`.claude/agents/`). Use the planner skill for
any code change; it plans in the main session and delegates implementation.
**"max" = maximum reasoning / thinking effort** (delegation prompts start with
`ultrathink`).

- **Planning / design / review → main session** (Fable 5 max when available;
  otherwise Opus 4.8 max). The planner never types code except one-line fixes.
- **Security-related implementation → `implementer-security`** (`model:
  inherit` — Fable 5 max when available).
- **Hard implementation → `implementer-hard`** (Opus 4.8 max).
- **Simple implementation → `implementer-simple`** (Sonnet, latest, max).

Triage rule of thumb: security beats difficulty; when unsure between tiers,
escalate. The point is to spend the strongest model's tokens on thinking and
reviewing, not on typing simple code.

---

## Golden rules

1. **Ignore archived/unused dirs — do not read, index, or edit:** `Old/`, `Old2/`, `OLD3/`.
2. **Ignore `FUN/` except `FUN/AQMgame.html`.** That one file is the live, maintained "AQM Network Visualizer." The rest of `FUN/` is out of scope unless explicitly asked.
3. **Keep, but don't use, the telemetry servers** `server.py`, `serverV2.py`, `serverV3.py`. They're dormant Flask analytics apps from Peter's home server (the site no longer sends them data). Retain them; don't delete.
4. **`server.html` ≠ `server*.py`.** `server.html` is a public "Service Access Panel" page; the `.py` files are the unrelated dormant backend.
5. **Keep `llms.txt`.** It's a deliberate public-facing site feature (AI-crawler easter-egg about the owner), not developer documentation — don't remove it during any docs cleanup.
6. **Shared files hit every page.** `styles.css` and `script.js` are loaded site-wide; verify changes across all pages.
7. **Stay on-brand.** Reuse the `:root` CSS variables and existing patterns (liquid-glass, azure-blue, bento, reveal-on-scroll). Support both dark (default) and light themes.
8. **Leave commented-out code commented** unless explicitly told to change it.
9. **No build step.** Don't add bundlers/frameworks/package managers without being asked. Test by opening the HTML or running a simple static server.
10. **Don't invent facts** about Peter (skills, jobs, dates, certs). Use only what's already on the site / in `docs/PROJECT_CONTEXT.md`.

---

## When you add or rename a page/section
Keep these in sync: navbar + mobile-drawer links, the command-palette item list
in `script.js` (`palette` module), and `sitemap.xml`.

---

## Repo at a glance
```
index.html  journey.html  blog.html  fun.html  server.html  404.html   ← pages (root)
styles.css  script.js                                     ← shared, site-wide
Files/                                                     ← CV, images, favicon
FUN/AQMgame.html                                           ← live tool (rest of FUN/: ignore)
sitemap.xml  robots.txt  llms.txt  CNAME                   ← SEO / config
server.py  serverV2.py  serverV3.py                        ← dormant Flask telemetry (keep)
docs/                                                      ← AI context (start here)
Old/  Old2/  OLD3/                                         ← archived (ignore)
```
