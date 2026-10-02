// Writes docs/photo-brief.md from src/config/photo-slots.ts and lists which slots have files.
//   node tools/photo-brief.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const src = readFileSync('src/config/photo-slots.ts', 'utf8');
const slots = [...src.matchAll(/^\s{2}'?([a-z0-9-]+)'?: \{\s*alt: '([^']*)',\s*brief: '([^']*)',\s*search: '([^']*)',\s*orientation: '(\w+)'/gm)].map(
  ([, name, alt, brief, search, orientation]) => ({ name, alt, brief, search, orientation }),
);
const have = new Set(readdirSync('src/assets/photos').map((f) => f.replace(/\.[a-z]+$/i, '')));

const rows = slots.map((s) => `| \`${s.name}\` | ${have.has(s.name) ? '✓' : '—'} | ${s.orientation} | ${s.brief} | ${s.search} |`);
const md = `# Photo brief

Save each photo as \`src/assets/photos/<slot>.jpg\`. It is optimised and cropped automatically; an empty slot shows a labelled placeholder.
Generated from \`src/config/photo-slots.ts\` by \`node tools/photo-brief.mjs\`. ✓ = file present.

| Slot | Have | Orientation | What it should show | Search terms |
|---|---|---|---|---|
${rows.join('\n')}
`;
writeFileSync('docs/photo-brief.md', md);
console.log(`${slots.length} slots, ${slots.filter((s) => have.has(s.name)).length} filled → docs/photo-brief.md`);
