# TESTING — verification & adversarial QA

How this project is verified, the current state of its suite, and the G3
adversarial protocol. Suite status (§2) is updated **at every gate**.

---

## 1. How to run verification (exact commands)

There is no build step and (as of baseline) **no automated test suite** — the
site is verified by serving it and by static checks. From the repo root:

```bash
python -m http.server 8873 --bind 127.0.0.1
```

Then the manual protocol **MP-1** (the "suite" until an automated one exists):

1. Load each of the 7 surfaces at `http://127.0.0.1:8873/`:
   `index.html`, `journey.html`, `blog.html`, `fun.html`, `server.html`,
   `404.html`, `FUN/AQMgame.html`.
2. For each: **zero console errors**, no missing-asset 404s in the network
   log, page renders (hero/nav visible).
3. Toggle the theme (`#theme-toggle`) and re-check dark **and**
   `[data-theme="light"]` on every surface whose styling was touched (all 7
   if `styles.css`/`script.js` changed — INV-4).
4. Syntax check the shared script:

```bash
node --check script.js
```

5. If a page/section was added or renamed: cross-diff navbar links, drawer
   links, the `palette` module item list in `script.js`, and `sitemap.xml`
   (INV-5).

Results are reported as exact counts (e.g. "7/7 surfaces clean, 0 console
errors, node --check pass"), never as "tests pass".

---

## 2. Current suite status

| Date | Automated tests | Manual protocol | Notes |
|------|-----------------|-----------------|-------|
| 2026-07-24 (baseline) | **0 automated tests exist** | MP-1: 7/7 surfaces load on the static server, 0 console errors on the bootstrap boot-check; `node --check script.js`: pass | Pre-existing gap, not a regression: the deployed site 404s `Files/images/favicon.ico` (file untracked — STATUS.md open question 1). First M/L round should decide at G1 whether to add a small Node-based checker (link/asset/case + INV-2/INV-5 negative greps) — that decision belongs to PLAN.md, not here. |

**Coverage notes:** no automated negative tests exist yet for the invariants
(PROCESS.md §7). Until they do, the `invariant-audit` skill's grep/serve
sweeps ARE the negative checks and must be run at G3/G5. Once any automated
suite exists, each invariant needs an explicit negative assertion in it — a
missing one is a FAIL under `invariant-audit`.

---

## 3. Adversarial QA protocol (G3)

> Every adversary finding MUST include exact reproduction steps. Findings are
> deduplicated, then each is verified by 3 independent verifiers who receive
> ONLY the repro steps — never the adversary's severity claim or reasoning
> (anti-anchoring). A finding is CONFIRMED if ≥2 of 3 verifiers reproduce it.
> Adversary count scales with size (M:3, L:5), each with a distinct facet:
> edge inputs, error handling/resources, config/integration,
> security/zero-visitor-telemetry (INV-2, this project's #1 invariant),
> concurrency. Loop until a round yields zero new confirmed findings or 2
> rounds, whichever first. Every confirmed finding is either fixed WITH a
> reproduce-then-pass regression test, or explicitly waived by the user
> (recorded in the Waived Findings table here and in DECISIONS.md).

Facets, adapted to this project. Assignment by size — **M (3 adversaries):
facets 1, 3, 4** (the security facet is never dropped); **L (5
adversaries): all five**:

1. **Edge inputs** — URL hashes/queries (`blog.html#…`, palette search),
   viewport extremes, keyboard-only use, `prefers-reduced-motion`, JS off.
2. **Error handling / resources** (L) — missing elements per page (every
   `script.js` module runs on every page), rAF/observer leaks, canvas on
   hidden tabs, localStorage unavailable.
3. **Config / integration** — nav↔drawer↔palette↔sitemap sync (INV-5),
   meta/OG/JSON-LD correctness, GitHub Pages case-sensitive paths, CNAME /
   robots.txt / llms.txt intact.
4. **Security / zero-telemetry** — INV-2 and INV-6: outbound calls, external
   scripts, secrets, `innerHTML` sinks, `target="_blank"` links missing at
   least `rel="noopener"` (new/edited links need `noopener noreferrer`),
   `server.html` stays a dumb link panel.
5. **Concurrency** (L) — theme-toggle races, scroll handler re-entrancy,
   double-bound listeners, IntersectionObserver vs. DOM mutation timing.

Model pins: adversaries/finders = **Opus**; verifiers = **Sonnet** ×3 per
finding; fixes implemented at the task's class tier (Opus for H, Sonnet for
S, Fable tier for security), each verified by the **tester** (Sonnet) with a
reproduce-then-pass regression check. Executable recipe: the
`adversarial-qa` skill. Results of every round are recorded below.

---

## 4. QA round records

*(none yet — first work order pending)*

---

## 5. Waived Findings

Confirmed findings the owner explicitly chose not to fix. Mirror each row in
DECISIONS.md.

| ID | Date | Finding (1 line) | Repro pointer | Waived by | Why |
|----|------|------------------|---------------|-----------|-----|
| — | | | | | |
