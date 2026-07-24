---
name: invariant-audit
description: Step-by-step audit proving the six project invariants (PROCESS.md §7) still hold. Run after any change to the surfaces they protect (styles.css, script.js, any page, links, sitemap/nav/palette, anything input- or telemetry-adjacent) and ALWAYS before ship (G5). Any FAIL blocks shipping.
---

# Invariant audit

Execute every step; output per-step **PASS/FAIL with file:line evidence**.
Any FAIL blocks shipping — no exceptions, no severity haggling here (that
happens at the gate with the owner). Scope note: "shipped pages" = root
`*.html`, `script.js`, `styles.css`, `FUN/AQMgame.html`. `Old/`, `Old2/`,
`OLD3/` and the rest of `FUN/` are out of audit scope.

## Step 1 — INV-1: static, build-free delivery

- Glob the repo root for build tooling: `package.json`, `node_modules/`,
  `webpack.*`, `vite.*`, `tsconfig.*`, `Gemfile`, `requirements.txt` at
  root. Expected: none exist.
- Serve (`python -m http.server 8873 --bind 127.0.0.1`) and load all 7
  surfaces (`index`, `journey`, `blog`, `fun`, `server`, `404`,
  `FUN/AQMgame.html`): every page renders with no missing-asset 404s.

## Step 2 — INV-2: zero visitor telemetry

- Grep shipped pages for outbound-data APIs:
  `fetch\(|XMLHttpRequest|sendBeacon|WebSocket|navigator\.send` — expected:
  **zero matches** (true at baseline 2026-07-24).
- Grep for external scripts: `<script[^>]*src=` — expected: only the local
  `script.js` (relative path, or the by-design root-absolute `/script.js`
  on `404.html`, which GitHub Pages serves at arbitrary URLs).
- Grep for `@import` / `<link rel="stylesheet"` / `<link rel="preconnect"`
  external URLs — expected: Google Fonts hosts only
  (`fonts.googleapis.com` / `fonts.gstatic.com`): the `@import` in
  `styles.css`, the font `<link>` in `FUN/AQMgame.html`, preconnects in
  page heads.
- Confirm no `server*.py` endpoint URLs (heartbeat paths) appear in any
  shipped page or `script.js`.

## Step 3 — INV-3: factual integrity

- Diff review: list every factual claim about Peter added/changed in the
  round's diff; trace each to `docs/PROJECT_CONTEXT.md` §3 or existing site
  text. An untraceable claim is a FAIL at that file:line.

## Step 4 — INV-4: shared-file safety

- If `styles.css` or `script.js` changed this round: load all 7 surfaces in
  dark, toggle to light (`#theme-toggle`), re-check. Zero new console
  errors, layout intact. If neither shared file changed: check only the
  touched pages, both themes, and record that scoping.

## Step 5 — INV-5: navigation coherence

- Extract four lists and cross-diff: navbar links (each page's `<nav>`),
  mobile-drawer links, the `palette` module's item array in `script.js`,
  and `sitemap.xml` URLs. Expected: same page/section set (palette may add
  external links and in-page sections; those must still resolve).

## Step 6 — INV-6: public-repo security posture

- Grep `innerHTML|insertAdjacentHTML|document\.write|eval\(` in `script.js`
  + inline page scripts; for each hit, trace the source — any URL/hash/
  query/user-text reaching a sink is FAIL.
- Grep `target="_blank"` and verify each carries at least `rel="noopener"`
  (baseline floor, INV-6); any link ADDED or edited this round must carry
  `rel="noopener noreferrer"`.
- Secret sweep: grep for `api[_-]?key|token|secret|password|Bearer` across
  tracked files; verify nothing staged/committed includes `server*.py` or
  other home-server internals (DECISIONS.md D-006).
- Read `server.html`: still a dumb link panel — no credentials, no embedded
  logic.

## Step 7 — new-surface check

- List every NEW surface in the round's diff (new page, new module, new
  input, new link target, new asset) and state explicitly which invariant
  steps above covered it. An uncovered new surface is a FAIL.

## Step 8 — negative-test presence

- If an automated suite exists (see TESTING.md §2): verify it contains an
  explicit negative assertion per invariant — a missing one is itself a
  FAIL. While no automated suite exists, this audit's steps 1–7 ARE the
  negative checks: verify this run is recorded in TESTING.md §2 with date
  and counts.

## Output format

| Step | Invariant | PASS/FAIL | Evidence (file:line / command + result) |

…followed by a one-line verdict: ALL PASS (ship-eligible) or the FAIL list
(shipping blocked).
