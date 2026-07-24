# REVIEW — final-review records (G4)

## Decision rule

> Lead reviewer (**Fable**, max effort) + N checkers with distinct lenses and
> pinned models (correctness: **Opus**; security/zero-visitor-telemetry &
> public-repo posture (INV-2/INV-6): **Opus**; docs-completeness: **Sonnet**).
> SHIP requires lead SHIP AND a majority of checkers PASS; a lead FIX is an
> absolute veto. Run a docs audit BEFORE the panel (README-equivalent
> (CLAUDE.md + docs/) install/run/use accuracy, docs/pm currency, staleness
> sweep, R↔T traceability for L). Record every cycle: scope commit, lead
> verdict table, checker table, decision arithmetic, fixes applied, post-fix
> verification. Cycles repeat until SHIP.

Panel width by size (PROCESS.md §4): S = orchestrator self-review (recorded
here in one paragraph); M = lead + correctness + security checkers; L = lead
+ correctness + security + docs-completeness checkers + full R↔T
traceability audit.

---

## Cycle record template

```
## Round <name> — Cycle <n> (YYYY-MM-DD)

- Scope commit: <hash> (diff vs <baseline hash>)
- Docs audit (pre-panel): PASS/FAIL — <notes>

| Reviewer | Model | Lens | Verdict | Key findings |
|----------|-------|------|---------|--------------|
| Lead | Fable (max) | whole-change | SHIP / FIX | … |
| Checker 1 | Opus | correctness | PASS / FAIL | … |
| Checker 2 | Opus | security (INV-2/INV-6) | PASS / FAIL | … |
| Checker 3 (L only) | Sonnet | docs-completeness | PASS / FAIL | … |

- Decision arithmetic: lead=<verdict>, checkers <k>/<n> PASS → <SHIP | FIX>
- Fixes applied: <T-### / commit list, or none>
- Post-fix verification: <exact commands + counts>
```

---

## Cycles

*(none yet — first work order pending)*
