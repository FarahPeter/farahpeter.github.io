# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
semantic versioning. On this repo a merge to `main` deploys to production
(GitHub Pages → https://peterfarah.com), so every released version equals a
deployed state.

## [Unreleased]

### Added

- **Re-enabled site analytics capture.** `script.js` gains a `telemetry` module that
  posts `/heartbeat` (on load, every 10 s, on tab-hide and on `pagehide`) and
  `/track-click` to the self-hosted collector at `https://hook.peterfarah.com`
  (`serverV3.py`). The payload matches that app's existing handlers, so the server
  needed no changes. Requests are fire-and-forget with `keepalive` and swallow their
  own errors, and the module is guarded to `*.peterfarah.com` so local development
  never writes to the database. It gives up after 3 consecutive failures, so an
  offline collector costs a visitor 3 console errors rather than 6 per minute.

## [1.0.0] — 2026-07-24

Baseline. The existing live portfolio site as deployed at
https://peterfarah.com — commit `2bd6233`, tagged `v1.0.0`. Pages:
`index.html`, `journey.html`, `blog.html`, `fun.html`, `server.html`,
`404.html`, plus the `FUN/AQMgame.html` visualizer; shared `styles.css` /
`script.js`; SEO files (`sitemap.xml`, `robots.txt`, `llms.txt`, `CNAME`).
