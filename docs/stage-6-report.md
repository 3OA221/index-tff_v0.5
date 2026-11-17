# Stage 6 report: quality

Checked on 17 Nov 2026 against the built site (`npm run build`) served under the base path, in headless Chromium. The tools were installed outside the project (not dependencies): axe-core 4.14.0 and Lighthouse 13.6.0.

## Results

| Check                                                        | Result                                                                                                                                                                                                                      |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check` (astro check)                                | 0 errors, 0 warnings, 0 hints                                                                                                                                                                                               |
| `npm run lint` (`vp check`)                                  | formatting and lint clean                                                                                                                                                                                                   |
| `npm run build` data check                                   | 19 projects, 14 mediums, 153 image references                                                                                                                                                                               |
| `npm run build` link check                                   | 41 pages, 1360 internal links, 38 project pages, no broken links or fragments                                                                                                                                               |
| axe-core (WCAG 2.0/2.1/2.2 A and AA, best practices)         | 72 runs: all 41 pages at 1440 px, landing and selected work pages at 390 px, both languages, with a combobox open, filters active, list view, empty result, footer in view, lightbox open. One remaining finding, see below |
| Lighthouse (performance, accessibility, best practices, SEO) | 100 / 100 / 100 / 100 on the landing page (cs, en), work 09 and work 04, mobile and desktop presets. CLS 0, total blocking time 0 ms                                                                                        |
| Console                                                      | 82 page loads (all pages, 1440 and 390 px): no errors, no warnings, no failed requests                                                                                                                                      |
| Focus                                                        | 139 focusable elements on five pages: every one shows a 2px outline at 3px offset with at least 3:1 contrast against the colour actually behind the outline                                                                 |
| Frame timing                                                 | Zoom transition and the first 7 s of logo effects: 16.7 ms median, 16.8 ms worst frame, none over 33 ms (headless Chromium on a server, not a phone)                                                                        |
| Landmarks                                                    | one `main`, one footer, named navigation (logo, language, project navigation), named strip region and search region, one `h1` per page, in both languages                                                                   |
| Without JavaScript                                           | landing page lists all 19 projects as links; work pages show all text and images                                                                                                                                            |
| Regression suites                                            | Stage 3: 166, Stage 4: 1152, Stage 5: 80 checks, all passing                                                                                                                                                                |

## Fixed in this stage

- **Focus ring colour.** The outline used `currentColor`, which on inverted elements (pressed CZ/EN, pressed view button, hovered social button) is the light text colour drawn over the light page: nearly invisible. The ring is now ink by default and light only in the footer, the lightbox and on the logo.
- **Skip link focus ring** was light over the grey page; now ink.
- **Focus offset** on the logo faces and the search field was inset; now 3px like everything else.
- **Language switch names.** The visible "CZ" / "EN" was not part of the accessible name ("Čeština" / "English"), failing WCAG 2.5.3. The names are now "CZ Čeština" and "EN English".
- **Layout shift.** The about text reflowed when Newsreader loaded (CLS 0.013 on desktop). The first-screen fonts (Inter 400, and Newsreader 400 on the landing page, latin and latin-ext) are now preloaded; CLS is 0.
- **Console warning** "Unrecognized feature: 'web-share'" from the YouTube iframe's `allow` list; `web-share` removed.

## Known and accepted

- **Lightbox position bar on phones, project 09 (17 images):** the segments are about 12px wide at 390px; axe reports `target-size` (WCAG 2.5.8). They cannot reach 24px at that width (even full width without gaps gives 22px). The same function is available through the Previous and Next buttons (56px), which is the "equivalent control" exception of 2.5.8. Projects with up to 10 images are not affected at 390px.
- **Logo face during the decode effect:** for under a second the letters of "text" are random, so the visible text differs from the accessible name "text"; axe reports `label-content-name-mismatch` only if it runs at that moment. This is the specified effect; with reduced motion it never happens.
- **Image sizes:** Lighthouse estimates 446 KB (landing, desktop) could be saved with smaller tile images; the tile thumbnails (533 to 800px wide) are shown at about 280px. The data has only one thumbnail size and the specification says no image processing.
- **Caching and compression** insights come from the local test server; GitHub Pages sets its own headers.

## Not checked

- Firefox and Safari (the zoom state uses `@property` and `color-mix()`, the footer uses subgrid, the lightbox uses `:has()`).
- Real screen readers, real phones and touch devices, Windows.
- Performance on a real low-end phone; the frame timing above is from a server.
