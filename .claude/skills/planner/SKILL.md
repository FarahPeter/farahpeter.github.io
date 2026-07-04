---
name: planner
description: Plan-then-delegate workflow for this portfolio repo. Use this skill for ANY code change to the site — new features, edits, refactors, bug fixes, styling, content updates — even small ones, and even if the user doesn't say "plan". The session model (Fable 5 when available) does the planning and review at maximum reasoning effort; implementation is delegated to the cheapest model that can do the job safely via the implementer-security / implementer-hard / implementer-simple agents. Do NOT write implementation code directly in the main session unless the change is a one-line fix.
---

# Planner — plan with Fable, delegate the typing

## Why this exists

The main session runs the strongest reasoning model available (Fable 5 at max
effort). That brilliance is valuable for **planning, triage, and review** — and
wasted on typing out a CSS tweak. This skill keeps the expensive model doing
what only it can do, and hands the keyboard to cheaper models for everything
else.

You (the main session) are the **planner and reviewer**. You do not edit files
yourself, except for trivial one-line fixes where delegation overhead exceeds
the work itself.

## Workflow

### 1. Plan (you, max reasoning)

- Read `docs/PROJECT_CONTEXT.md` and `docs/ARCHITECTURE.md` if you haven't
  this session. Honor every golden rule in `CLAUDE.md`.
- Think hard about the request: what files change, what could break, what the
  cross-page impact is (`styles.css` and `script.js` load on every page).
- Produce a plan: an ordered list of implementation tasks, each small enough
  to hand to one implementer in one shot, with explicit acceptance criteria.

### 2. Triage each task

Classify every task into exactly one tier. **Security beats difficulty; when
unsure between two tiers, escalate.**

| Tier | Agent | Model | Route here when the task touches… |
|------|-------|-------|-----------------------------------|
| **Security** | `implementer-security` | inherit (= Fable 5 MAX when available) | `server.html`, forms or any user input handling, `innerHTML`/`insertAdjacentHTML`, URL/query/hash parsing, external scripts or CDNs, links needing `rel="noopener"`, CSP/headers/meta, secrets/tokens, the dormant `server*.py` telemetry files, anything auth- or privacy-adjacent |
| **Hard** | `implementer-hard` | Opus 4.8 | multi-file changes, `script.js` module additions or refactors, new pages or sections, `journey.html` scroll engine, `FUN/AQMgame.html`, animation/layout systems, theme-token changes in `styles.css`, anything ambiguous or with tricky interactions |
| **Simple** | `implementer-simple` | Sonnet (latest) | single-file, low-risk edits: copy/text changes, small CSS tweaks that don't touch `:root` tokens, adding a link or image, `sitemap.xml`/meta updates, comment/doc edits |

### 3. Delegate

Dispatch each task with the Task tool to the chosen agent. Every delegation
prompt must:

- **Start with the word `ultrathink`** — this forces the implementer to use
  maximum extended thinking ("MAX" effort).
- State the task, the exact files to touch, and files that are **off-limits**
  (always: `Old/`, `Old2/`, `OLD3/`, `FUN/` except `AQMgame.html`).
- Include the relevant constraints from `CLAUDE.md` (both themes, reuse
  `:root` tokens, no build step, don't invent facts about Peter, leave
  commented-out code commented).
- Include acceptance criteria and ask for a summary of changes (files +
  what/why) back.
- If the change adds/renames a page or section, require syncing: navbar +
  mobile drawer links, the `palette` module item list in `script.js`, and
  `sitemap.xml`.

Independent tasks: dispatch in parallel. Dependent tasks: sequence them and
pass forward what the previous implementer reported.

### 4. Review (you, max reasoning)

After each implementer returns:

- Read the diff / changed regions yourself. You are the last line of defense.
- Check: both dark and light themes handled; shared-file changes verified
  against all pages that use them; ARIA/semantics intact; nav/palette/sitemap
  in sync; no golden-rule violations.
- If the work is wrong or incomplete, send it back to the **same agent** with
  specific corrections — don't silently fix it yourself (that re-spends
  expensive tokens on typing). Escalate one tier only after a failed retry.

### 5. Report

Summarize to the user: what changed, which agent/model did each piece, and
anything they should visually verify in a browser.

## Fallbacks

- If Fable 5 is not the session model, you're likely Opus 4.8 — the workflow
  is unchanged (plan/review here, delegate implementation; security tasks
  still inherit the session model).
- If an agent is unavailable, do the task in the main session rather than
  mis-routing it to a weaker tier.

## Example triage

Request: "Add a Publications section to index.html and link it everywhere."

1. Design section markup + where it sits in the bento flow — **planner** (no delegation; that's the plan itself)
2. Implement section HTML + CSS reusing existing tile patterns — **implementer-hard** (new section, shared CSS)
3. Add navbar/drawer links, palette entry, sitemap entry — **implementer-simple** (mechanical, spec'd exactly by the planner)
4. Review diffs, check both themes and mobile drawer — **planner**
