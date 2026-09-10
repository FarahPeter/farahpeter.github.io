# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
semantic versioning. On this repo a merge to `main` deploys to production
(GitHub Pages → https://peterfarah.com), so every released version equals a
deployed state.

## [Unreleased]

### Changed — site-wide improvement pass (September 2026)

The plan behind this pass, with every finding and the decisions left to the
owner, is in `docs/IMPROVEMENT_PLAN.md`. `FUN/` was left untouched.

- **Fixed things that were broken.** `Files/images/favicon.ico` is now a real file
  (16/32/48 px), with an `apple-touch-icon`, 192/512 px icons and a
  `site.webmanifest`. The ⌘K palette is usable from the keyboard again (the panel's
  `visibility` transition kept the input unfocusable; Escape now closes it and
  focus returns to the trigger). Blog write-ups expand from a real
  `<button aria-expanded>`; collapsed bodies are `inert`, and navigating to
  `blog.html#home-nas` from the page's own nav now opens the post (`hashchange`).
  The mobile drawer is out of the tab order while closed, moves focus in and out,
  and makes the page behind it `inert`. Sections no longer disappear when
  JavaScript is unavailable (`html.js` guards the reveal rules), and a one-line
  boot script in every `<head>` applies the saved theme before first paint, so
  light-theme visitors no longer see a dark flash.
- **One navigation on every page.** Home · Journey · Research · Hub · Server · CV
  on every navbar and drawer (index/journey keep their section anchors, the blog
  its post anchors), `aria-current` on the current page, the ⌘K palette on every
  content page, a skip link and a `<main>` landmark, and a footer with the same
  links plus the new privacy page. The Interactive Hub was previously reachable
  only through the palette.
- **Faster first paint.** The hero portrait and the three blog covers now ship as
  responsive WebP/JPEG derivatives with `width`/`height` (614 KB → ~40 KB for the
  portrait at 720 px; 1.9 MB → ~50–130 KB per cover), the first cover is
  `fetchpriority="high"`, collapsed blog bodies no longer pull their images
  (`content-visibility: hidden`), and the three typefaces are self-hosted as
  variable WOFF2 under `Files/fonts/` instead of a render-blocking Google Fonts
  `@import` (which also removes the third-party request).
- **Motion that respects the visitor.** `prefers-reduced-motion` is honoured again
  in `script.js` and the journey engine (static layout, still network frame, no
  count-ups or typing), and a new `motionBudget` module pauses the aurora and the
  canvas loops after six seconds without input, in hidden tabs, and on
  save-data / very low-end devices; the mouse trail only animates while a point
  is fading.
- **Accessibility.** Theme toggles expose `aria-pressed` and update
  `meta theme-color`; the palette is a proper combobox/listbox with a focus trap;
  hub filter pills are `aria-pressed` and announce the result count; the
  auto-hiding navbar never hides while focused; journey's split hero name has real
  text, its off-stage links are not tab stops, and rail labels show on keyboard
  focus; copy-email toast actually announces; `role="list"` on styled lists;
  underlines on in-text links; larger drawer close target; light-theme
  `--accent-2` (2.4:1 → 4.4:1) and `--faint` in both themes now pass AA, with
  primary buttons on light starting from the deep accent.
- **SEO and sharing.** `rel="canonical"`, full Open Graph + Twitter card tags and
  a dedicated 1200×630 card per page (`Files/images/og/`), a `@graph` of
  WebSite/ProfilePage/Person on the home page, `Blog`/`BlogPosting` data for the
  three write-ups, real `lastmod` dates in `sitemap.xml`, a trailing newline in
  `robots.txt`, `noindex` on `404.html`, and `llms.txt` trimmed to the skills the
  site actually lists.
- **Privacy.** New `privacy.html` describing what the telemetry records; the
  heartbeat stops in hidden tabs; visitors sending Global Privacy Control or Do
  Not Track are not tracked at all; `Referrer-Policy` meta on every page.
- **Journey page.** Pinned layout is applied from `<head>` (no layout flip after
  first paint), `will-change` and the decorative loops are scoped to the scene on
  screen (`.jn-live`), 3× phones now get the 900 px reel frames, the engine falls
  back to the static article if it throws, and the undefined `--stroke` variable
  is gone.
- **Content and copy.** Télécom SudParis, Clash Royale, "36 TB", "Career" kicker,
  consistent British spelling, descriptive alt text on every blog figure, a
  themed results legend, a shorter home `<title>`, and named "Open …" links in
  the Hub.
- **Housekeeping.** Dead CSS removed (skill meters, legacy alias variables,
  `#cursor-ring`), a print stylesheet, `type="button"` on every button,
  `docs/ARCHITECTURE.md` refreshed.

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
