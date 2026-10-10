/**
 * Background video contract, run against a built preview once a hero clip is in public/videos/:
 *   node tests/e2e/video.mjs http://localhost:4321
 * Uses installed Chrome (Playwright's bundled Chromium cannot decode H.264). Checks lazy loading,
 * muted inline autoplay, the pause button, the smaller file on phones, reduced motion and load failure.
 */
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:4321';
const out = [];
const ok = (name, cond, extra = '') => out.push(`${cond ? 'PASS' : 'FAIL'} ${name} ${extra}`);

(async () => {
  const b = await chromium.launch({ channel: 'chrome' });

  // 1. Desktop, motion allowed
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  let p = await ctx.newPage();
  const reqs = [];
  p.on('request', (r) => r.url().includes('/videos/') && reqs.push(r.url()));
  await p.goto(base, { waitUntil: 'networkidle' });
  await p.waitForSelector('.hero .video.is-playing', { timeout: 8000 }).catch(() => {});
  let s = await p.evaluate(() => {
    const v = document.querySelector('.hero video');
    const t = document.querySelector('.hero [data-video-toggle]');
    return v && { src: v.currentSrc, muted: v.muted, inline: v.playsInline, loop: v.loop, paused: v.paused, playing: v.closest('.video').classList.contains('is-playing'), toggleHidden: t.hidden, poster: !!document.querySelector('.hero .video__still img') };
  });
  ok('desktop: video present and playing', s && s.playing && !s.paused, JSON.stringify(s));
  ok('desktop: muted, inline, loop', s && s.muted && s.inline && s.loop);
  ok('desktop: 1080p file used', s && /ft-hero-site\.mp4$/.test(s.src));
  ok('desktop: still rendered underneath', s && s.poster);
  await p.click('.hero [data-video-toggle]');
  let t = await p.evaluate(() => ({ paused: document.querySelector('.hero video').paused, pressed: document.querySelector('.hero [data-video-toggle]').getAttribute('aria-pressed'), label: document.querySelector('.hero [data-video-label]').textContent }));
  ok('toggle pauses', t.paused && t.pressed === 'true' && /Play/.test(t.label), JSON.stringify(t));
  await p.keyboard.press('Enter');
  await p.waitForTimeout(300);
  t = await p.evaluate(() => ({ paused: document.querySelector('.hero video').paused, pressed: document.querySelector('.hero [data-video-toggle]').getAttribute('aria-pressed') }));
  ok('toggle resumes from the keyboard', !t.paused && t.pressed === 'false', JSON.stringify(t));
  // scrolled away -> paused
  await p.evaluate(() => scrollTo({ top: 4000, behavior: 'instant' }));
  await p.waitForTimeout(500);
  ok('paused when scrolled out of view', await p.evaluate(() => document.querySelector('.hero video').paused));
  ok('only one video file requested', new Set(reqs).size === 1, [...new Set(reqs)].join(','));
  await ctx.close();

  // 2. Phone
  ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  p = await ctx.newPage();
  await p.goto(base, { waitUntil: 'networkidle' });
  await p.waitForSelector('.hero .video.is-playing', { timeout: 8000 }).catch(() => {});
  s = await p.evaluate(() => { const v = document.querySelector('.hero video'); return v && { src: v.currentSrc, paused: v.paused }; });
  ok('phone: 720p file used and playing', s && /-720\.mp4$/.test(s.src) && !s.paused, JSON.stringify(s));
  await ctx.close();

  // 3. Reduced motion
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  p = await ctx.newPage();
  const rm = [];
  p.on('request', (r) => r.url().includes('/videos/') && rm.push(r.url()));
  await p.goto(base, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  s = await p.evaluate(() => ({ video: !!document.querySelector('.hero video'), toggle: !!document.querySelector('.hero [data-video-toggle]'), still: !!document.querySelector('.hero .video__still img') }));
  ok('reduced motion: no video, no toggle, still shown, nothing fetched', !s.video && !s.toggle && s.still && rm.length === 0, JSON.stringify(s));
  await ctx.close();

  // 4. File fails to load
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  p = await ctx.newPage();
  await p.route('**/videos/**', (r) => r.abort());
  await p.goto(base, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  s = await p.evaluate(() => ({ video: !!document.querySelector('.hero video'), toggle: !!document.querySelector('.hero [data-video-toggle]'), still: !!document.querySelector('.hero .video__still img') }));
  ok('load failure: video and toggle removed, still shown', !s.video && !s.toggle && s.still, JSON.stringify(s));
  await ctx.close();

  await b.close();
  console.log(out.join('\n'));
  if (out.some((l) => l.startsWith('FAIL'))) process.exit(1);
})().catch((e) => { console.log(out.join('\n')); console.error('ERROR', e.message); process.exit(1); });
