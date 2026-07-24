# Delivery Process — `farahpeter.github.io` (pb v1)

The complete, self-contained procedure for AI-driven work on this repo. A cold
session with zero memory must be able to onboard from this file plus the files
it points to. The project itself: a **static** portfolio site (plain HTML + CSS
+ vanilla JS, no build step) deployed on **GitHub Pages** at
https://peterfarah.com — see `docs/PROJECT_CONTEXT.md` and
`docs/ARCHITECTURE.md`.

---

## 0. The one unbendable rule

**Every session starts by reading `docs/pm/STATUS.md` and ends by updating it**
(header fields + a dated handoff note). A session that ran out of context
mid-task and did not update STATUS.md has **failed its handoff regardless of
code quality**. The end-of-session ritual is codified in the `handoff` skill
(`.claude/skills/handoff/SKILL.md`) — run it, don't improvise it.

---

## 1. Workspace map

| File | Role |
|------|------|
| `docs/pm/PROCESS.md` | This file — the procedure. |
| `docs/pm/STATUS.md` | Machine-readable header + Gate Ledger + handoff notes + blockers. **Read first, update last.** |
| `docs/pm/PLAN.md` | Per-round plan (goals, non-goals, R-### requirements, T-### task table). Created at G1; stays *as planned*. |
| `docs/pm/TASKS.md` | Living task ledger — tracks *reality* (status, escalations, actual files, commits). |
| `docs/pm/DECISIONS.md` | Decision log (D-###) + ADRs. Anything a future agent might re-litigate. |
| `docs/pm/TESTING.md` | How to run verification, current suite status, adversarial QA protocol, waived findings. |
| `docs/pm/REVIEW.md` | Final-review records (G4 panel cycles). |
| `docs/HANDOFF_NOTES.md` | Per-phase implementation contracts — what shipped, exact interface shapes copied from code. |
| `CHANGELOG.md` | Keep-a-Changelog format, versioned releases. |
| `.claude/agents/` | `implementer`, `implementer-hard`, `implementer-security`, `tester`, `security-reviewer`. |
| `.claude/skills/` | `planner` (orchestration entry), `handoff`, `invariant-audit`, `adversarial-qa`, `ship-check`. |

---

## 2. Model assignments — PINNED

| Role | Model | Notes |
|------|-------|-------|
| Orchestrator / planner | **Fable** (Claude Fable 5) | Runs the session. Plan synthesis, ALL security-critical code, final-review lead, escalation endpoint. Never delegated downward. |
| Plan-panel drafters (G1, M/L rounds) | **Fable** | 2–3 independent drafters; fall back to Opus only if Fable subagents are unavailable. |
| H-class implementation (`implementer-hard`) | **Opus** (latest Claude Opus) | Schema, auth-adjacent, concurrency, cross-cutting work. |
| S-class implementation (`implementer`) | **Sonnet** (latest Claude Sonnet) | CRUD, wiring, styling, docs. |
| ALL testing (`tester`) | **Sonnet** | Writing tests, running suites, verifying claims — regardless of who wrote the code under test. |
| QA adversaries / finders (G3) | **Opus** | Finding real bugs needs the stronger tier. |
| QA verifiers (G3, anti-anchored ×3) | **Sonnet** | They only reproduce repro steps; fast tier is correct here. |
| Review lead (G4) | **Fable** (max effort) | FIX verdict is an absolute veto. |
| Review checkers: correctness, security | **Opus** | |
| Review checker: docs-completeness | **Sonnet** | |
| Security review of any kind | **Fable** (or Opus if Fable can't be spawned) | Security is never Sonnet's. |

**Mapping to this repo's harness** (verified available 2026-07-24: `fable`,
`opus`, `sonnet` all exist as agent models; `model: inherit` in agent
frontmatter = the session model = Fable):

- Orchestration entry point: the **`planner` skill** in the main (Fable)
  session. Delegation prompts start with `ultrathink` (forces max reasoning).
- S-class → `implementer` (`model: sonnet`).
- H-class → `implementer-hard` (`model: opus`).
- Security-critical **implementation** stays at Fable tier: written by the
  orchestrator directly or via `implementer-security` (`model: inherit` ⇒
  Fable). This satisfies "never delegated downward" — inherit is not a
  downgrade.
- ALL testing → `tester` (`model: sonnet`).
- Security **review** → `security-reviewer` (`model: inherit` ⇒ Fable;
  read-only).

**Escalation chain — strictly upward: Sonnet → Opus → Fable.** A Sonnet agent
escalates to Opus; only Opus escalates to Fable; nothing skips a tier — with
one exception: a CONFIRMED security issue goes straight to Fable.

**Subagents never talk to each other.** A blocked agent returns an
`=== ESCALATION ===` block containing: (1) what blocked it, (2) what it tried,
(3) the smallest decision needed to unblock. The orchestrator decides or
re-dispatches. Agents never guess their way past a blocker.

**Substitutions go UP, never down.** If a pinned model is unavailable in the
harness, substitute the nearest STRONGER available model and record the
substitution in `DECISIONS.md`. Silent downgrades are forbidden. The two
Opus fallbacks named in the table (plan drafters, security review) exist
only because nothing sits above Fable to substitute upward to; exercising
either one IS a substitution and must be recorded in `DECISIONS.md` — never
used silently. (No substitutions are currently in force — see D-004.)

---

## 3. Lifecycle gates

Every round of work passes G0→G5 in order. **Each gate's verdict is recorded
in STATUS.md's Gate Ledger the moment it is decided — including FAILED gates
with reasons. Never skip a row; never leave a decided gate unrecorded.**

| Gate | Name | Exit criteria |
|------|------|---------------|
| **G0** | Intake | Baseline captured (branch/commit/tag), size classified (S/M/L, with reasoning), brief recorded. Feature branch `feat/<round-name>` created for the round (exception: docs-only process rounds may batch directly on `main` per §6, recorded in the ledger row). |
| **G1** | Plan | `PLAN.md` exists with goals, non-goals, numbered R-### requirements, T-### task table (class, scope, acceptance criteria, dependencies). Approved by the owner, **or** a recorded delegation decision in DECISIONS.md ("owner said 'you decide'"). M/L plans are drafted by 2–3 independent **Fable** drafter agents from different angles (visitor/content value; design-language & UX fit; production-readiness for a public GitHub Pages site) and synthesized by the orchestrator. |
| **G2** | Build | All tasks done — each with verification + docs + **its own commit**; the full verification suite in TESTING.md is green (exact counts recorded). |
| **G3** | QA | Adversarial rounds per TESTING.md protocol completed at the size's adversary count; **zero unaddressed CONFIRMED findings** (each fixed with a reproduce-then-pass regression check, or waived by the owner in writing). |
| **G4** | Review | Review panel per REVIEW.md (lead + checkers per size); docs audit clean. SHIP verdict per the decision rule. |
| **G5** | Ship | Version bumped; CHANGELOG / HANDOFF_NOTES / README-equivalent (CLAUDE.md + docs/) current; `ship-check` skill fully green; release tagged. **Pushing/merging to `main` and deploying is the OWNER's action** — recorded as an open owner action, never performed unilaterally. |

---

## 4. Size classes

Declared at G0 per round; drives rigor. When in doubt between two sizes, pick
the larger.

| | **S** | **M** | **L** |
|---|---|---|---|
| Typical scope here | Copy/text edits, single-page CSS tweak, swap an image/CV link, sitemap/meta fix. ≤2 files, no `:root` token or `script.js` module changes, no security surface. | Multi-file change, **any** edit to shared `styles.css`/`script.js`, a new section on an existing page, blog write-up changes, `fun.html` card grid work. | New page, nav/drawer/palette/sitemap change set, `journey.html` scroll engine, `FUN/AQMgame.html` overhaul, theme-token redesign, anything heavy on security surfaces (`server.html`, input handling). |
| R-### requirements | Optional | **Mandatory** | **Mandatory** |
| QA adversaries (G3) | 0 | 3 | 5 |
| Review panel (G4) | Orchestrator self-review | Lead (Fable) + 2 checkers (correctness: Opus; security: Opus) | Lead (Fable) + 3 checkers (correctness: Opus; security: Opus; docs-completeness: Sonnet) + full R↔T traceability audit |

---

## 5. Task classes

| Class | Meaning here | Implemented by |
|-------|--------------|----------------|
| **H** (hard) | `script.js` module additions/refactors, `journey.html` scroll engine, `AQMgame.html`, animation/layout systems, theme-token changes, cross-cutting or multi-file design work, anything with tricky async/observer/rAF interactions. | `implementer-hard` (Opus) |
| **S** (simple) | Copy edits, single-page CSS tweaks, links/images, sitemap/meta, mechanical changes fully specified by the planner. | `implementer` (Sonnet) |
| **Security override** (not a class — a routing override) | Anything touching `server.html`, user input, `innerHTML`, URL/hash/query parsing, external scripts/links, headers/CSP/meta, secrets, `server*.py`. | Fable tier: orchestrator or `implementer-security` (inherit) |

Rules:
- Class is assigned at G1 and **re-verified at dispatch time** by the
  orchestrator (the code may have changed since planning).
- **Two escalations on one task auto-reclassify it one tier up** (S→H, H→
  orchestrator-owned), recorded in TASKS.md with the reason.
- Security beats difficulty; when unsure between tiers, escalate.

---

## 6. Commit conventions

- **1:1 task↔commit**: each T-### lands as exactly one commit; the commit
  message names its T-### id (e.g. `T-003: add publications tile to index`).
- **Forward-fixes only.** Never rewrite history to hide a mistake — commit the
  fix and record what happened (TASKS.md log / DECISIONS.md).
- **Process docs batch separately** from code commits.
- **`main` holds shippable states only.** Rounds live on `feat/<round-name>`;
  merging to `main` is always the owner's call. (A push to the default branch
  IS a production deploy on GitHub Pages — treat it accordingly.)
- The orchestrator commits per task rather than letting parallel agents race
  the git index.

---

## 7. Project invariants — THE MOST IMPORTANT SECTION

These are the things that, if broken, make the site wrong even when every
check passes. Each is a testable rule; the `invariant-audit` skill executes
the tests. **Any violation blocks shipping.**

- **INV-1 — Static, build-free delivery.** Every page renders from the repo
  root as plain static files (`python -m http.server`). No package.json,
  bundler, framework, transpiler, or server-side dependency ever enters the
  repo. *Test:* no build tooling exists at root; all pages load from a plain
  static server with no missing-asset 404s.
- **INV-2 — Zero visitor telemetry.** The site sends no visitor data
  anywhere: no `fetch`/`XMLHttpRequest`/`sendBeacon`/`WebSocket` calls, no
  analytics snippets, no third-party `<script src>`, and no re-activation of
  the dormant `server*.py` heartbeats. The only external requests from
  shipped pages are Google Fonts loads — the CSS `@import` in `styles.css`,
  the font-stylesheet `<link>` in `FUN/AQMgame.html`, and the
  `fonts.googleapis.com`/`fonts.gstatic.com` preconnect hints in page heads.
  *Test:* grep of all shipped HTML/JS (root pages, `script.js`,
  `FUN/AQMgame.html`) for those APIs and for non-Google-Fonts external
  resources returns nothing (verified true at baseline 2026-07-24).
- **INV-3 — Factual integrity.** No claim about Peter (roles, employers,
  dates, skills, certs, metrics) appears unless it already exists on the site
  or in `docs/PROJECT_CONTEXT.md` §3. *Test:* every factual line in a diff
  traces to an existing in-repo source.
- **INV-4 — Shared-file safety.** Any change to `styles.css` or `script.js`
  is verified on all seven surfaces (`index`, `journey`, `blog`, `fun`,
  `server`, `404`, `FUN/AQMgame.html`) in **both** dark (default) and
  `[data-theme="light"]` themes, with zero new console errors. *Test:*
  per-page smoke pass in both themes.
- **INV-5 — Navigation coherence.** The navbar links, mobile-drawer links,
  the `palette` module's item list in `script.js`, and `sitemap.xml` always
  describe the same set of pages/sections. *Test:* extract and cross-diff the
  four lists after any page/section change.
- **INV-6 — Public-repo security posture.** The repo is public and the site
  is static: no secrets/tokens/credentials or unpublished personal data ever
  enter the repo; every `target="_blank"` link carries at least
  `rel="noopener"` (the baseline floor, verified true 2026-07-24 — new or
  edited external links use the stronger `rel="noopener noreferrer"`); no
  untrusted input (URL hash/query, user text) reaches
  `innerHTML`/`insertAdjacentHTML`/`eval`; `server.html` stays a dumb link
  panel with no credentials or embedded logic. *Test:* grep sweep + trace per
  the `invariant-audit` skill.

Adjacent standing rules (owner's golden rules, enforced alongside the
invariants): keep `llms.txt`; keep `server*.py` dormant and untouched; never
read/edit `Old/`, `Old2/`, `OLD3/`, or `FUN/` beyond `AQMgame.html`; leave
commented-out code commented.

---

## 8. Operating rules

1. **Never skip a gate; never leave a decided gate unrecorded** (FAILED rows
   included).
2. **M/L plan drafting** uses 2–3 independent **Fable** drafters (distinct
   angles: visitor/content value; design-language & UX fit;
   production-readiness) synthesized by the orchestrator. Owner-delegated
   feature selections are logged in DECISIONS.md and stay reversible until
   merge.
3. **Parallel agents never share a file.** When tasks collide on a file,
   serialize them or split the file first. The orchestrator commits per task
   (1:1) rather than letting parallel agents race the git index.
4. **Trust but verify.** The orchestrator spot-verifies every agent's claims
   (re-run the checks, reread the diff, re-count the palette entries) before
   marking a task done.
5. **When context runs low mid-task: run the `handoff` skill IMMEDIATELY,**
   even mid-file.
6. Deviations from a plan are recorded (HANDOFF_NOTES intentional-deviations
   section), never silently absorbed.

---

## 9. Running the project (quick reference)

No build step. From the repo root:

```bash
python -m http.server 8873 --bind 127.0.0.1
```

…then open `http://127.0.0.1:8873/` (matches `.claude/launch.json`'s
`static-site` configuration, usable via the preview/browser tooling). Syntax
check for the shared script: `node --check script.js` (Node and Python are
both available on the dev machine). Full verification protocol: see
`docs/pm/TESTING.md`.
