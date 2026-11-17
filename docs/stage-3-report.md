# Stage 3 report: skeleton complete

Written at the end of Stage 3 (17 Nov 2026). Stages 1 to 3 are done: scaffold, data and routing, landing page with filters.

## What works and how it was checked

Checked in headless Chromium (Playwright) against the built site served under the base path, at 1440 px and 390 px, in Czech and English. Expected results were computed separately from the data with Python and compared. Result: 166 automated checks passed, 0 failed, no console errors.

| Spec item (6.2)                                                                                                                                                                                                      | Checked by                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| About: two paragraphs in Newsreader, page language                                                                                                                                                                   | DOM and computed style                                  |
| Works section: top rule, filter row, grid                                                                                                                                                                            | Computed style, screenshots                             |
| Search: case and diacritics ignored, all words required, max 100 characters, searched fields as specified                                                                                                            | 7 queries compared with the Python results              |
| Four comboboxes: list contents and sort order (Czech collation for names, language collation for mediums, numeric years and study years, "N. ročník" / "Year N")                                                     | Compared with lists built in the test                   |
| Combobox keys: arrows, Home, End, Enter, Space, Escape, letter jump (repeats to the next match), Tab closes; pointer: hover moves the current entry, click outside closes; long list scrolls, also on keyboard moves | Real key presses and pointer events                     |
| Field name as button label, not an option; active filter inverted; clear button clears only its filter and returns focus                                                                                             | DOM, computed colours                                   |
| Filters combine (AND)                                                                                                                                                                                                | Medium + year, search + study year compared with Python |
| URL state: read on load, invalid values ignored, written with replaceState (history length unchanged), hash kept                                                                                                     | URL with valid and invalid values                       |
| Live region "N z M projektů" / "N of M projects" (role=status); empty state text                                                                                                                                     | Text after the debounce                                 |
| Grid / list toggle, saved in `tff-view`, restored before paint; grid 2 / 3 / 4 columns; list text only with mediums, four columns from 760 px, year right aligned                                                    | Computed grid columns at 390 and 1440 px, reload        |
| Order: newest year, then id                                                                                                                                                                                          | Compared with Python                                    |
| Tile: lazy, async, width and height set, cover crop; title underlined on hover and focus; preview on hover and focus, restored on leave and blur; no preview with reduced motion or on a touch device                | Pointer, focus and reduced-motion contexts              |
| Keyboard-only run: tab order skip link, CZ, EN, search, four comboboxes, view buttons, tiles; 2 px focus outline on each; a filter chosen and a project opened with the keyboard only                                | Real Tab and Enter presses                              |
| Without JavaScript: all 19 projects listed as links, filter row hidden                                                                                                                                               | JavaScript disabled                                     |
| No horizontal scroll at 390 px                                                                                                                                                                                       | scrollWidth                                             |

Also: `npm run check` 0 errors, `npm run build` (data check, link check: 41 pages, 718 internal links), `npm run lint` clean.

## Not checked

- Real screen readers (NVDA, JAWS, VoiceOver, TalkBack): only the ARIA attributes were checked, not what is announced.
- Firefox and Safari; real phones and touch devices (touch was emulated; "no hover" was simulated with a synthetic pointer event).
- Windows (the build was run on Linux only).
- Visual details against the old site: not compared, the old site was not opened.

## Decisions made in this stage

- The language switch keeps the current filters (`?q=…`) when changing language.
- The live region is visually hidden; the empty-state text is visible.
- The filter row is hidden without JavaScript; no note is shown, as the list works without it.
- The status text is updated 0.4 s after the last change, so typing does not produce one announcement per keystroke.

## Which later stages a smaller model can do

- **Stage 4 (work page, lightbox, video): mixed.** The page layout, metadata list, description rules, links and video embeds are well specified: a smaller model can do them with the spec as a checklist. The lightbox (modal dialog, focus handling, keys, position bar, live region) needs a strong model or a careful review.
- **Stage 5 (shell and motion): strong model.** Logo text fitting with canvas glyph metrics, letter boxes, the three effects, the zoom state with hysteresis, the difference blend, and the clipped language-switch copy are interdependent and easy to get subtly wrong.
- **Stage 6 (quality): smaller model for running the checks** (axe or similar, link check, `vp check`, console errors); fixes that touch Stage 5 code need a strong model.
- **Stage 7 (go live): smaller model with a checklist.** Add the deploy workflow, the user switches Pages to "GitHub Actions", confirm the URL and base path.
- **Stage 8 (new features): depends on the feature.**
