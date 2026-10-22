// Renders app screens in headless Chromium for visual checks.
// usage: node tools/shoot.mjs <outdir> <lang> <theme> [width height]
import { launch } from './lib/env.mjs';
import { mkdirSync } from 'node:fs';
const [out = '.work/shots', lang = 'en', theme = 'dark', w = '390', h = '844'] = process.argv.slice(2);
const base = process.env.BASE || 'http://127.0.0.1:8899/';
mkdirSync(out, { recursive: true });
const browser = await launch([]);
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, locale: lang === 'ar' ? 'ar-KW' : 'en-US' });
const errors = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
const state = (onboarded) => JSON.stringify({ settings: { lang, theme, onboarded, sfx: false, music: false, autoplay: false }, progress: {} });
async function open(onboarded = true) {
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate((s) => { localStorage.setItem('game.state.v1', s); }, state(onboarded));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
}
const shot = async (name) => { await page.waitForTimeout(450); await page.screenshot({ path: `${out}/${name}.png` }); console.log('shot', name); };
await open(false); await shot('01-onboarding');
await open(true); await shot('02-home');
await page.click('.case-file .btn-primary'); await page.waitForTimeout(700); await shot('03-play');
// drag the card left halfway to show the stamp preview
const box = await page.locator('.stage .card-wrap').boundingBox();
if (box) {
  await page.mouse.move(box.x + box.width / 2, box.y + 160);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 70, box.y + 165, { steps: 6 });
  await shot('04-drag');
  await page.mouse.move(box.x + box.width / 2 - 160, box.y + 170, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(1200);
  await shot('05-debrief');
}
console.log('errors:', errors.length ? errors.join('\n') : 'none');
await browser.close();
