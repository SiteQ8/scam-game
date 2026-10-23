// Builds the website into docs/: the landing page and its reading pages in English and Arabic,
// the playable game under play/, and the files GitHub Pages needs.
import { build, transform } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as R from '../site/render.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'docs');
const read = (p) => readFileSync(join(root, p), 'utf8');
const brand = JSON.parse(read('brand.json'));
const copy = JSON.parse(read('site/copy.json'));
const cards = JSON.parse(read('app/src/content/cards.json'));
const hash = (s) => createHash('sha256').update(s).digest('hex').slice(0, 10);

if (!existsSync(join(root, 'dist/index.html'))) throw new Error('dist/ is missing: run npm run build first');
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'assets/fonts'), { recursive: true });
mkdirSync(join(out, 'img'), { recursive: true });

// Pieces of the game rendered at build time, so the page reads fully without script.
const ssr = await build({ entryPoints: [join(root, 'site/src/ssr.ts')], bundle: true, format: 'esm', platform: 'node', write: false, target: 'node20', logLevel: 'silent' });
const G = await import(`data:text/javascript;base64,${Buffer.from(ssr.outputFiles[0].text).toString('base64')}`);

// Script, style and fonts.
// The browser only needs a few icons and strings, so the bundle gets just those.
const ICON_KEYS = ['shield-alert', 'triangle-alert', 'info', 'check'];
const STRING_KEYS = ['levelHigh', 'levelMedium', 'levelLow', 'noFlags', 'checkerDisclaimer'];
const slim = {
  name: 'slim',
  setup(b) {
    b.onResolve({ filter: /icons\.generated$|i18n\/strings$/ }, (a) => ({ path: a.path, namespace: 'slim' }));
    b.onLoad({ filter: /.*/, namespace: 'slim' }, (a) => {
      if (a.path.endsWith('icons.generated')) {
        const all = G.ICONS;
        return { contents: `export const ICONS = ${JSON.stringify(Object.fromEntries(ICON_KEYS.map((k) => [k, all[k]])))};`, loader: 'js' };
      }
      return { contents: `export const S = ${JSON.stringify(Object.fromEntries(STRING_KEYS.map((k) => [k, G.S[k]])))};`, loader: 'js' };
    });
  },
};
const js = (await build({ entryPoints: [join(root, 'site/src/site.ts')], bundle: true, format: 'esm', minify: true, target: 'es2020', write: false, legalComments: 'none', logLevel: 'silent', plugins: [slim] })).outputFiles[0].text;
writeFileSync(join(out, 'assets/site.js'), js);
const langJs = (await transform(read('site/assets/lang.js'), { minify: true, target: 'es2015' })).code;
writeFileSync(join(out, 'assets/lang.js'), langJs);

const WEIGHTS = /-(700|wght)-normal\.woff2/;
const fontRules = read('app/src/styles/fonts.css').split('\n').filter((l) => l.startsWith('@font-face') && WEIGHTS.test(l));
for (const rule of fontRules) {
  const file = rule.match(/fonts\/([^)]+\.woff2)/)[1];
  copyFileSync(join(root, 'app/src/assets/fonts', file), join(out, 'assets/fonts', file));
}
// The font licence travels with the font files.
for (const file of ['OFL-aref-ruqaa.txt', 'OFL-readex-pro.txt']) copyFileSync(join(root, 'app/src/assets/fonts', file), join(out, 'assets/fonts', file));
const fontsCss = `/* Aref Ruqaa and Readex Pro, SIL Open Font License 1.1 */\n${fontRules.join('\n').replaceAll('../assets/fonts/', 'fonts/')}\n`;
const css = (await transform(fontsCss + read('site/assets/site.css'), { loader: 'css', minify: true, target: ['chrome105', 'safari15.4', 'firefox110'] })).code;
writeFileSync(join(out, 'assets/site.css'), css);

// Pictures: real screens of the game captured by tools/marketing/capture.mjs, plus the icons.
const shots = join(root, 'site/img');
// The JSON files beside the pictures (sizes, credits, where each picture comes from) stay in the source.
if (existsSync(shots)) cpSync(shots, join(out, 'img'), { recursive: true, filter: (src) => !src.endsWith('.json') });
for (const f of ['icon-32.png', 'icon-180.png', 'icon-192.png', 'icon-512.png']) copyFileSync(join(root, 'app/public/img', f), join(out, 'img', f));
copyFileSync(join(root, 'assets/icon-only.png'), join(out, 'img/icon-1024.png'));
const trailerDir = join(root, 'store/trailer');
const trailer = ['en', 'ar'].every((l) => existsSync(join(trailerDir, `trailer-${l}.mp4`)) && existsSync(join(trailerDir, `poster-${l}.webp`)));
if (trailer) {
  mkdirSync(join(out, 'media'), { recursive: true });
  for (const l of ['en', 'ar']) for (const f of [`trailer-${l}.mp4`, `poster-${l}.webp`]) copyFileSync(join(trailerDir, f), join(out, 'media', f));
}
writeFileSync(join(out, 'img/mark-flat.svg'), R.MARK_SVG().replace('<svg class=""', '<svg xmlns="http://www.w3.org/2000/svg"').replace(' aria-hidden="true" focusable="false"', ''));
const manifest = existsSync(join(shots, 'manifest.json')) ? JSON.parse(readFileSync(join(shots, 'manifest.json'), 'utf8')) : {};
// The swipe drawn by tools/marketing/loop.mjs, when it exists: its size per language.
const loops = existsSync(join(shots, 'loop.json')) ? JSON.parse(readFileSync(join(shots, 'loop.json'), 'utf8')) : {};

// Example messages for the live checker come from real cards, so they match the game.
const cardText = G.cardText;
// A textarea cannot hold markup, so Arabic examples isolate their phone numbers and addresses
// with the invisible Unicode marks LRI and PDI; they read left to right inside the Arabic.
const PHONE_RUN = /\+\s?\d[\d\s•()]{5,}\d/g;
const isolateRuns = (text) => text.replace(PHONE_RUN, (m) => `\u2066${m}\u2069`);
// A text box breaks an address at its hyphens; an invisible word joiner after each hyphen and slash keeps it whole.
const ADDRESS = /(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s،,]*)?|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const keepAddresses = (text) => text.replace(ADDRESS, (m) => m.replace(/([-/])(?=.)/g, '$1\u2060'));
// The text box sets each line's direction from its first letter, so a line with no Arabic letters starts with a right to left mark.
const rightAligned = (text) => text.split('\n').map((line) => (line.trim() && !/[\u0600-\u06FF]/.test(line) ? `\u200F${line}` : line)).join('\n');
const byId = new Map(cards.map((c) => [c.id, c]));
const pickExamples = () => {
  const chosen = [];
  const take = (pred) => { const c = cards.find((x) => pred(x) && !chosen.includes(x)); if (c) chosen.push(c); };
  for (const id of ['sms-parcel-redelivery-fee', 'sms-bank-otp-own-purchase']) if (byId.has(id)) chosen.push(byId.get(id));
  take((c) => c.verdict === 'scam' && c.category === 'prize' && ['sms', 'social', 'email'].includes(c.channel));
  take((c) => c.verdict === 'scam' && c.category === 'family' && c.channel === 'chat');
  take((c) => c.verdict === 'scam' && c.category === 'government' && c.channel === 'sms');
  return chosen.slice(0, 4);
};
const exampleCards = pickExamples();

// Pieces of the game's own interface for the feature tiles, in each language.
const svgIcon = (name) => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${G.ICONS[name] || ''}</svg>`;
const CHANNEL_ICON = { sms: 'message-square', notification: 'bell', chat: 'message-circle', email: 'mail', call: 'phone', web: 'globe', qr: 'qr-code', social: 'users', market: 'shopping-bag' };
/** A real card's message with its warning signs marked and numbered the way the game numbers them, in reading order. */
function markedMessage(id, lang) {
  const card = byId.get(id);
  const block = card[lang];
  const nums = G.markNumbers(card, lang);
  let html = R.esc(block.card.body);
  block.signals.forEach((s, i) => {
    const m = R.esc(s.mark);
    if (!html.includes(m)) return;
    const ltr = /^[^\u0600-\u06FF]*$/.test(s.mark) ? ' dir="ltr"' : '';
    html = html.replace(m, `<mark${ltr}><span class="n">${nums[i]}</span>${m}</mark>`);
  });
  return html;
}
function ui(lang) {
  const S = G.S;
  return {
    icon: svgIcon,
    channels: Object.keys(CHANNEL_ICON).map((ch) => ({ icon: CHANNEL_ICON[ch], name: G.CHANNEL_NAMES[ch][lang] })),
    listen: S.listen[lang],
    marked: markedMessage('sms-parcel-redelivery-fee', lang),
    packs: ['banking', 'delivery', 'ai'].map((id, i) => ({ id, icon: G.PACKS.find((p) => p.id === id).icon, name: S[`pack_${id}`][lang], pearls: [3, 2, 1][i] })),
    rank: G.RANKS[1][lang],
    level: S.levelN[lang].replace('{n}', '4'),
    players: (lang === 'ar' ? ['نورة', 'فهد', 'جدتي'] : ['Noura', 'Fahad', 'Grandma']).map((name, i) => ({ name, score: [4, 3, 5][i] })),
    family: S.familyMode[lang],
    familySub: S.familyModeSub[lang],
    privacy: S.noData[lang],
  };
}

function stores(lang) {
  const list = [];
  // The App Store record exists before the app is out, so its link waits for appStoreLive, as Play waits for playLive.
  if (brand.appStoreId && brand.appStoreLive) list.push({ label: 'App Store', url: `https://apps.apple.com/app/id${brand.appStoreId}` });
  if (brand.playLive) list.push({ label: 'Google Play', url: `https://play.google.com/store/apps/details?id=${brand.appId}&hl=${lang}` });
  return list;
}

function jsonld(lang) {
  const name = lang === 'ar' ? brand.nameAr || brand.nameEn : brand.nameEn;
  if (!name) return '';
  return JSON.stringify({
    '@context': 'https://schema.org', '@type': 'VideoGame', name, description: copy.meta_desc[lang], inLanguage: ['ar', 'en'],
    gamePlatform: ['iOS', 'Android', 'Web browser'], applicationCategory: 'GameApplication', operatingSystem: 'iOS, Android',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, author: { '@type': 'Person', name: copy.sign_name[lang] },
    ...(R.siteBase(brand) ? { url: `${R.siteBase(brand)}${lang === 'ar' ? 'ar/' : ''}` } : {}),
  }).replace(/</g, '\\u003c');
}

const day = G.dayIndex(new Date());
function context(lang, path) {
  const depth = (lang === 'ar' ? 1 : 0) + (path ? path.split('/').filter(Boolean).length : 0);
  const t = R.translator(copy, lang, copy.mail_subject[lang]);
  const examples = exampleCards.map((c) => ({ text: keepAddresses(lang === 'ar' ? rightAligned(isolateRuns(cardText(c, lang))) : cardText(c, lang)), label: G.CATEGORY_NAMES[c.category]?.[lang] || c.category }));
  return {
    lang, path, t, brand, root: '../'.repeat(depth),
    hash: { css: hash(css), js: hash(js), lang: hash(langJs) },
    examples, checkerHtml: examples.length ? G.render(examples[0].text, lang, copy.sc_empty[lang]).html : '',
    stages: (manifest[lang] || {}).stages || {}, loop: loops[lang] || null, ui: ui(lang), stores: stores(lang), storesLive: stores(lang).length > 0,
    trailer, cardCount: cards.length, pressShots: ['home', 'card', 'debrief', 'call', 'packs', 'badges', 'certificate', 'family'],
    jsonld: path === '' ? jsonld(lang) : '',
  };
}

const pages = [['', R.homePage], ['privacy/', R.privacyPage], ['support/', R.supportPage], ['press/', R.pressPage]];
for (const lang of ['en', 'ar']) {
  for (const [path, fn] of pages) {
    const dir = join(out, lang === 'ar' ? 'ar' : '', path);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), fn(context(lang, path)));
  }
}

// The not found page answers any path, so it links from the site root.
const repoName = (brand.repo || '').split('/')[1] || '';
const nfRoot = brand.domain ? '/' : `/${repoName}/`;
const nfCtx = { ...context('en', ''), root: nfRoot, jsonld: '' };
const nfAr = R.translator(copy, 'ar');
writeFileSync(join(out, '404.html'), R.notFoundPage(nfCtx).replace('</main>', `  <div lang="ar" dir="rtl"><p><b>${nfAr('nf_title')}</b></p><p>${nfAr('nf_p')}</p><p><a href="${nfRoot}ar/">${nfAr('nf_btn')}</a></p></div>\n</main>`));

// The game itself, playable in the browser.
cpSync(join(root, 'dist'), join(out, 'play'), { recursive: true });

// Files GitHub Pages and crawlers read.
writeFileSync(join(out, '.nojekyll'), '');
if (brand.domain) {
  writeFileSync(join(out, 'CNAME'), `${brand.domain}\n`);
  const urls = ['', 'privacy/', 'support/', 'press/'].flatMap((p) => [`https://${brand.domain}/${p}`, `https://${brand.domain}/ar/${p}`]);
  writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
  writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: https://${brand.domain}/sitemap.xml\n`);
} else {
  writeFileSync(join(out, 'robots.txt'), 'User-agent: *\nAllow: /\n');
}

const count = (dir) => readdirSync(dir, { recursive: true }).length;
console.log(`site built: ${count(out)} files, ${exampleCards.length} checker examples, case #${Math.max(1, G.caseNumber(day))}${brand.domain ? `, domain ${brand.domain}` : ', no domain yet'}`);
