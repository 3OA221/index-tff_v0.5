import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro';

// SITE and BASE are the only place the hosting address is set
// (scripts/check-links.ts imports them from here).
// For a custom domain later: change SITE and set BASE to '/'.
export const SITE = 'https://3oa221.github.io';
export const BASE = '/index-tff_v0.5';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  integrations: [UnoCSS()],
  // Czech is the default language at the root, English under /en/.
  i18n: {
    locales: ['cs', 'en'],
    defaultLocale: 'cs',
    routing: { prefixDefaultLocale: false },
  },
});
