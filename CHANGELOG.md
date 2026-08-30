# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
semantic versioning. On this repo a merge to `main` deploys to production
(GitHub Pages → https://peterfarah.com), so every released version equals a
deployed state.

## [Unreleased]

### Added

- **Live service status on `server.html`.** Each entry in the Service Access Panel now
  carries a status dot and the round-trip time measured from the visitor's own browser,
  with a summary line (“N/M responding · median X ms”) and a Re-check button above the
  list. Implemented as the `svcStatus` module in `script.js`, guarded on `.server-panel`
  so it is a no-op on every other page; the styling is page-local, in `server.html`'s
  inline `<style>`, so `styles.css` is untouched.
  Probes are `HEAD` requests with an 8 s timeout, run once on load and then only on
  demand — there is no polling loop against the home server. Credentials are omitted,
  so a visitor's Cloudflare Access session is never attached to a probe.
  The limits are stated on the page rather than papered over: cross-origin responses
  are opaque to JavaScript, so a reachable service means the edge answered and how
  fast, not that the application behind it is healthy. Only same-origin services report
  a real HTTP status, and there anything under 500 counts as up, since a 404 or a 405
  is still a live host. The markup ships `hidden` and is revealed by the module, so a
  visitor without JavaScript sees the panel exactly as it was.

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
