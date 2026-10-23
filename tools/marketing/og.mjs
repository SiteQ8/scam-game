// Draws the link preview images (1200x630) for both languages from the real app screens, in the pearl world:
// the waterline of the website's first screen, with the game's own debrief on a phone.
// usage: node tools/marketing/og.mjs <capture dir> <out dir>
// Needs a capture (debrief.png per language).
import { launch } from '../lib/env.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { MARK_SVG } from '../../site/render.mjs';
import { FACES, DISPLAY, TEXT, C, WATERLINE, esc } from './look.mjs';

const [capture = '.work/capture', out = 'site/img'] = process.argv.slice(2);
const root = resolve('.');
const copy = JSON.parse(readFileSync(join(root, 'site/copy.json'), 'utf8'));
const brand = JSON.parse(readFileSync(join(root, 'brand.json'), 'utf8'));
// True before and after the store release: the line names no platform.
const LINE = { en: 'Arabic and English, free, with no ads and no account', ar: 'بالعربية والإنجليزية، مجانية بلا إعلانات ولا حساب' };
const W = 1200, H = 630, SEAM = 330, GAP = 20;

function page(lang) {
  const ar = lang === 'ar';
  const shot = `file://${join(resolve(capture), lang, 'debrief.png')}`;
  const size = ar ? 100 : 112;
  const name = ar ? brand.nameAr || brand.nameEn : brand.nameEn;
  return `<!doctype html><html lang="${lang}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>${FACES}
* { margin: 0; box-sizing: border-box; }
body { width: ${W}px; height: ${H}px; overflow: hidden; position: relative; background: ${C.sea}; font-family: ${TEXT}; }
.above { position: absolute; inset: 0 0 auto; height: ${SEAM}px; background: ${C.mist}; }
.brand { position: absolute; top: 48px; inset-inline-start: 64px; display: flex; align-items: center; gap: 16px; color: ${C.onMist}; font: 700 34px/1.2 ${DISPLAY}; }
.brand svg { width: 56px; height: 56px; display: block; }
.l { position: absolute; inset-inline-start: 60px; font: 700 ${size}px/${ar ? 1.32 : 1} ${DISPLAY}; white-space: nowrap; letter-spacing: ${ar ? 0 : '-0.015em'}; }
.l1 { color: ${C.cloth}; }
.l2 { color: ${C.pearl}; }
.line { position: absolute; bottom: 52px; inset-inline-start: 64px; max-width: 600px; color: ${C.onSea2}; font-size: 24px; line-height: 1.4; }
.phone { position: absolute; top: 46px; inset-inline-end: 84px; width: 318px; padding: 10px; border-radius: 48px; background: ${C.phone}; }
.phone img { display: block; width: 100%; border-radius: 38px; }
</style><script>${WATERLINE}</script></head><body data-seam="${SEAM}" data-gap="${GAP}">
<div class="above"></div>
<div class="brand">${MARK_SVG('')}${name ? `<span>${esc(name)}</span>` : ''}</div>
<div class="l l1">${esc(copy.hero_l1[lang])}</div>
<div class="l l2">${esc(copy.hero_l2[lang])}</div>
<p class="line">${esc(LINE[lang])}</p>
<div class="phone"><img src="${shot}" alt=""></div>
</body></html>`;
}

mkdirSync(out, { recursive: true });
const browser = await launch(['--allow-file-access-from-files']);
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
for (const lang of ['en', 'ar']) {
  const file = join(tmpdir(), `og-${lang}.html`);
  writeFileSync(file, page(lang));
  await p.goto(`file://${file}`, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => window.waterline());
  await p.waitForTimeout(300);
  await p.screenshot({ path: join(out, `og-${lang}.png`) });
  console.log('og image', lang);
}
await browser.close();
