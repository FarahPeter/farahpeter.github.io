---
name: ship-check
description: The G5 gate — full pre-ship verification of the portfolio site. Run after G4 SHIP and before tagging a release. Tag only when ALL items are green; pushing/merging/deploying is the OWNER's action and is recorded as an open owner action, never performed by an agent.
---

# Ship check — G5 gate

Every item produces evidence (command + result, with counts). One red item
= no tag. Record the outcome as the G5 row in STATUS.md's Gate Ledger.

## 1. Full verification suite

- Run the entire protocol in `docs/pm/TESTING.md` §1 (MP-1 plus any
  automated checks that exist by now). Report **exact counts** (surfaces
  loaded, console errors, checks passed/failed) and update TESTING.md §2.

## 2. Syntax / corruption sweep

- `node --check script.js` — must pass.
- Spot-parse each shipped HTML file loads in the browser without parser
  recovery weirdness (broken layout, stray visible tags).
- NUL-byte / corruption scan over tracked text files, e.g. (Git Bash; the
  `LC_ALL` prefix is required — `grep -P` errors out under the default C
  locale on this machine):
  `LC_ALL=en_US.UTF-8 grep -rlP '\x00' --include='*.html' --include='*.css' --include='*.js' --include='*.md' --include='*.xml' --include='*.txt' . --exclude-dir={Old,Old2,OLD3,.git}`
  — expected: no output.

## 3. Invariant audit — in full

- Run the `invariant-audit` skill end-to-end (all 8 steps). ALL PASS
  required; any FAIL blocks shipping by definition.

## 4. Deploy-safety boot (production-shaped)

GitHub Pages = case-sensitive Linux serving the repo root; production state
includes existing visitors' `localStorage['pf-theme']` and public deep
links.

- Serve the repo root and load all 7 surfaces plus the public deep links
  (`blog.html#aqm-research`, `#home-server`, `#home-nas`).
- **Case-exactness audit**: verify every `href`/`src` in shipped pages
  matches on-disk casing exactly (Windows will happily serve `Profile.jpg`
  for `profile.jpg`; Pages will 404 it).
- Boot with `pf-theme` pre-set to `light` and to `dark` — both work.
- 404 path: confirm `404.html` still stands alone (absolute `/` asset
  paths, since Pages serves it for any bad URL).

## 5. Packaging sanity (this project's "infra")

- `CNAME` contains exactly `peterfarah.com`.
- `robots.txt` and `llms.txt` present and unchanged unless the round
  intended otherwise.
- `sitemap.xml` lists exactly the live pages (cross-checked in the
  invariant audit) with correct absolute URLs.
- No build artifacts, editor dirs, or `server*.py` staged for commit.

## 6. Docs currency

- `CHANGELOG.md`: the release's entry is complete and version-numbered.
- `docs/HANDOFF_NOTES.md`: the round's phase contract exists with exact
  shapes.
- `CLAUDE.md`: status log has the round's line; no stale claims anywhere in
  it (this repo has no README by design — CLAUDE.md + `docs/` are the
  README-equivalent; their install/run/use statements must be accurate).
- `docs/pm/` files current: STATUS header, TASKS ledger fully `done`,
  TESTING suite status dated this round, REVIEW cycle recorded.

## 7. Version & history hygiene

- Version bump in CHANGELOG matches the tag about to be created (semver;
  baseline was `v1.0.0`).
- Working tree clean (`git status --short` empty, or every entry explained
  in the STATUS handoff note).
- **1:1 task↔commit audit**: every `done` T-### in TASKS.md maps to exactly
  one commit naming it, and vice versa for the round's commits (process-doc
  batches exempt).

## 8. Tag and hand to the owner

- All green → create the annotated tag (e.g. `v1.1.0`).
- **Do NOT push, merge to `main`, or deploy.** Record in STATUS.md under
  Blockers & Open Questions: "OWNER ACTION: merge `feat/<round>` to `main`
  and push (deploys to peterfarah.com); push tag `vX.Y.Z`." Then run the
  `handoff` skill.
