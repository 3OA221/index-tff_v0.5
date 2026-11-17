# CLAUDE.md

Rules and context for every session working on this repository. Sections 2, 3, 4, 5 and 10 below are copied from the rebuild specification; the full specification (functional spec, visual values, UI text, content) is not in the repository: ask the user for the file `opus-rebuild-prompt.md` if a stage needs it.

## Project notes

- Astro static site, TypeScript strict, UnoCSS (`presetWind4`). No UI framework.
- Repository `3OA221/index-tff_v0.5`. Work directly on `main` (user decision, 17 Nov 2026). The old site stays in `3OA221/index-tff` and is not touched. CI runs on pushes to `main` and on pull requests.
- `SITE` and `BASE` live only in `astro.config.mjs` (exported; `scripts/check-links.ts` imports them). Site URL: `https://3oa221.github.io/index-tff_v0.5/`. Every internal link and asset path goes through `withBase()` in `src/lib/paths.ts`.
- Version label: `SITE_VERSION` in `src/config/site.ts`. Build identifier: `BUILD_ID` in `src/lib/build.ts` (UTC `YYYYMMDD.HHMM.<short commit>`).
- UnoCSS's Astro integration injects `uno.css` itself; do not import `virtual:uno.css` in layouts.
- `vp check` settings (format and lint ignores) are in `vite.config.ts`; Astro does not read that file. `README.md` is excluded from formatting because the user maintains it.
- `@types/node` is a dev dependency so `astro check` accepts the Node imports in `src/lib/build.ts`.
- Data: `src/content/projects/NN.json`, `src/content/facets.json`, `src/content/strip.json`, written by `node scripts/import-spec-data.ts <spec.md>` (never by hand; excluded from formatting). Schemas in `src/content.config.ts`. Access through `src/lib/projects.ts` (`getProjects()` returns site order).
- `npm run build` = `scripts/validate-data.ts` (ids, count 19, mediums, image files) + `astro build` + `scripts/check-links.ts` (internal links, fragments, 38 project pages). Any failure fails the build and CI.
- Routing: Czech pages in `src/pages/`, English in `src/pages/en/`; both render shared components in `src/components/pages/`. Links use `localePath(lang, path)` / `withBase()` from `src/lib/paths.ts`; never write the base path or `/en` by hand.
- UI strings in `src/i18n/ui.ts`. The language switch stores `tff-lang`; only the Czech root page redirects to `/en/` when it is `en`.
- Works section (Stage 3): markup in `src/components/works/`, styles in `src/styles/works.css` (global, because classes are toggled by script), behaviour in `src/scripts/works/` (`index.ts` filters and URL state, `combobox.ts`, `view.ts`, `preview.ts`). Search normalisation is shared: `src/lib/search.ts`. The `js` class on `<html>` is set inline in `Base.astro`.
- Work page (Stage 4): `src/components/pages/WorkPage.astro` with `src/components/work/` (media, videos, description, lightbox), styles in `src/styles/work.css`, lightbox behaviour in `src/scripts/lightbox.ts` (native `<dialog>`; page scroll lock is CSS `html:has(.lightbox[open])`). Image layout rules in `placeImages()` (`src/lib/media.ts`). The 404 page shows "Projekt nebyl nalezen." under `/work/`.
- Shell (Stage 5): `src/components/shell/` (Strip, Logo, Footer), `LangSwitch.astro` (with its white copy), styles in `src/styles/shell.css`, behaviour in `src/scripts/shell/` (`strip.ts`, `logo.ts`, `zoom.ts`, `switch-copy.ts`). The zoom state is one registered CSS number `--z` on `<html>` (class `is-zoom`, 0.9 s transition); colours, side column, gap, logo scale and grain are derived from it in `src/styles/global.css`. `Base.astro` takes `kind` (`landing`, `work`, `other`). Scripts in `src/scripts/` end with `export {};` so TypeScript treats them as modules.
- Focus ring: ink by default (`:focus-visible` in `global.css`), light only in dark areas (footer, lightbox, logo). Never use `currentColor` for it: inverted elements would get a light ring on the light page.
- Live site: `https://3oa221.github.io/index-tff_v0.5/`. Every push to `main` deploys it (`.github/workflows/deploy.yml`); CI (`ci.yml`) also runs check and build on pushes and pull requests. Use a branch and a pull request for larger changes so the live site is not broken by an unfinished stage.
- Node runs the `.ts` scripts directly (type stripping): use only erasable TypeScript syntax there.

## 2. Rules from the user

- Short answers, restrained tone, no emojis. Use Python for any calculation. Never fabricate; say what you did not check.
- Work titles are never translated: the creator's original title is shown in both languages.
- The authors' text and formatting stay exactly as in the data: capitalisation, line breaks, typos. English descriptions are labelled drafts. Show handles exactly as in the data.
- No invented image captions. No copyright line in the footer.
- The user keeps their own `README.md` in the repository and keeps it static (no version line). Do not overwrite it or add version information to it.
- Every stage ends with change notes in release-notes style: Added / Changed / Removed / Fixed.
- No personal data beyond what is in section 9. Consent for every author is confirmed by the user.

## 3. Toolchain (tested on 17 Nov 2026 in a Linux sandbox)

Use exactly these, with npm and a committed `package-lock.json`:

| Package                                                        | Version    | Note                                                                              |
| -------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------- |
| astro                                                          | 7.4.12     | Needs Node 22.23.4 or newer; the GitHub deploy action defaults to Node 24         |
| unocss                                                         | 66.13.0    | Also install `@unocss/astro` 66.13.0 (the `unocss/astro` import fails without it) |
| typescript                                                     | 6.0.3      | Do **not** use TypeScript 7: `@astrojs/check` requires TypeScript 5 or 6          |
| @astrojs/check                                                 | 0.9.12     | `astro check` passed with 0 errors                                                |
| @fontsource/inter, /newsreader, /space-grotesk, /ibm-plex-mono | 5.3.0 each | Czech needs the `latin-ext` files too                                             |
| vite-plus (dev)                                                | 1.7.0      | Optional helper, see below                                                        |

Verified working: Astro 7.4.12 with UnoCSS (`presetWind4` imported from `unocss`), TypeScript strict, `astro check` and `astro build` with a `base` path. The generated site linked its CSS as `<base>/_astro/...`.

Tested config files:

`astro.config.mjs`

```js
import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro';
export default defineConfig({
  site: 'https://3oa221.github.io',
  base: '/index-tff_v0.5',
  integrations: [UnoCSS()],
  // add i18n here (section 5.8)
});
```

`uno.config.ts`

```ts
import { defineConfig, presetWind4 } from 'unocss';
export default defineConfig({
  presets: [presetWind4()],
  theme: { colors: { ink: '#202020', surface: '#DCDCDC' } },
});
```

`tsconfig.json`

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

Fonts: `import '@fontsource/newsreader/latin-400.css'` and `latin-ext-400.css`; Newsreader italic bold `latin-700-italic.css` and `latin-ext-700-italic.css`; Space Grotesk `latin-700.css` and `latin-ext-700.css`; IBM Plex Mono `latin-700.css` and `latin-ext-700.css`; Inter `latin-400.css`, `latin-700.css` and the `latin-ext` equivalents. Family names: Inter, Newsreader, Space Grotesk, IBM Plex Mono.

Vite+ (`vp` 1.7.0): tested only as a local dev dependency. `npx vp run build` ran `astro build` correctly; `vp check` runs format and lint (it flagged formatting in config files, `vp check --fix` fixes them) and must be configured to ignore `dist/` and `.astro/`. Use `astro dev`, `astro build` and `astro check` directly in `package.json` scripts; never `vp dev` or `vp build` (they run Vite, not Astro). `.astro` files are type-checked by `astro check`. Not tested: Windows, `vp env`, `vp install`. If the user has no Node 22.23.4 or newer, tell them to install Node 24 from nodejs.org (or try `vp env`).

No UI framework (no React, Vue, Solid) on the public site. Behaviour is written as small typed TypeScript modules loaded by the pages.

## 4. GitHub and hosting

- Repository: `3OA221/index-tff_v0.5`, you have push access. In a cloud session, use the `add_repo` tool with owner `3OA221`, repo `index-tff_v0.5`, access `push`, run the clone command it returns, then `register_repo_root`.
- History: Stages 1 and 2 were built in `3OA221/index-tff` (branch `claude/repository-code-replacement-tbiwab`) and merged into this repository. The old plain-HTML site there (`main`) is not touched.
- Work on `main`. Stage 1 removed the old site files and moved `img/` to `public/img/` and the four favicon files to `public/` (`favicon.ico`, `favicon.svg`, `favicon-64.png`, `apple-touch-icon.png`).
- Images: `public/img/NN/<file>` where the file names are exactly the `src`, `thumb`, `cover` and `preview` values in section 9 (relative to `img/`). They are already WebP and sized; use the `w`, `h`, `tw` values from the data. No image processing is needed.
- Hosting: GitHub Pages from this repository. Expected URL `https://3oa221.github.io/index-tff_v0.5/`, so `site` and `base` are as in `astro.config.mjs`, and every internal link and asset path must respect `base`. A custom domain may come later: keep `base` in one place.
- CI: `.github/workflows/ci.yml` runs on pushes to `main` and on pull requests, with only the build job (no deploy job), using `build-cmd: npm run check && npm run build` for the Astro action.
- The deploy workflow (Stage 7) is the one from the Astro documentation:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v7
      - name: Install, build, and upload your site
        uses: withastro/action@v6
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

The action detects the package manager from the lockfile. The user must set Settings, Pages, Source to "GitHub Actions" themselves at Stage 7; you cannot do it. Do not add the deploy workflow before Stage 7.

- Commit protocol: one commit per stage (more if a stage is large), message `Stage N: title` plus a body with the change notes. Push to `main` after each stage's checks pass. Never force-push, never commit secrets or files outside the repository.
- Show the user what you built: if a headless browser is available, send screenshots (desktop and 390px wide, Czech and English) at the end of each visual stage and say plainly what you did and did not check.

## 5. Decisions already made (do not ask again)

1. Hosting: GitHub Pages, project site with base `/index-tff_v0.5`.
2. Languages: Czech is the default at the site root (`/`, `/work/NN/`); English under `/en/` (`/en/`, `/en/work/NN/`). Use Astro's i18n routing with `prefixDefaultLocale: false`. Every page has `hreflang` alternates and the CZ/EN switch links to the same page in the other language. The saved language choice (localStorage `tff-lang`) is used on the root page: if it is `en`, go to `/en/`. No other automatic redirect.
3. Project URLs: `/work/NN/` with NN the two-digit project id.
4. Handles: show exactly what is in the data; nothing more is withheld or added.
5. Version label in the footer: `v1.0-dev`, plus a build identifier generated at build time (`YYYYMMDD.HHMM.<short commit>`). One constant in one file.
6. Package manager npm; Node 24.
7. New features: none yet (section 11).

## 10. Stages

At the end of each stage: run the checks, show the output, commit and push to `main`, write change notes (Added / Changed / Removed / Fixed), stop.

**Stage 1: scaffold.** Done. Cleared the old site files and move the assets (section 4); Astro project with the tested config (section 3), TypeScript strict, UnoCSS with the colour and font tokens (section 7) as theme, fonts, favicons, the base layout (document language, titles, skip link, empty side and content regions), `package.json` scripts (`dev`, `build`, `check`, `lint` via `vp check`), `CLAUDE.md`, the CI workflow.
Checks: clean `npm ci`, `npm run check`, `npm run build` pass; the CI run on the branch is green (read it with the GitHub tools).

**Stage 2: data and routing.** Done. Put the data in a typed content collection (one JSON file per project plus the facets and the strip items), validated by a schema; write the data from section 9 with a script, not by hand. Czech and English page trees (section 5.2), `/work/NN/` pages for all 19 projects in both languages (placeholder content is fine), `hreflang`, the language switch, a not-found page, one base-path helper used by every link.
Checks: a script that fails the build if an id is duplicated, a referenced image file is missing under `public/img/`, a medium id is not in the facets, or the number of projects is not 19; all 38 project pages exist; no broken internal links (run a link check on `dist/` and show it).

**Stage 3: landing page and filters (the reference feature).** Done; report in `docs/stage-3-report.md`. About, works section, search, four comboboxes, URL state, grid and list, tile hover preview, live status, empty state (section 6.2).
Checks: go through every item of 6.2 in a browser at 390px and desktop, in both languages; keyboard-only run; reduced motion; show screenshots. After this stage the skeleton is complete: write a short report (what works and how it was checked, what was not checked, and which later stages a smaller model can do safely with a checklist and which need a strong model).

**Stage 4: work page, lightbox, video.** Done. Sections 6.3 and 6.4.
Checks: every item, for projects with 1, 4, 5 and 17 images, a project with a video ID, a video-only project, a Slovak-text project; both languages; keyboard-only; screenshots.

**Stage 5: shell and motion.** Done. Announcement strip, side panel, logo and its effects, zoom state, language switch copy, footer, page-state rules for work pages (section 6.1).
Checks: thresholds of the zoom state at the stated viewport fractions; reduced motion; no flicker when scrolling slowly; screenshots at 390px and desktop.

**Stage 6: quality.** Done; report in `docs/stage-6-report.md`. Accessibility pass (6.6) with an automated checker if one is available, performance check, no console errors, link check, `vp check` clean.

**Stage 7: go live.** Done: `.github/workflows/deploy.yml` deploys every push to `main`. Only after the user says so: add the deploy workflow (section 4) on `main`. Tell the user to set Settings, Pages, Source to "GitHub Actions" in `3OA221/index-tff_v0.5`. After the first run, confirm the site loads at `https://3oa221.github.io/index-tff_v0.5/` with the right base path.

**Stage 8: new features.** From the user's list (section 11).

## 11. New features

[The user fills this in. If empty at Stage 8, ask once which feature comes first.]
