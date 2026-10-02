/**
 * Exports dist/ as a self-contained static bundle that works from any
 * sub-folder (used to publish the demo as a hosted preview).
 *   node tools/relativize.mjs [inDir=dist] [outDir=dist-static]
 *
 * - Rewrites root-absolute href/src ("/services/") to relative paths
 *   ("../services/index.html") per page.
 * - Adds <html data-root="../" data-static-files> so scripts' sitePath()
 *   builds the same relative links at runtime.
 * The normal production deploy uses dist/ unchanged.
 */
import { cpSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, dirname, posix } from 'node:path';

const [, , inDir = 'dist', outDir = 'dist-static'] = process.argv;
rmSync(outDir, { recursive: true, force: true });
cpSync(inDir, outDir, { recursive: true });

const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));

for (const file of walk(outDir).filter((f) => f.endsWith('.html'))) {
  const rel = relative(outDir, dirname(file)).split('\\').join('/');
  const root = rel ? '../'.repeat(rel.split('/').length) : './';
  let html = readFileSync(file, 'utf8');

  html = html.replace(/(href|src)="\/(?!\/)([^"#?]*)([^"]*)"/g, (_m, attr, path, rest) => {
    let target = path;
    if (target === '' || target.endsWith('/')) target += 'index.html';
    return `${attr}="${posix.normalize(root + target)}${rest}"`;
  });
  // Responsive images: every URL inside srcset="/_astro/a.avif 480w, /_astro/b.avif 800w".
  html = html.replace(/srcset="([^"]*)"/g, (_m, list) => `srcset="${list.replace(/(^|,\s*)\/(?!\/)/g, `$1${root}`)}"`);
  html = html.replace('<html ', `<html data-root="${root}" data-static-files `);
  writeFileSync(file, html);
}

// Bundled CSS can reference /_astro/ assets; make those relative to the CSS file.
for (const file of walk(outDir).filter((f) => f.endsWith('.css'))) {
  const css = readFileSync(file, 'utf8').replace(/url\(\/_astro\//g, 'url(./');
  writeFileSync(file, css);
}
console.log(`Static bundle written to ${outDir}/`);
