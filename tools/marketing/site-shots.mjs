// Full page screenshots of the built website for review.
// usage: node tools/marketing/site-shots.mjs <outdir> [path=''] [widths=1440,768,390]
import { launch } from '../lib/env.mjs';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const [out = '.work/site-shots', path = '', widthsArg = '1440,768,390'] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(out, { recursive: true });
const server = spawn('python3', ['-m', 'http.server', '8895', '--bind', '127.0.0.1', '--directory', 'docs'], { stdio: 'ignore' });
await sleep(900);
const browser = await launch([]);
for (const lang of ['en', 'ar']) {
  for (const w of widthsArg.split(',').map(Number)) {
    const h = w >= 1200 ? 900 : w >= 700 ? 1024 : 844;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: lang === 'ar' ? 'ar-KW' : 'en-GB', isMobile: w < 700, hasTouch: w < 700 });
    await ctx.addInitScript(() => { try { localStorage.setItem('site.lang', 'chosen'); } catch {} });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(`http://127.0.0.1:8895/${lang === 'ar' ? 'ar/' : ''}${path}`, { waitUntil: 'networkidle' });
    // scroll through so lazy pictures and entrances run, then back to the top
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(h * 0.7)) { await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y); await sleep(220); }
    // Viewport frames as a visitor sees them (sticky panels stay put), one per screen height.
    const name = `${lang}-${path.replace(/\//g, '') || 'home'}-${w}`;
    let k = 0;
    for (let y = 0; y < total; y += h) {
      await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y);
      await sleep(w >= 700 ? 1500 : 900);
      await page.screenshot({ path: `${out}/${name}-f${String(k++).padStart(2, '0')}.png` });
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await sleep(600);
    console.log(lang, w, 'height', total, errs.length ? `errors: ${errs.join(' | ')}` : '');
    await ctx.close();
  }
}
await browser.close();
server.kill();
