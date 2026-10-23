// Store screenshots and the Google Play feature graphic, drawn from the real app screens in the pearl world.
// usage: node tools/marketing/store-shots.mjs [capture dir] [out dir]
// Needs a capture (tools/marketing/capture.mjs).
// Writes <out>/screenshots/app-store/<locale>/NN-<screen>.png at 1320x2868 (iPhone 6.9 inch),
//        <out>/screenshots/google-play/<locale>/NN-<screen>.png at 1080x1920 (phone, 9:16),
//        <out>/graphics/feature-graphic-<lang>.png at 1024x500.
// The first picture opens with the waterline of the website; the others are chapters of one colour each.
import { launch } from '../lib/env.mjs';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { MARK_SVG } from '../../site/render.mjs';
import { FACES, DISPLAY, TEXT, C, FIELDS, WATERLINE, esc } from './look.mjs';

const [capture = '.work/capture', out = 'store'] = process.argv.slice(2).map((p) => resolve(p));
const root = resolve('.');
const captions = JSON.parse(readFileSync(join(root, 'tools/marketing/store-captions.json'), 'utf8'));
const copy = JSON.parse(readFileSync(join(root, 'site/copy.json'), 'utf8'));
const brand = JSON.parse(readFileSync(join(root, 'brand.json'), 'utf8'));

const FORMATS = {
  'app-store': { w: 1320, h: 2868, pad: 112, top: 150, h1: 150, sub: 54, phoneTop: 730, bottom: 96, locales: { en: 'en-US', ar: 'ar-SA' }, max: 10 },
  'google-play': { w: 1080, h: 1920, pad: 80, top: 96, h1: 100, sub: 38, phoneTop: 486, bottom: 60, locales: { en: 'en-US', ar: 'ar' }, max: 8 },
};
// The colour of each picture after the first, in order.
const ORDER = ['sea', 'mist', 'cloth', 'sea', 'brass', 'mist', 'sea', 'cloth', 'mist'];

/** The headline with one word in the field's marking colour. */
function headline(text, word) {
  if (!word || !text.includes(word)) return esc(text);
  const at = text.indexOf(word);
  return `${esc(text.slice(0, at))}<em>${esc(word)}</em>${esc(text.slice(at + word.length))}`;
}

function phoneCss(f, shadow) {
  const phoneH = f.h - f.phoneTop - f.bottom;
  return `.phone { position: absolute; top: ${f.phoneTop}px; left: 50%; transform: translateX(-50%); height: ${phoneH}px; padding: ${Math.round(phoneH * 0.0116)}px; border-radius: ${Math.round(phoneH * 0.064)}px; background: ${C.phone};${shadow ? ` box-shadow: 0 ${Math.round(phoneH * 0.03)}px ${Math.round(phoneH * 0.06)}px -${Math.round(phoneH * 0.02)}px rgba(16, 37, 43, 0.34);` : ''} }
.phone img { display: block; height: 100%; aspect-ratio: 440 / 956; border-radius: ${Math.round(phoneH * 0.053)}px; }`;
}

function shotPage(f, lang, c, i) {
  const ar = lang === 'ar';
  const screen = `file://${join(capture, lang, `${c.screen}.png`)}`;
  const h1 = Math.round(f.h1 * (ar ? 0.94 : 1));
  if (i === 0) {
    // The waterline: the first line above the surface in the cloth's red, the second under it in pearl.
    const seam = Math.round(f.top + f.h1 * 1.42);
    return `<!doctype html><html lang="${lang}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>${FACES}
* { margin: 0; box-sizing: border-box; }
body { width: ${f.w}px; height: ${f.h}px; overflow: hidden; position: relative; background: ${C.sea}; font-family: ${TEXT}; }
.above { position: absolute; inset: 0 0 auto; height: ${seam}px; background: ${C.mist}; }
.l { position: absolute; inset-inline: ${f.pad}px; font: 700 ${h1}px/${ar ? 1.32 : 1} ${DISPLAY}; letter-spacing: ${ar ? 0 : '-0.015em'}; white-space: nowrap; }
.l1 { color: ${C.cloth}; }
.l2 { color: ${C.pearl}; }
.copy p { position: absolute; inset-inline: ${f.pad}px; font-size: ${f.sub}px; line-height: 1.4; color: ${C.onSea2}; text-wrap: balance; }
${phoneCss(f, false)}
</style><script>${WATERLINE}</script></head><body data-seam="${seam}" data-gap="${Math.round(f.h1 * 0.16)}" data-after="${Math.round(f.sub * 0.7)}">
<div class="above"></div>
<div class="copy"><div class="l l1">${esc(copy.hero_l1[lang])}</div><div class="l l2">${esc(copy.hero_l2[lang])}</div><p class="after">${esc(c[lang].sub)}</p></div>
<div class="phone"><img src="${screen}" alt=""></div>
</body></html>`;
  }
  const fl = FIELDS[ORDER[(i - 1) % ORDER.length]];
  return `<!doctype html><html lang="${lang}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>${FACES}
* { margin: 0; box-sizing: border-box; }
body { width: ${f.w}px; height: ${f.h}px; overflow: hidden; position: relative; background: ${fl.bg}; color: ${fl.ink}; font-family: ${TEXT}; }
.copy { position: absolute; top: ${f.top}px; inset-inline: ${f.pad}px; height: ${f.phoneTop - f.top - 48}px; display: flex; flex-direction: column; justify-content: flex-start; }
h1 { font: 700 ${h1}px/${ar ? 1.3 : 1.1} ${DISPLAY}; letter-spacing: ${ar ? 0 : '-0.015em'}; text-wrap: balance; }
h1 em { font-style: normal; color: ${fl.mark}; }
p { margin-top: ${Math.round(f.sub * 0.62)}px; font-size: ${f.sub}px; line-height: 1.4; color: ${fl.ink2}; text-wrap: balance; }
${phoneCss(f, fl.bg === C.mist || fl.bg === C.brass)}
</style></head><body>
<div class="copy"><h1>${headline(c[lang].h, c.mark?.[lang])}</h1><p>${esc(c[lang].sub)}</p></div>
<div class="phone"><img src="${screen}" alt=""></div>
</body></html>`;
}

/** The feature graphic: the waterline on the left, the debrief on a phone on the right. */
function featurePage(lang) {
  const ar = lang === 'ar';
  const screen = `file://${join(capture, lang, 'debrief.png')}`;
  const size = ar ? 82 : 92;
  const seam = 262, gap = 16;
  const name = ar ? brand.nameAr || brand.nameEn : brand.nameEn;
  return `<!doctype html><html lang="${lang}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>${FACES}
* { margin: 0; box-sizing: border-box; }
body { width: 1024px; height: 500px; overflow: hidden; position: relative; background: ${C.sea}; font-family: ${TEXT}; }
.above { position: absolute; inset: 0 0 auto; height: ${seam}px; background: ${C.mist}; }
.brand { position: absolute; top: 40px; inset-inline-start: 56px; display: flex; align-items: center; gap: 14px; color: ${C.onMist}; font: 700 28px/1.2 ${DISPLAY}; }
.brand svg { width: 48px; height: 48px; display: block; }
.l { position: absolute; inset-inline-start: 52px; font: 700 ${size}px/${ar ? 1.32 : 1} ${DISPLAY}; white-space: nowrap; letter-spacing: ${ar ? 0 : '-0.015em'}; }
.l1 { color: ${C.cloth}; }
.l2 { color: ${C.pearl}; }
.line { position: absolute; bottom: 40px; inset-inline-start: 56px; color: ${C.onSea2}; font-size: 22px; line-height: 1.4; }
.phone { position: absolute; top: 36px; inset-inline-end: 64px; width: 268px; padding: 9px; border-radius: 42px; background: ${C.phone}; }
.phone img { display: block; width: 100%; border-radius: 33px; }
</style><script>${WATERLINE}</script></head><body data-seam="${seam}" data-gap="${gap}">
<div class="above"></div>
<div class="brand">${MARK_SVG('')}${name ? `<span>${esc(name)}</span>` : ''}</div>
<div class="l l1">${esc(copy.hero_l1[lang])}</div>
<div class="l l2">${esc(copy.hero_l2[lang])}</div>
<p class="line">${esc(ar ? 'لعبة مجانية بالعربية والإنجليزية' : 'A free game in Arabic and English')}</p>
<div class="phone"><img src="${screen}" alt=""></div>
</body></html>`;
}

const browser = await launch(['--allow-file-access-from-files']);
const tmp = join(tmpdir(), 'store-shots.html');
async function render(html, w, h, file) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  writeFileSync(tmp, html);
  await page.goto(`file://${tmp}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.waterline?.());
  // Keep every headline to two lines and every line under it to two: shrink the type a step at a time if needed.
  await page.evaluate(() => {
    const fit = (el, maxLines, min) => {
      if (!el) return;
      let size = parseFloat(getComputedStyle(el).fontSize);
      const lines = () => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
      while (lines() > maxLines && size > min) { size -= 2; el.style.fontSize = `${size}px`; }
    };
    const h1 = document.querySelector('.copy h1');
    if (h1) fit(h1, 2, parseFloat(getComputedStyle(h1).fontSize) * 0.68);
    fit(document.querySelector('.copy p'), 2, 24);
  });
  await page.waitForTimeout(150);
  const overflow = await page.evaluate(() => {
    const copy = document.querySelector('.copy');
    const phone = document.querySelector('.phone');
    if (!copy || !phone) return false;
    const last = [...copy.children].at(-1).getBoundingClientRect();
    return last.bottom > phone.getBoundingClientRect().top - 8;
  });
  if (overflow) console.log('warning: text runs into the phone in', file);
  await page.screenshot({ path: file });
  await ctx.close();
}

let count = 0;
for (const [store, f] of Object.entries(FORMATS)) {
  for (const lang of ['en', 'ar']) {
    const dir = join(out, 'screenshots', store, f.locales[lang]);
    mkdirSync(dir, { recursive: true });
    for (const [i, c] of captions.slice(0, f.max).entries()) {
      if (!existsSync(join(capture, lang, `${c.screen}.png`))) { console.log('missing screen', lang, c.screen); continue; }
      await render(shotPage(f, lang, c, i), f.w, f.h, join(dir, `${String(i + 1).padStart(2, '0')}-${c.screen}.png`));
      count++;
    }
  }
}
mkdirSync(join(out, 'graphics'), { recursive: true });
for (const lang of ['en', 'ar']) { await render(featurePage(lang), 1024, 500, join(out, 'graphics', `feature-graphic-${lang}.png`)); count++; }
await browser.close();
console.log(`store images written: ${count}`);
