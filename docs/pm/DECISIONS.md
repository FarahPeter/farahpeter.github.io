# DECISIONS — decision log & ADRs

Every choice a future agent might re-litigate goes here — **especially**
owner-delegated calls ("owner said 'you decide'" → record what was decided
under that delegation and that it is reversible until merge). Model
substitutions (PROCESS.md §2) are always recorded here.

---

## Decision log

| ID | Date | Context | Decision | Why | Made by | Reversible? |
|----|------|---------|----------|-----|---------|-------------|
| D-001 | 2026-07-24 | Owner's bootstrap order | Adopted the pb v1 delivery process (gates G0–G5, pinned model tiers, docs/pm workspace, 4 new skills, 5-agent roster). | Owner's standing instruction; makes every future session onboardable from the repo alone. | owner (via bootstrap order) | Yes (delete docs/pm + revert CLAUDE.md) |
| D-002 | 2026-07-24 | Repo already existed; site is live in production | Baseline = `main` @ `2bd6233`, tagged **`v1.0.0`** locally (not pushed). CHANGELOG starts at 1.0.0. | Bootstrap rule: production-deployed code baselines at 1.0.0. Local tag is reversible; pushing tags is the owner's action. | planner (under bootstrap delegation) | Yes (delete local tag) |
| D-003 | 2026-07-24 | Bootstrap pins agent name `implementer` (Sonnet); repo already had `implementer-simple` (Sonnet) with near-identical scope | Renamed `implementer-simple` → **`implementer`** (content updated to pb v1 spec); updated the `planner` skill's references. Kept `implementer-security` (model: inherit ⇒ Fable) as the security-implementation lane. | One S-class agent, pinned name per the model table; two near-duplicate Sonnet implementers would invite mis-dispatch. `implementer-security` at inherit satisfies "security never below Fable tier". | planner (under bootstrap delegation) | Yes (rename back; git history preserves the old file) |
| D-004 | 2026-07-24 | Model-availability check at bootstrap | **No substitutions in force.** Harness exposes `fable`, `opus`, `sonnet` for subagents and `model: inherit` (= Fable session). All pinned tiers resolvable. | Verified against the harness agent-model options on 2026-07-24. Re-check at each round's G0; substitutions go UP only. | planner | n/a (a factual record) |
| D-005 | 2026-07-24 | STATUS.md header needs a size before any work order exists | Bootstrap round classified **S** (docs/agents/skills only — no site code touched). Every real round re-classifies at its own G0. | Size drives QA/review rigor; a docs-only bootstrap has no QA surface. First feature round must not inherit this S. | planner | Yes (superseded at next G0) |
| D-006 | 2026-07-24 | Untracked `server*.py` on a public repo | Left `server.py`/`serverV2.py`/`serverV3.py` **untracked** (kept on disk per golden rule 3); flagged to the owner before any commit of them. | They contain home-server internals; the repo is public. Publishing them is a security decision only the owner can make (STATUS.md open question 2). | planner | Yes (owner may commit them after review) |
| D-007 | 2026-07-24 | `.claude/launch.json` was untracked but PROCESS.md/CLAUDE.md reference its `static-site` config | Committed `.claude/launch.json` with the scaffolding. | Self-containment: a cold session on a fresh clone must find the documented run config. Contents are only `python -m http.server 8873 --bind 127.0.0.1` — nothing sensitive. | planner (under bootstrap delegation) | Yes (untrack it) |
| D-008 | 2026-07-24 | Consistency review found INV-6's `rel="noopener noreferrer"` requirement would false-FAIL the baseline — every existing `target="_blank"` link carries `rel="noopener"` only (verified by sweep) | INV-6 calibrated: floor = at least `rel="noopener"` on every `target="_blank"` link (true at baseline); NEW or edited external links must use `rel="noopener noreferrer"`. Mirrored in tester, security-reviewer, invariant-audit, TESTING.md. | An invariant that fails the untouched production site is miscalibrated; retrofitting `noreferrer` across ~30 existing links is site-code work that needs a work order. | planner | Yes (a future round may retrofit `noreferrer` site-wide and raise the floor) |

---

## ADRs

Architectural decisions get a full entry below the table.

### ADR-001 — Process architecture: gates + pinned model tiers on a static site (2026-07-24)

**Status:** accepted. **Context:** the repo is a no-build static site where a
push to `main` *is* a production deploy; mistakes are public instantly.
**Decision:** all work flows through G0–G5 with size-scaled QA/review; `main`
holds shippable states only; rounds live on `feat/<round-name>`; merges and
pushes are owner actions. Model tiers are pinned in PROCESS.md §2 (Fable =
plan/security/final review; Opus = hard implementation + QA finders +
correctness/security checkers; Sonnet = simple implementation + ALL testing +
QA verifiers + docs checker). **Consequences:** slower than ad-hoc editing,
but every change is verified against the six invariants (PROCESS.md §7)
before it can reach the live domain.
