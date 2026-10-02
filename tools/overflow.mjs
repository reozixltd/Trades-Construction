// Lists elements wider than the viewport: node tools/overflow.mjs <path> [width]
import { chromium } from 'playwright';
const [, , path = '/', width = '375'] = process.argv;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: Number(width), height: 800 } });
await page.goto(`http://localhost:4321${path}`, { waitUntil: 'load' });
const res = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 && r.width > 0) out.push(`${el.closest('section')?.getAttribute('aria-labelledby') ?? ''} ${el.tagName.toLowerCase()}.${[...el.classList].join('.')} right=${Math.round(r.right)} w=${Math.round(r.width)}`);
  });
  return { vw, sw: document.documentElement.scrollWidth, out: out.filter((s) => !/^(t[rhd]|thead|tbody|caption|table)./.test(s)).slice(0, 15) };
});
console.log(JSON.stringify(res, null, 1));
await browser.close();
