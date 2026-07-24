# HANDOFF NOTES — per-phase implementation contracts

Appended chronologically (oldest first). Each entry is the contract the next
agent builds against: what shipped, files created, **exact interface shapes
copied from code — never paraphrased**, intentional deviations with
rationale, and the verification performed.

"Interface shapes" for this static site means the DOM/CSS/storage contract,
verbatim: element ids, class names, `data-*` attributes, CSS custom
properties, `palette` item entries, localStorage keys — copied from the
source, not described from memory.

---

## Phase 0 — Process bootstrap (2026-07-24)

**What shipped:** the pb v1 delivery process (no site code touched).

**Files created:** `docs/pm/{PROCESS,STATUS,TASKS,DECISIONS,TESTING,REVIEW}.md`,
`docs/HANDOFF_NOTES.md`, `CHANGELOG.md`,
`.claude/agents/{implementer,tester,security-reviewer}.md` (new),
`.claude/agents/{implementer-hard,implementer-security}.md` (updated),
`.claude/skills/{handoff,invariant-audit,adversarial-qa,ship-check}/SKILL.md`
(new), `.claude/skills/planner/SKILL.md` (updated), `CLAUDE.md` (updated).
Removed: `.claude/agents/implementer-simple.md` (renamed to `implementer` —
DECISIONS.md D-003).

**Exact shapes relied on by the process docs (copied from code):**

- Theme storage key: `localStorage['pf-theme']`; light theme selector:
  `[data-theme="light"]`; toggles: `#theme-toggle`, `#drawer-theme`.
- Shared-script contract: `script.js` (475 lines) is one IIFE with 17 inner
  modules: `theme, cursor, network, scrollUI, drawer, reveal, counters,
  typing, activeNav, copyEmail, backTop, blog, palette, spotlight, tilt,
  magnetic, stagger`; canvas id `#net-canvas`. (The last four were missing
  from docs/ARCHITECTURE.md's map until this phase — fixed there too.)
- Static-server run line (mirrors `.claude/launch.json` → `static-site`):
  `python -m http.server 8873 --bind 127.0.0.1`.
- The 7 verification surfaces: `index.html`, `journey.html`, `blog.html`,
  `fun.html`, `server.html`, `404.html`, `FUN/AQMgame.html`.

**Intentional deviations:** none from the bootstrap order. Pre-existing
repo agents were reconciled rather than duplicated (D-003); `server*.py`
left untracked pending owner review (D-006).

**Verification performed:** 5-lens adversarial consistency review of all
created files (cross-doc consistency, agents↔process, skills↔process,
CLAUDE.md, bootstrap-rule fidelity) — 29 findings, each fixed or recorded;
site boot on the static server (7/7 surfaces, 0 console errors);
`node --check script.js` pass. Details: TESTING.md §2.
