// Records real app footage for the trailer at 880x1912: the app laid out at phone size and zoomed 2x.
// Build the capture variant first:  npx vite build --mode capture
// usage: node tools/marketing/record.mjs <out dir>
// Writes <lang>-swipe.webm, <lang>-call.webm, <lang>-checker.webm and marks.json (when each action started, in seconds from the start of its video).
import { launch } from '../lib/env.mjs';
import { spawn } from 'node:child_process';
import { renameSync, writeFileSync } from 'node:fs';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const [outDir] = process.argv.slice(2);
const server = spawn('python3', ['-m', 'http.server', '8890', '--bind', '127.0.0.1', '--directory', 'dist-capture'], { stdio: 'ignore' });
await sleep(800);
const browser = await launch(['--autoplay-policy=no-user-gesture-required']);
const marks = {};
async function clip(lang, name, act) {
  const ctx = await browser.newContext({ viewport: { width: 880, height: 1912 }, deviceScaleFactor: 1, locale: lang === 'ar' ? 'ar-KW' : 'en-GB', timezoneId: 'Asia/Kuwait', recordVideo: { dir: outDir, size: { width: 880, height: 1912 } } });
  const page = await ctx.newPage();
  const t0 = Date.now();
  await page.goto('http://127.0.0.1:8890/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((l) => localStorage.setItem('game.state.v1', JSON.stringify({ settings: { lang: l, region: 'both', theme: 'dark', sfx: false, music: false, autoplay: true, haptics: false, reduceMotion: false, textScale: 1, onboarded: true }, progress: { xp: 2350 } })), lang);
  await page.addInitScript(() => { document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.zoom = '2'; }); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__nav);
  await sleep(500);
  const start = await act(page);
  const end = Date.now();
  const video = page.video();
  await ctx.close();
  const path = await video.path();
  const file = `${outDir}/${lang}-${name}.webm`;
  renameSync(path, file);
  marks[`${lang}-${name}`] = { start: (start - t0) / 1000, end: (end - t0) / 1000 };
  console.log(lang, name, marks[`${lang}-${name}`]);
}
for (const lang of ['en', 'ar']) {
  await clip(lang, 'swipe', async (page) => {
    await page.evaluate(() => window.__nav.reset({ name: 'play', mode: 'practice', ids: ['sms-parcel-redelivery-fee'] }));
    const start = Date.now();
    await sleep(1600);
    const card = await page.locator('.stage .card-wrap').boundingBox();
    const y = card.y + card.height * 0.42;
    const dir = -1;
    await page.mouse.move(card.x + card.width / 2, y);
    await page.mouse.down();
    for (let i = 1; i <= 26; i++) { await page.mouse.move(card.x + card.width / 2 + dir * i * 9, y + i * 0.8); await sleep(14); }
    await page.mouse.up();
    await sleep(4600);
    return start;
  });
  await clip(lang, 'call', async (page) => {
    await page.evaluate(() => window.__nav.reset({ name: 'play', mode: 'practice', ids: ['call-bank-fraud-otp'] }));
    const start = Date.now();
    await sleep(7000);
    return start;
  });
  await clip(lang, 'checker', async (page) => {
    await page.evaluate(() => window.__nav.reset({ name: 'checker' }));
    const start = Date.now();
    await sleep(700);
    const sample = lang === 'ar'
      ? 'عاجل: تم إيقاف بطاقتك، حدّث بياناتك خلال 24 ساعة عبر الرابط kw-card-update.top/verify وإلا سيتم حظر الحساب'
      : 'URGENT: your card is suspended. Verify your details within 24 hours at kw-card-update.top/verify or your account will be blocked.';
    await page.fill('.checker-input textarea', sample);
    await sleep(900);
    await page.click('.wrap > div > .btn-primary');
    await sleep(3200);
    return start;
  });
}
writeFileSync(`${outDir}/marks.json`, JSON.stringify(marks, null, 1));
await browser.close(); server.kill();
