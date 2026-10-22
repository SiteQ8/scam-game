// Draws the link preview images (1200x630) for both languages from the real app screens.
// usage: node tools/marketing/og.mjs <capture dir> <out dir>
// Needs the site built once (docs/assets/fonts) and a capture (debrief.png per language).
import { launch } from '../lib/env.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { MARK_SVG } from '../../site/render.mjs';

const [capture = '.work/capture', out = 'site/img'] = process.argv.slice(2);
const root = resolve('.');
const copy = JSON.parse(readFileSync(join(root, 'site/copy.json'), 'utf8'));
const fonts = join(root, 'docs/assets/fonts');
const LINE = { en: 'Arabic and English · iPhone, Android and the web · Free', ar: 'بالعربية والإنجليزية · آيفون وأندرويد والويب · مجانية' };

function page(lang) {
  const ar = lang === 'ar';
  const shot = `file://${join(resolve(capture), lang, 'debrief.png')}`;
  return `<!doctype html><html lang="${lang}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
@font-face { font-family: 'Alexandria'; src: url('file://${fonts}/alexandria-latin-wght-normal.woff2') format('woff2'); font-weight: 100 900; unicode-range: U+0000-00FF; }
@font-face { font-family: 'Alexandria'; src: url('file://${fonts}/alexandria-arabic-wght-normal.woff2') format('woff2'); font-weight: 100 900; unicode-range: U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF; }
@font-face { font-family: 'Plex'; src: url('file://${fonts}/ibm-plex-sans-arabic-arabic-400-normal.woff2') format('woff2'); font-weight: 400; unicode-range: U+0600-06FF, U+FB50-FDFF, U+FE70-FEFF; }
@font-face { font-family: 'Plex'; src: url('file://${fonts}/ibm-plex-sans-arabic-latin-400-normal.woff2') format('woff2'); font-weight: 400; unicode-range: U+0000-00FF, U+2000-206F; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: #f4f3f0; color: #141820; font-family: 'Plex', sans-serif; position: relative; }
.copy { position: absolute; inset-block: 0; inset-inline-start: 0; width: 720px; padding: 64px 72px; display: flex; flex-direction: column; }
.mark { width: 76px; height: 76px; border-radius: 19px; overflow: hidden; }
.mark svg { width: 100%; height: 100%; display: block; }
h1 { margin-top: auto; font: 500 ${ar ? '80px/1.25' : '92px/0.98'} 'Alexandria', sans-serif; letter-spacing: ${ar ? '0' : '-0.025em'}; max-width: ${ar ? '13ch' : '8ch'}; }
p { margin-top: 26px; font-size: 27px; line-height: 1.45; color: #4a5361; max-width: 25em; }
.line { margin-top: 28px; font-size: 21px; color: #141820; }
.desk { position: absolute; inset-block: 0; inset-inline-end: 0; width: 448px; background: #0c111b; overflow: hidden; }
.phone { position: absolute; top: 58px; inset-inline-start: 58px; width: 332px; padding: 9px; border-radius: 50px; background: #263042; }
.phone img { display: block; width: 100%; border-radius: 41px; }
mark { background: #ffd43b; color: inherit; padding: 0 6px; border-radius: 4px; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
</style></head><body>
<div class="copy">
  <div class="mark">${MARK_SVG('')}</div>
  <h1>${copy.hero_h1[lang]}</h1>
  <p>${copy.hero_sub[lang]}</p>
  <div class="line">${LINE[lang]}</div>
</div>
<div class="desk"><div class="phone"><img src="${shot}" alt=""></div></div>
</body></html>`;
}

mkdirSync(out, { recursive: true });
const browser = await launch(['--allow-file-access-from-files']);
const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
for (const lang of ['en', 'ar']) {
  const file = join(tmpdir(), `og-${lang}.html`);
  writeFileSync(file, page(lang));
  await p.goto(`file://${file}`, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: join(out, `og-${lang}.png`) });
  console.log('og image', lang);
}
await browser.close();
