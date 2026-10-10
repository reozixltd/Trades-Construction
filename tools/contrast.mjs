// node tools/contrast.mjs src/styles/tokens.css — WCAG contrast of the text/background pairs the site actually uses, per theme.
import fs from 'node:fs';
const css = fs.readFileSync(process.argv[2], 'utf8');
const split = css.indexOf("[data-theme='precision']");
const parse = (s) => Object.fromEntries([...s.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));
const craft = parse(css.slice(0, split));
const themes = { craft, precision: { ...craft, ...parse(css.slice(split)) } };
const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const pairs = [];
for (const bg of ['canvas', 'surface', 'sheet', 'inset']) for (const fg of ['text', 'text-muted', 'text-subtle', 'accent-text', 'success', 'warning', 'danger']) pairs.push([fg, bg, 4.5]);
for (const bg of ['dark', 'dark-raised', 'ink']) for (const fg of ['on-dark', 'on-dark-muted', 'accent-on-dark']) pairs.push([fg, bg, 4.5]);
pairs.push(['on-accent', 'accent', 4.5], ['on-accent', 'accent-hover', 4.5], ['on-dark', 'ink-hover', 4.5], ['accent', 'canvas', 3], ['accent', 'dark', 3], ['field-line', 'canvas', 3], ['field-line', 'surface', 3]);
let bad = 0;
for (const [name, t] of Object.entries(themes)) for (const [fg, bg, min] of pairs) {
  if (!t[fg] || !t[bg]) continue;
  const r = ratio(t[fg], t[bg]);
  if (r < min) { bad++; console.log(`${name}: ${fg} on ${bg} = ${r.toFixed(2)} (needs ${min})`); }
}
console.log(bad ? `${bad} pair(s) under target` : 'all pairs meet target');
