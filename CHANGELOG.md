# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
semantic versioning. On this repo a merge to `main` deploys to production
(GitHub Pages → https://peterfarah.com), so every released version equals a
deployed state.

## [Unreleased]

### Added
- pb v1 AI delivery process: `docs/pm/` workspace (PROCESS, STATUS, TASKS,
  DECISIONS, TESTING, REVIEW), `docs/HANDOFF_NOTES.md`, project agents
  (`implementer`, `implementer-hard`, `implementer-security`, `tester`,
  `security-reviewer`) and skills (`handoff`, `invariant-audit`,
  `adversarial-qa`, `ship-check`), CLAUDE.md integration. Process-only — no
  site content or behavior changed.

## [1.0.0] — 2026-07-24

Baseline. The existing live portfolio site as deployed at
https://peterfarah.com — commit `2bd6233`, tagged `v1.0.0`. Pages:
`index.html`, `journey.html`, `blog.html`, `fun.html`, `server.html`,
`404.html`, plus the `FUN/AQMgame.html` visualizer; shared `styles.css` /
`script.js`; SEO files (`sitemap.xml`, `robots.txt`, `llms.txt`, `CNAME`).
