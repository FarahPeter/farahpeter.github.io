---
name: adversarial-qa
description: The G3 gate as an executable recipe — Opus adversaries hunt for real bugs, anti-anchored Sonnet verifier triads confirm findings, fixes land with regression checks. Run at G3 for every M or L round (M: 3 adversaries, L: 5). S rounds skip G3 adversaries by definition (PROCESS.md §4).
---

# Adversarial QA — G3 recipe

Protocol authority: `docs/pm/TESTING.md` §3 (the verbatim rule). This file
is the how-to. Record everything in TESTING.md §4 as you go. Spawn agents
via the harness subagent mechanism (Agent tool, or a Workflow for the
fan-out) with the models pinned below — pinned means pinned.

## Round structure

1. **Spawn N finder agents — model: Opus** (M: 3, L: 5), in parallel, each
   with ONE facet from TESTING.md §3 — **M rounds use facets 1, 3, 4 (edge
   inputs; config/integration; security/zero-telemetry — the security facet
   is never dropped); L rounds use all five** (adding error
   handling/resources and concurrency). Each finder prompt: the round's
   diff/scope, its single
   facet, the project invariants, and the requirement that **every finding
   include exact reproduction steps** (page, viewport, theme, exact
   actions, observed vs expected). Findings without repro steps are
   discarded, not fixed.
2. **Dedupe** (orchestrator, plain reasoning — same root cause = one
   finding). Track dedupe against ALL findings seen in prior rounds, not
   just confirmed ones, so rejected findings don't resurface.
3. **Verify — for each deduped finding spawn 3 verifiers, model: Sonnet**,
   in parallel. Each verifier receives **ONLY the repro steps** — never the
   finder's severity claim, reasoning, or identity (anti-anchoring). Each
   returns REPRODUCED / NOT-REPRODUCED with its own transcript.
4. **Confirm at ≥2/3.** Below that, the finding dies (log it in TESTING.md
   §4 as not-confirmed).
5. **Fix or waive every CONFIRMED finding:**
   - Fix at the underlying task's class tier: H-class → `implementer-hard`
     (Opus); S-class → `implementer` (Sonnet); anything
     security-dimensioned → Fable tier (orchestrator or
     `implementer-security`). A CONFIRMED security finding also escalates
     straight to the orchestrator immediately — the one tier-skip allowed.
   - Every fix gets a **reproduce-then-pass regression check verified by
     the `tester` (Sonnet)**: failure shown pre-fix, pass shown post-fix,
     recorded in TESTING.md.
   - OR the finding is presented to the owner for waiver → recorded in
     TESTING.md §5 **and** DECISIONS.md.
6. **Loop**: run another full round after fixes. Stop when a round yields
   zero new confirmed findings, or after 2 rounds — whichever comes first.

## Recording (TESTING.md §4, per round)

Round number/date; findings table (finding, facet, repro pointer, verifier
votes k/3, CONFIRMED?, resolution: fixed@commit / waived@D-### /
not-confirmed); the loop-termination reason; updated suite-status line in
TESTING.md §2.

## Guardrails

- Verifier prompts must be checked before dispatch: if a repro step leaks
  the severity/reasoning, rewrite it.
- Finders and verifiers never edit files; fixes go through implementers
  (1:1 task↔commit per PROCESS.md §6).
- G3 exit criterion: zero unaddressed CONFIRMED findings — "addressed" =
  fixed-with-regression-check or owner-waived. Record the G3 row in
  STATUS.md's Gate Ledger the moment it's decided.
