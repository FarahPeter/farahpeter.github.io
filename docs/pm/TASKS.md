# TASKS — living task ledger

`PLAN.md` stays *as planned*; this file tracks *reality*. Every status change
gets a dated entry in the per-task log. Escalation count ≥2 auto-reclassifies
the task one tier up (PROCESS.md §5) — record the reclassification here.

Statuses: `todo` → `in-progress` → `done` (or `blocked`, with the blocker
named). Every `done` row names its commit (1:1 task↔commit).

---

## Ledger

| ID | Title | Class | File scope | Acceptance (abbrev.) | Depends on | Status | Files actually touched | Esc. | R-### |
|----|-------|-------|-----------|----------------------|------------|--------|------------------------|------|-------|
| — | *(no tasks yet — first work order pending; rows are created at G1 from PLAN.md's task table)* | | | | | | | | |

---

## Per-task log

One dated entry per status change: what changed, files, verification
performed, commit hash.

### (template)

```
### T-0NN — <title>
- YYYY-MM-DD  todo → in-progress  (dispatched to <agent>, class <H|S|security>)
- YYYY-MM-DD  in-progress → done  (files: …; verification: <exact command + result counts>; commit: <hash>)
```
