---
name: handoff
description: End-of-session ritual for this repo. Run at the end of EVERY working session, the moment context runs low mid-task (even mid-file), and whenever a phase/gate completes. A session that ends without this ritual has failed its handoff regardless of code quality (PROCESS.md §0).
---

# Handoff — end-of-session ritual

Execute in order. The output artifact is an updated `docs/pm/STATUS.md` a
cold, zero-memory session can act on.

1. **Update the STATUS.md header** (`<!-- pb-status v1 -->` block) — every
   field: `size`, `phase`, `gate`, `tasks: done/total`, `updated`,
   `updated_by`, `blocked_on`. `next_action` must be one concrete sentence
   naming the file/step (e.g. "Resume T-004: finish the light-theme rules
   for `.pub-tile` in styles.css, then re-run MP-1 on index.html" — never
   "continue").
2. **Gate Ledger**: add any row decided this session but not yet written —
   including FAILED gates with reasons. A gate decided in conversation but
   absent from the ledger is a process violation; fix it now.
3. **Prepend a dated Handoff Note** to STATUS.md (newest first): what was
   done, where work stopped **mid-file if applicable** (file + location +
   what's half-finished), working-tree state (clean / dirty-and-why), and
   warnings the next session needs.
4. **Sync `docs/pm/TASKS.md`**: ledger rows (status, actual files touched,
   escalation count) + a dated per-task log entry for every status change,
   with verification counts and commit hashes.
5. **Record decisions** made this session in `docs/pm/DECISIONS.md` —
   especially owner-delegated calls and anything a future agent might
   re-litigate.
6. **If a phase/round completed**: append one dated line to CLAUDE.md's
   **Status log** section, and update `docs/HANDOFF_NOTES.md` with the
   phase contract (exact shapes copied from code).
7. **Update `docs/pm/TESTING.md` §2** if any verification ran this session
   (exact counts + date).
8. **Commit** — process docs batched separately from code commits
   (PROCESS.md §6). If the tree must stay dirty, the Handoff Note says
   exactly why and what's uncommitted.

## Known anti-patterns — reject these in your own output

- "tests pass" without exact counts.
- `next_action: continue` (or any sentence a cold agent can't execute).
- A dirty tree with no explanatory note.
- A gate decided in conversation but never written to the ledger.
- A handoff note that describes intentions ("will do X") instead of state
  ("X is half-done at styles.css `.pub-tile`, light theme missing").
