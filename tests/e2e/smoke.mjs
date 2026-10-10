/**
 * End-to-end smoke test against a running preview (npm run build && npm run preview).
 *   node tests/e2e/smoke.mjs [baseUrl]
 * Covers the checklist's critical paths: licence on every page, sticky call bar,
 * step-1-only quote submission, lead appears in console, emergency toggle.
 */
import * as playwright from 'playwright';
import assert from 'node:assert/strict';

const BASE = process.argv[2] ?? 'http://localhost:4321';
const PAGES = ['/', '/services/', '/services/repairs-and-maintenance/', '/areas/', '/areas/penrith/', '/projects/', '/about/', '/contact/', '/quote/', '/privacy/', '/terms/'];

// BROWSER=firefox or webkit runs the same checks in another engine.
const browser = await playwright[process.env.BROWSER ?? 'chromium'].launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const context = await browser.newContext({ viewport: { width: 375, height: 800 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const results = [];
const step = async (name, fn) => {
  try {
    await fn();
    results.push(`✓ ${name}`);
  } catch (e) {
    results.push(`✗ ${name}\n    ${e.message.split('\n')[0]}`);
  }
};

await step('every page shows licensee name + licence number and has no horizontal scroll at 375px', async () => {
  for (const path of PAGES) {
    await page.goto(BASE + path);
    const footer = await page.locator('footer.footer').innerText();
    assert.match(footer, /Lic\. 000000C/, `${path}: licence missing`);
    assert.match(footer, /Pty Ltd/, `${path}: licensee name missing`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.equal(overflow, 0, `${path}: ${overflow}px horizontal overflow`);
    assert.equal(await page.locator('h1').count(), 1, `${path}: expected exactly one h1`);
  }
});

await step('desktop (1280px): no horizontal scroll; trust strip shows licensee, trading name and licence', async () => {
  const desk = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (const path of PAGES) {
    await desk.goto(BASE + path);
    const overflow = await desk.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.equal(overflow, 0, `${path}: ${overflow}px horizontal overflow at 1280px`);
  }
  await desk.goto(BASE + '/');
  const trust = await desk.locator('.trust').innerText();
  assert.match(trust, /Pty Ltd/);
  assert.match(trust, /Trading as/i);
  assert.match(trust, /Lic\. 000000C/);
  await desk.close();
});

await step('mobile call bar is visible with a tel: link', async () => {
  await page.goto(BASE + '/');
  const call = page.locator('.callbar a[href^="tel:"]');
  assert.ok(await call.isVisible());
});

await step('suburb checker answers covered / not covered', async () => {
  await page.goto(BASE + '/areas/');
  await page.fill('#area-input', '2154');
  await page.click('[data-area-checker] button[type="submit"]');
  assert.match(await page.locator('[data-area-result]').innerText(), /Yes, we cover Castle Hill/);
  await page.fill('#area-input', 'Wollongong');
  await page.click('[data-area-checker] button[type="submit"]');
  assert.match(await page.locator('[data-area-result]').innerText(), /outside our usual area/);
});

await step('suburb checker answers nearby and invalid', async () => {
  await page.goto(BASE + '/areas/');
  await page.fill('#area-input', 'Liverpool');
  await page.click('[data-area-checker] button[type="submit"]');
  assert.match(await page.locator('[data-area-result]').innerText(), /just outside our usual area/);
  await page.fill('#area-input', '12');
  await page.click('[data-area-checker] button[type="submit"]');
  assert.match(await page.locator('[data-area-result]').innerText(), /4-digit postcode/);
});

await step('before/after slider moves with the keyboard and a click', async () => {
  await page.goto(BASE + '/');
  const cmp = page.locator('[data-compare]');
  const pos = () => cmp.evaluate((e) => e.style.getPropertyValue('--pos'));
  await page.focus('#compare-range');
  await page.keyboard.press('ArrowRight');
  assert.equal(await pos(), '51%');
  await cmp.scrollIntoViewIfNeeded();
  const box = await cmp.boundingBox();
  await page.mouse.click(box.x + box.width * 0.2, box.y + box.height / 2);
  assert.ok(parseFloat(await pos()) < 30, 'click near the left edge should move the divider left');
});

await step('mobile menu opens, closes on Escape and returns focus to the toggle', async () => {
  await page.goto(BASE + '/');
  await page.click('[data-menu-toggle]');
  await page.locator('[data-menu] a[href="/services/"]').waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  await page.locator('[data-menu] a[href="/services/"]').waitFor({ state: 'hidden' });
  assert.equal(await page.evaluate(() => document.activeElement?.hasAttribute('data-menu-toggle')), true);
});

await step('quote form shows errors, then submits with step 1 only', async () => {
  await page.goto(BASE + '/quote/');
  await page.click('[data-quote-form] button[type="submit"]');
  assert.match(await page.locator('[data-error-for="phone"]').innerText(), /Australian phone/);
  await page.fill('#q-name', 'Smoke Test');
  await page.fill('#q-phone', '0491 570 156');
  await page.fill('#q-job', 'Leaking shower through the hallway wall');
  await page.waitForTimeout(3100); // spam guard: minimum fill time
  await page.click('[data-quote-form] button[type="submit"]');
  await page.locator('[data-done]').waitFor({ state: 'visible' });
  assert.match(await page.locator('[data-done-ref]').innerText(), /^L-/);
});

await step('service quote button pre-selects the service', async () => {
  await page.goto(BASE + '/quote/?service=carpentry-and-joinery');
  assert.equal(await page.locator('#q-service').inputValue(), 'carpentry-and-joinery');
});

await step('lead appears in the console; status can change', async () => {
  await page.goto(BASE + '/console/');
  await page.click('[data-signin] button[type="submit"]');
  const row = page.locator('[data-lead-id]').filter({ hasText: 'Smoke Test' });
  await row.first().click();
  await page.locator('[data-set-status="contacted"]').click();
  await page.locator('[data-detail] .tag', { hasText: 'Contacted' }).waitFor();
});

await step('emergency toggle hides the banner on the public site', async () => {
  await page.click('[data-tab="settings"]');
  const toggle = page.locator('input[name="emergencyEnabled"]');
  if (await toggle.isChecked()) await page.locator('.toggle').click();
  await page.click('[data-settings] button[type="submit"]');
  await page.goto(BASE + '/');
  assert.equal(await page.locator('[data-live="emergency"]').first().isVisible(), false);
  await page.goto(BASE + '/console/');
  await page.click('[data-tab="settings"]');
  await page.locator('.toggle').click();
  await page.click('[data-settings] button[type="submit"]');
  await page.goto(BASE + '/');
  assert.equal(await page.locator('.emergency').isVisible(), true);
});

await step('no uncaught JavaScript errors', async () => {
  assert.deepEqual(errors, []);
});

await browser.close();
console.log(results.join('\n'));
if (results.some((r) => r.startsWith('✗'))) process.exit(1);
