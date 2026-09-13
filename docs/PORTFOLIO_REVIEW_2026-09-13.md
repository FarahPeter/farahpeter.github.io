# Portfolio review — 13 September 2026

This pass follows the existing September audit. It reviews the current root
pages, shared CSS/JavaScript, local links, and the published homepage. The
portfolio remains a static GitHub Pages site with its existing blue glass
design, self-hosted fonts, light theme, and technical content.

## Findings and implemented changes

| Finding | Evidence | Change |
| --- | --- | --- |
| HUB appeared in every primary menu. | Desktop and mobile markup on all seven root pages. | Removed HUB from both menus. The page, footer links, and palette entry remain available; this is a navigation-bar change. |
| Project evidence came after the long career timeline and skills list. | Homepage section order and published page. | Moved selected projects directly after About and matched the homepage navigation and palette order. |
| The first screen offered contact/CV actions but no project action. | Published hero and homepage markup. | Added a primary **View projects** link, retained CV/contact actions, and moved Copy Email to Contact. |
| Featured projects required scanning long bullet lists. | Three full-width featured cards. | Replaced them with three image-led case-study summaries: what was built, its result, tools, and specific links to the existing write-ups, simulator, or shop. The remaining four projects stay on the page. |
| Metrics defaulted to zero and the visible role was blank before JavaScript. | Static hero markup; transient negative values also appeared in the live DOM during the count-up. | Rendered the final role and metrics in HTML, bounded animation progress at zero, and labeled 36 TB as **raw NAS storage**. The biography and counts remain grounded in existing site content. |
| The structured-data portrait differed from the current portrait. | `Person.image` still referenced `profile_old.jpg`. | Pointed it to the current optimized portrait. |
| A failed shared script could hide content despite the earlier no-JS fix. | The head script enabled `html.js` before the reveal and blog handlers existed. | Enable reveal hiding only with `reveal-ready`, and blog collapsing only with `blog-ready`, after their handlers initialize. Keep content visible when the shared script is unavailable. |
| Reveals depended on 12% of an entire section fitting inside the viewport. | Shared IntersectionObserver settings. | Reveal on viewport entry; reveal immediately when a descendant receives keyboard focus. Reduced-motion visitors get immediately visible content. |
| The mobile drawer could exceed a short viewport and strand focus. | Fixed-height flex drawer without scrolling, no explicit Tab wrap, and no resize cleanup. | Added internal scrolling, safe-area padding, focus wrapping, immediate inert state on close, and cleanup when switching to desktop width. |
| Empty search navigation generated an invalid active descendant. | Reproduced on the live site: search for `zzzz`, then ArrowDown → `cmd-opt--1`. | Guard empty results, announce the result count, keep Enter harmless with no match, and retain normal Home/End text editing. |
| Palette section jumps did not update the URL or move focus to the section. | The old action only called `scrollIntoView`. | Update the hash and focus the destination so keyboard reading continues there and the section can be linked. |
| Drawer/palette background state could be overwritten or overlap. | Drawer cleanup unconditionally removed inert state; palette lacked background isolation. | Share a background-lock helper that restores prior state, close one overlay before opening another, and restore focus without a scroll jump. |
| Small visual/robustness issues remained. | SVG copy icon had no dimensions; source and CSS both added an arrow to GitHub project links; canvas setup assumed a context existed. | Size the copy icon, remove duplicate arrows, allow search input/footer to shrink/wrap, and skip decorative canvases when unavailable. |

The three new project images reuse existing optimized WebP assets and load
lazily with intrinsic dimensions. No runtime dependency or build step was
introduced. The custom domain and hosting configuration are unchanged.

## Verification

- Inspected the published homepage visually and reproduced the palette defect
  in Chrome before editing.
- **16 passing DOM regression tests**, including shared-script initialization
  and navigation on all seven pages, fallback content, empty-search keyboard
  behavior, modal handoff, focus restoration, section hashes, resize cleanup,
  blog expansion, reduced-motion setup, and missing canvas support.
- `node --check script.js`; parsed all 10 inline JavaScript blocks, all six
  inline stylesheets, shared CSS, and the JSON-LD blocks.
- Checked root-page local link and asset targets and local HTML fragments:
  no missing targets. This does not verify remote service availability.
- `git diff --check` passed.

**Validation limitation:** the available Chrome browser refused the local
preview URL with `ERR_BLOCKED_BY_CLIENT`. The published baseline was inspected,
but screenshots of the revised layout, real mobile rendering, and
screen-reader behavior have not been verified. DOM tests do not measure layout
or contrast. Check the revised cards, short-screen drawer, and both themes
visually before merging. No Lighthouse score or performance improvement is
claimed from this pass.

## Run the regression checks

The site itself needs no npm install. These optional test dependencies can live
outside the repository:

```sh
npm install --prefix /tmp/portfolio-checks --no-audit --no-fund jsdom@26.1.0 postcss@8.5.6
NODE_PATH=/tmp/portfolio-checks/node_modules node --test tests/portfolio.test.cjs
node --check script.js
```

## Remaining content opportunities

- Separate URLs for the three long research write-ups would allow distinct
  page titles and share cards. This pass preserves the existing deep links.
- Publication dates and additional measured project outcomes need reliable
  source material before being added. The previous audit's unsupported
  workflow-count question remains unresolved.
- A real-device visual and accessibility pass is the next verification step;
  the code changes are prepared on a local branch, not deployed. GitHub rejected the write with HTTP 403 (`Resource not accessible by integration`), so no remote branch or pull request was created.
