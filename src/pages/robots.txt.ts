import type { APIRoute } from 'astro';

// Nothing is disallowed: the console is kept out of search by its noindex tag, which a crawler must be allowed to read.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n`);
