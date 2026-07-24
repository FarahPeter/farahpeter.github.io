# CLAUDE.md — instructions for AI assistants working on this repo

**Project:** `farahpeter.github.io` — Peter Farah's personal portfolio. A
**static** site (plain HTML + CSS + vanilla JS) deployed on **GitHub Pages** at
**https://peterfarah.com**. No framework, no build step: edit a file, push to the
default branch, it's live.

> **FIRST: read `docs/pm/STATUS.md`** — current phase, gate, and the one
> concrete next action. Every session starts there and ends by updating it
> (the `handoff` skill). All work runs under the delivery process in
> **`docs/pm/PROCESS.md`** (gates G0–G5, size classes, pinned model tiers,
> project invariants). Ledgers: `docs/pm/TASKS.md`, `docs/pm/DECISIONS.md`,
> `docs/pm/TESTING.md`, `docs/pm/REVIEW.md`. Per-phase implementation
> contracts: `docs/HANDOFF_NOTES.md`. Releases: `CHANGELOG.md`.

**Read these before doing real work:**
- `docs/PROJECT_CONTEXT.md` — what the project is, who it's for, the owner's factual bio, the design language, deployment, and what to ignore.
- `docs/ARCHITECTURE.md` — file-by-file index, the `script.js` module map, the `styles.css` structure, and coding conventions.

---

## Model roles (pinned — full table in `docs/pm/PROCESS.md` §2)

Routing is implemented by the **`planner` skill** (`.claude/skills/planner/`)
plus five subagents (`.claude/agents/`). Use the planner skill for any code
change; it plans in the main session and delegates. **"max" = maximum
reasoning / thinking effort** (delegation prompts start with `ultrathink`).

| Role | Model | Where |
|------|-------|-------|
| Orchestrator / planning / plan synthesis / ALL security-critical code / final-review lead / escalation endpoint | **Fable** (Claude Fable 5) | main session (never delegated downward) |
| Plan-panel drafters (G1, M/L rounds) | **Fable** | 2–3 subagents (Opus only if Fable subagents unavailable) |
| H-class implementation | **Opus** | `implementer-hard` |
| S-class implementation | **Sonnet** | `implementer` |
| ALL testing — regardless of who wrote the code | **Sonnet** | `tester` |
| Security implementation | **Fable tier** | orchestrator or `implementer-security` (`model: inherit`) |
| Security review of any kind | **Fable** (Opus only if Fable can't be spawned) | `security-reviewer` (`model: inherit`, read-only) |
| QA adversaries / finders (G3) | **Opus** | via `adversarial-qa` skill |
| QA verifiers (G3, anti-anchored ×3) | **Sonnet** | via `adversarial-qa` skill |
| Review checkers — correctness, security / docs-completeness (G4) | **Opus** / **Sonnet** | via `docs/pm/REVIEW.md` panel |

**Escalation chain — strictly upward: Sonnet → Opus → Fable** (only Opus
escalates to Fable; the sole tier-skip is a CONFIRMED security issue, which
goes straight to Fable). Model substitutions go UP, never down, and are
recorded in `docs/pm/DECISIONS.md`. Triage rule of thumb: security beats
difficulty; when unsure between tiers, escalate. The point is to spend the
strongest model's tokens on thinking and reviewing, not on typing simple
code.

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
docs/pm/                                                   ← delivery process: STATUS, PROCESS, ledgers
Old/  Old2/  OLD3/                                         ← archived (ignore)
```

## Running it

No build step. From the repo root: `python -m http.server 8873 --bind
127.0.0.1` → http://127.0.0.1:8873/ (mirrors `.claude/launch.json`'s
`static-site` config). JS syntax check: `node --check script.js`. Full
verification protocol: `docs/pm/TESTING.md`. A merge to `main` deploys to
production (GitHub Pages) — merging/pushing is always the owner's call.

---

## Status log

One dated line per completed phase/round, appended forever (via the
`handoff` skill).

- 2026-07-24 — Phase 0 / G0 (R0 bootstrap): pb v1 delivery process installed
  (`docs/pm/`, 5 agents, 4 new skills, CHANGELOG, HANDOFF_NOTES); baseline
  `v1.0.0` @ `2bd6233`. Awaiting the owner's first work order.
