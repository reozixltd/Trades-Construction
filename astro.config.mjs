// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The address the site is published at. Canonical links, the sitemap, robots.txt, share images and structured data
// are all built from it, so it has to be a host that answers. Vercel supplies its own (the custom domain once one
// is attached); SITE_URL sets it for any other host.
const { SITE_URL, VERCEL_PROJECT_PRODUCTION_URL } = process.env;
const site = SITE_URL ?? (VERCEL_PROJECT_PRODUCTION_URL ? `https://${VERCEL_PROJECT_PRODUCTION_URL}` : 'https://trades.reozix.com');

export default defineConfig({
  site,
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.includes('/console/') })],
});
