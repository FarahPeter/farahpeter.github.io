# Instructions for AI contributors

Applies to the entire repository. Read this file before editing, then use
`CLAUDE.md`, `docs/PROJECT_CONTEXT.md` and `docs/ARCHITECTURE.md` for context.

## Owner requirement: keep full motion enabled

Peter explicitly requires the animated portfolio experience to remain enabled.
**Never introduce or re-enable a reduced-motion, low-motion or automatic static
mode unless Peter explicitly requests a change to this requirement.** This
applies to every page, shared asset, inline script and stylesheet.

- Do not use `prefers-reduced-motion` (including `no-preference`) to gate
  animations, transitions, smooth scrolling or the Journey engine.
- Do not suppress motion based on save-data, memory, CPU/core count, battery,
  power-saving settings, device classification or inactivity while reading.
- Preserve the animated background, aurora, reveals, counters, typing, pointer
  effects on compatible pointers, and Journey's pinned scenes and photo reels.
- Do not add a motion toggle, persist a low-motion setting, or replace the
  experience with a still frame as a generic accessibility/performance cleanup.
- Keep legitimate fallbacks: no JavaScript, missing browser APIs/canvas, engine
  failure and print. Hidden tabs and off-screen scenes may pause work provided
  their animations resume when visible. A faded-out mouse trail may stop until
  the next pointer movement.

This requirement supersedes earlier audit recommendations about reduced
motion, idle pauses or low-end devices. Those historical recommendations are
not permission to restore them. Accessibility improvements must preserve this
explicit owner decision.

## Regression checks

The `Portfolio regression checks` workflow runs `tests/*.test.cjs` on pull
requests and pushes. Its motion coverage exercises OS reduced-motion settings,
save-data, small hardware profiles, inactivity, tab visibility and Journey
initialization. It also scans live source for motion-preference gates.

Run the documented checks when changing animation behavior. Fix failures;
do not weaken, skip or remove motion checks to make a change pass. Only an
explicit new owner request can authorize changing the motion policy.

```sh
npm install --prefix /tmp/portfolio-checks --no-audit --no-fund jsdom@26.1.0 postcss@8.5.6
NODE_PATH=/tmp/portfolio-checks/node_modules node --test tests/*.test.cjs
node --check script.js
```

## Project boundaries

- Plain HTML, CSS and vanilla JavaScript; no runtime dependencies or build step.
- Preserve keyboard navigation, focus handling, semantic HTML and both themes.
- Ignore `Old/`, `Old2/`, `OLD3/` and `FUN/` except `FUN/AQMgame.html` unless asked.
- Preserve local-only, gitignored telemetry servers; never publish them.
- Prepare changes on a branch and open a PR. The owner decides when to merge;
  merging to `main` deploys the site.
