// Store screenshots and the Google Play feature graphic, drawn from the real app screens.
// usage: node tools/marketing/store-shots.mjs [capture dir] [out dir]
// Needs a capture (tools/marketing/capture.mjs) and the site built once (docs/assets/fonts for the typefaces).
// Writes <out>/screenshots/app-store/<locale>/NN-<screen>.png at 1320x2868 (iPhone 6.9 inch),
//        <out>/screenshots/google-play/<locale>/NN-<screen>.png at 1080x1920 (phone, 9:16),
//        <out>/graphics/feature-graphic-<lang>.png at 1024x500.
import { launch } from '../lib/env.mjs';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { MARK_SVG } from '../../site/render.mjs';

const [capture = '.work/capture', out = 'store'] = process.argv.slice(2).map((p) => resolve(p));
const root = resolve('.');
const fonts = join(root, 'docs/assets/fonts');
if (!existsSync(fonts)) throw new Error('build the site first: node scripts/build-site.mjs');
const captions = JSON.parse(readFileSync(join(root, 'tools/marketing/store-captions.json'), 'utf8'));
const copy = JSON.parse(readFileSync(join(root, 'site/copy.json'), 'utf8'));

const FORMATS = {
  'app-store': { w: 1320, h: 2868, pad: 112, top: 150, h1: 150, sub: 54, phoneTop: 730, bottom: 96, locales: { en: 'en-US', ar: 'ar-SA' }, max: 10 },
  'google-play': { w: 1080, h: 1920, pad: 80, top: 96, h1: 100, sub: 38, phoneTop: 486, bottom: 60, locales: { en: 'en-US', ar: 'ar' }, max: 8 },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const FACES = `
@font-face { font-family: 'Alexandria'; src: url('file://${fonts}/alexandria-latin-wght-normal.woff2') format('woff2'); font-weight: 100 900; unicode-range: U+0000-00FF, U+2000-206F; }
@font-face { font-family: 'Alexandria'; src: url('file://${fonts}/alexandria-arabic-wght-normal.woff2') format('woff2'); font-weight: 100 900; unicode-range: U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF; }
@font-face { font-family: 'Plex'; src: url('file://${fonts}/ibm-plex-sans-arabic-arabic-400-normal.woff2') format('woff2'); font-weight: 400; unicode-range: U+0600-06FF, U+FB50-FDFF, U+FE70-FEFF; }
@font-face { font-family: 'Plex'; src: url('file://${fonts}/ibm-plex-sans-arabic-latin-400-normal.woff2') format('woff2'); font-weight: 400; unicode-range: U+0000-00FF, U+2000-206F; }`;

/** The headline with the marker behind one word, as the site and the debrief do. */
function headline(text, word) {
  if (!word || !text.includes(word)) return esc(text);
  const at = text.indexOf(word);
  return `${esc(text.slice(0, at))}<mark>${esc(word)}</mark>${esc(text.slice(at + word.length))}`;
}

function shotPage(f, lang, c) {
  const ar = lang === 'ar';
  const phoneH = f.h - f.phoneTop - f.bottom;
  const screen = `file://${join(capture, lang, `${c.screen}.png`)}`;
  return `<!doctype html><html lang="${lang}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>${FACES}
* { margin: 0; box-sizing: border-box; }
body { width: ${f.w}px; height: ${f.h}px; overflow: hidden; background: #f4f3f0; color: #141820; position: relative; font-family: 'Plex', sans-serif; }
.copy { position: absolute; top: ${f.top}px; inset-inline: ${f.pad}px; height: ${f.phoneTop - f.top - 48}px; display: flex; flex-direction: column; justify-content: flex-start; }
h1 { font: 500 ${Math.round(f.h1 * (ar ? 0.94 : 1))}px/${ar ? 1.3 : 1.04} 'Alexandria', sans-serif; letter-spacing: ${ar ? 0 : '-0.022em'}; text-wrap: balance; }
p { margin-top: ${Math.round(f.sub * 0.62)}px; font-size: ${f.sub}px; line-height: 1.4; color: #4a5361; text-wrap: balance; }
mark { background: #ffd43b; color: inherit; padding: 0 0.12em; border-radius: 0.06em; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.phone { position: absolute; top: ${f.phoneTop}px; left: 50%; transform: translateX(-50%); height: ${phoneH}px; padding: ${Math.round(phoneH * 0.0116)}px; border-radius: ${Math.round(phoneH * 0.064)}px; background: #1b2130;
  box-shadow: 0 ${Math.round(phoneH * 0.03)}px ${Math.round(phoneH * 0.06)}px -${Math.round(phoneH * 0.02)}px rgba(20, 24, 32, 0.38), 0 0 0 ${Math.max(2, Math.round(phoneH * 0.0015))}px #0b0f17; }
.phone img { display: block; height: 100%; aspect-ratio: 440 / 956; border-radius: ${Math.round(phoneH * 0.053)}px; }
</style></head><body>
<div class="copy"><h1>${headline(c[lang].h, c.mark?.[lang])}</h1><p>${esc(c[lang].sub)}</p></div>
<div class="phone"><img src="${screen}" alt=""></div>
</body></html>`;
}

function featurePage(lang) {
  const ar = lang === 'ar';
  const screen = `file://${join(capture, lang, 'debrief.png')}`;
  const word = ar ? 'الاحتيال' : 'scams';
  return `<!doctype html><html lang="${lang}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>${FACES}
* { margin: 0; box-sizing: border-box; }
body { width: 1024px; height: 500px; overflow: hidden; background: #f4f3f0; color: #141820; position: relative; font-family: 'Plex', sans-serif; }
.copy { position: absolute; inset-block: 0; inset-inline-start: 0; width: 600px; padding: 56px 64px; display: flex; flex-direction: column; }
.mark { width: 64px; height: 64px; border-radius: 16px; overflow: hidden; }
.mark svg { width: 100%; height: 100%; display: block; }
h1 { margin-top: auto; font: 500 ${ar ? '62px/1.3' : '70px/1.0'} 'Alexandria', sans-serif; letter-spacing: ${ar ? 0 : '-0.025em'}; max-width: ${ar ? '11ch' : '8ch'}; }
mark { background: #ffd43b; color: inherit; padding: 0 0.1em; border-radius: 0.06em; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
p { margin-top: 18px; font-size: 22px; line-height: 1.4; color: #4a5361; }
.desk { position: absolute; inset-block: 0; inset-inline-end: 0; width: 400px; background: #0c111b; overflow: hidden; }
.phone { position: absolute; top: 44px; inset-inline-start: 62px; width: 276px; padding: 8px; border-radius: 42px; background: #263042; }
.phone img { display: block; width: 100%; border-radius: 34px; }
</style></head><body>
<div class="copy"><div class="mark">${MARK_SVG('')}</div><h1>${headline(copy.hero_h1[lang], word)}</h1><p>${esc(ar ? 'لعبة مجانية بالعربية والإنجليزية' : 'A free game in Arabic and English')}</p></div>
<div class="desk"><div class="phone"><img src="${screen}" alt=""></div></div>
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
  // Keep every headline to two lines and every line under it to two: shrink the type a step at a time if needed.
  await page.evaluate(() => {
    const fit = (el, maxLines, min) => {
      if (!el) return;
      let size = parseFloat(getComputedStyle(el).fontSize);
      const lines = () => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
      while (lines() > maxLines && size > min) { size -= 2; el.style.fontSize = `${size}px`; }
    };
    fit(document.querySelector('.copy h1'), 2, parseFloat(getComputedStyle(document.querySelector('.copy h1')).fontSize) * 0.68);
    fit(document.querySelector('.copy p'), 2, 24);
  });
  await page.waitForTimeout(150);
  const overflow = await page.evaluate(() => {
    const copy = document.querySelector('.copy');
    return copy ? copy.scrollHeight > copy.clientHeight + 1 : false;
  });
  if (overflow) console.log('warning: text runs past its area in', file);
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
      await render(shotPage(f, lang, c), f.w, f.h, join(dir, `${String(i + 1).padStart(2, '0')}-${c.screen}.png`));
      count++;
    }
  }
}
mkdirSync(join(out, 'graphics'), { recursive: true });
for (const lang of ['en', 'ar']) { await render(featurePage(lang), 1024, 500, join(out, 'graphics', `feature-graphic-${lang}.png`)); count++; }
await browser.close();
console.log(`store images written: ${count}`);
