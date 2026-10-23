// Page templates for the website. Every visible word comes from site/copy.json in both languages.
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ESC[c]);

export const EMAIL = 'site@hotmail.com';
// Names that read as one word in either language, so a line never breaks inside them.
const KEEP_TOGETHER = /App Store|Google Play|CC BY 4\.0|Wikimedia Commons|Aref Ruqaa|Readex Pro|SIL Open Font License/g;

/** A translator for one language. Tokens: {email}, {mark}..{/mark}, {mail}..{/mail}, and {name} style variables. */
export function translator(copy, lang, mailSubject) {
  const raw = (key, vars = {}) => {
    const rec = copy[key];
    if (!rec || typeof rec[lang] !== 'string' || !rec[lang].trim()) throw new Error(`copy is missing ${key}.${lang}`);
    let s = rec[lang];
    for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
    return s;
  };
  const t = (key, vars) => {
    let s = esc(raw(key, vars));
    s = s.replace(/\{email\}/g, `<a href="mailto:${EMAIL}">${EMAIL}</a>`);
    s = s.replace(/\{mark\}(.*?)\{\/mark\}/g, '<mark>$1</mark>');
    s = s.replace(/\{mail\}(.*?)\{\/mail\}/g, `<a href="mailto:${EMAIL}?subject=${encodeURIComponent(mailSubject || '')}">$1</a>`);
    return s.replace(KEEP_TOGETHER, (m) => m.replace(/ /g, '\u00a0'));
  };
  t.raw = raw;
  return t;
}

let markN = 0;
/** The game's mark: a brass loupe over a pearl, on the merchant's red cloth. */
export const MARK_SVG = (cls = '') => {
  const id = `m${markN++}`;
  return `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs><radialGradient id="${id}p" cx="0.36" cy="0.32" r="0.72"><stop offset="0" stop-color="#ffffff"/><stop offset="0.2" stop-color="#f6efe3"/><stop offset="0.62" stop-color="#dccfbc"/><stop offset="1" stop-color="#b3a48c"/></radialGradient></defs><rect width="64" height="64" fill="#7c1424"/><path d="M38.6 38.6 50 50" stroke="#c9a45c" stroke-width="7" stroke-linecap="round"/><circle cx="28" cy="28" r="15" fill="none" stroke="#c9a45c" stroke-width="4.5"/><circle cx="28" cy="28" r="9.5" fill="url(#${id}p)"/></svg>`;
};

/** One pearl and one dull bead, drawn once per page and used wherever a strand appears. */
const PEARL_DEFS = `<svg class="defs" width="0" height="0" aria-hidden="true" focusable="false"><defs><radialGradient id="lustre" cx="0.36" cy="0.32" r="0.72"><stop offset="0" stop-color="#ffffff"/><stop offset="0.2" stop-color="#f6efe3"/><stop offset="0.64" stop-color="#ddd1bf"/><stop offset="1" stop-color="#b3a48c"/></radialGradient><radialGradient id="dull" cx="0.38" cy="0.32" r="0.72"><stop offset="0" stop-color="#8f979a"/><stop offset="0.6" stop-color="#626b6e"/><stop offset="1" stop-color="#4a5255"/></radialGradient></defs><symbol id="pearl" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="url(#lustre)"/></symbol><symbol id="bead" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8.6" fill="url(#dull)"/></symbol><symbol id="seat" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5.6" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol></svg>`;
/** A strand drawn as one picture: a brass thread and its seats, 1 for a pearl, 0 for a dull bead, null for a seat still waiting.
 * In Arabic the strand fills from the right, as the game's does. */
const strand = (seats, cls = '', rtl = false) => {
  const list = rtl ? [...seats].reverse() : seats;
  const w = list.length * 24;
  const uses = list.map((v, i) => `<use href="#${v === 1 ? 'pearl' : v === 0 ? 'bead' : 'seat'}" x="${i * 24 + 2}" y="2" width="20" height="20"/>`).join('');
  return `<svg class="strand ${cls}" viewBox="0 0 ${w} 24" aria-hidden="true" focusable="false"><path d="M8 12H${w - 8}" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>${uses}</svg>`;
};

/** Ten pearls on a brass thread, graduated like a necklace: today's case before it is played. */
const necklace = (cls = '') => {
  const n = 10;
  const gap = 5;
  const sizes = Array.from({ length: n }, (_, i) => 28 * (0.6 + 0.4 * (1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2))));
  let x = 2;
  const uses = sizes.map((s) => { const u = `<use href="#pearl" x="${x.toFixed(1)}" y="${((32 - s) / 2).toFixed(1)}" width="${s.toFixed(1)}" height="${s.toFixed(1)}"/>`; x += s + gap; return u; }).join('');
  const w = Math.ceil(x - gap + 2);
  return `<svg class="necklace ${cls}" viewBox="0 0 ${w} 32" width="${w}" height="32" aria-hidden="true" focusable="false"><path d="M6 16H${w - 6}" stroke="currentColor" stroke-width="1.5" opacity="0.7"/>${uses}</svg>`;
};

function brandName(ctx) {
  const b = ctx.brand;
  return ctx.lang === 'ar' ? b.nameAr || b.nameEn || '' : b.nameEn || '';
}

function wordmark(ctx) {
  const name = brandName(ctx);
  const label = name ? '' : ` aria-label="${esc(ctx.t.raw('home_link'))}"`;
  return `<a class="wordmark" href="${ctx.root}${ctx.lang === 'ar' ? 'ar/' : ''}"${label}>${MARK_SVG()}${name ? `<span>${esc(name)}</span>` : ''}</a>`;
}

/** Where the same page lives in the other language, relative to this page. */
function otherHref(ctx) {
  const p = ctx.path; // '' for home, 'privacy/' etc.
  return ctx.lang === 'ar' ? `${ctx.root}${p}` : `${ctx.root}ar/${p}`;
}

function langSwitch(ctx, cls = '') {
  const other = ctx.lang === 'ar' ? 'en' : 'ar';
  return `<a class="${cls}" href="${otherHref(ctx)}" hreflang="${other}" lang="${other}" data-lang-switch="${other}" aria-label="${esc(ctx.t.raw('lang_other_label'))}">${esc(ctx.t.raw('lang_other'))}</a>`;
}

/** Where the site is served: the chosen domain, or the repository's GitHub Pages address until there is one. */
export function siteBase(brand) {
  if (brand.domain) return `https://${brand.domain}/`;
  const [owner, repo] = (brand.repo || '').split('/');
  return owner && repo ? `https://${owner.toLowerCase()}.github.io/${repo}/` : null;
}

function absolute(ctx, path) {
  const base = siteBase(ctx.brand);
  return base ? `${base}${path}` : null;
}

export function head(ctx, { title, desc, page }) {
  const { lang, root, t } = ctx;
  const enPath = ctx.path;
  const arPath = `ar/${ctx.path}`;
  // The not found page answers every missing address, so it names no address of its own.
  const listed = page !== '404';
  const absEn = listed ? absolute(ctx, enPath) : null;
  const absAr = listed ? absolute(ctx, arPath) : null;
  const self = lang === 'ar' ? absAr : absEn;
  const og = absolute(ctx, `img/og-${lang}.png`) || `${root}img/og-${lang}.png`;
  const csp = [
    "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data:",
    "font-src 'self'", "media-src 'self'", "frame-src 'self'", "connect-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'",
  ].join('; ');
  const name = brandName(ctx);
  const fullTitle = name && title !== name ? `${title} | ${name}` : title;
  return `<!doctype html>
<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}" data-page="${page}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#e7edec">
<meta name="color-scheme" content="light">
${self ? `<link rel="canonical" href="${self}">\n` : ''}${absEn && absAr ? `<link rel="alternate" hreflang="en" href="${absEn}">\n<link rel="alternate" hreflang="ar" href="${absAr}">\n<link rel="alternate" hreflang="x-default" href="${absEn}">\n` : ''}<link rel="icon" href="${root}img/icon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="${root}img/mark-flat.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${root}img/icon-180.png">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${lang === 'ar' ? 'ar_KW' : 'en_US'}">
${self ? `<meta property="og:url" content="${self}">\n` : ''}<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="${root}assets/fonts/aref-ruqaa-${lang === 'ar' ? 'arabic' : 'latin'}-700-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${root}assets/fonts/readex-pro-${lang === 'ar' ? 'arabic' : 'latin'}-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${root}assets/site.css?v=${ctx.hash.css}">
${page === 'home' && lang === 'en' ? `<script src="${root}assets/lang.js?v=${ctx.hash.lang}"></script>\n` : ''}<script type="module" src="${root}assets/site.js?v=${ctx.hash.js}"></script>
${ctx.jsonld ? `<script type="application/ld+json">${ctx.jsonld}</script>\n` : ''}</head>`;
}

/** The close of every page: a plain band of two rows. Who made it and where to go, then the time in Kuwait City and the credits. */
function footer(ctx) {
  const { t, root, lang } = ctx;
  const pre = lang === 'ar' ? `${root}ar/` : root;
  const name = brandName(ctx);
  const repo = ctx.brand.repo ? `<a href="https://github.com/${esc(ctx.brand.repo)}">${t('foot_code')}</a>` : '';
  return `<footer class="foot">
  <div class="row">
    <a class="wordmark" href="${pre}"${name ? '' : ` aria-label="${esc(t.raw('home_link'))}"`}>${MARK_SVG()}${name ? `<span>${esc(name)}</span>` : ''}</a>
    <nav aria-label="${esc(t.raw('nav_label'))}"><a href="${root}play/?lang=${lang}">${t('foot_play')}</a><a href="${pre}privacy/">${t('foot_privacy')}</a><a href="${pre}support/">${t('foot_support')}</a><a href="${pre}press/">${t('foot_press')}</a>${repo}${langSwitch(ctx)}</nav>
    <a class="mail" href="mailto:${EMAIL}">${EMAIL}</a>
  </div>
  <div class="row small">
    <p class="made">${t('foot_what')}<span class="time"><span>${t('foot_city')}</span> <span class="clock"><span class="sr-only">${t('foot_time')}: </span><span data-clock>UTC+3</span></span></span></p>
    <p class="legal"><span>${t('foot_copy')}</span><span>${t('foot_credit')}</span></p>
  </div>
</footer>`;
}

const img = (ctx, file, alt, { cls = '', w = 440, h = 956, lazy = true, priority = false, attrs = '' } = {}) =>
  `<img class="${cls}"${attrs} src="${ctx.root}img/${ctx.lang}/${file}.webp" width="${w}" height="${h}" alt="${esc(alt)}" decoding="async"${lazy ? ' loading="lazy"' : ''}${priority ? ' fetchpriority="high"' : ''}>`;

// A picture that shows today's case number is captured a second time with that line left out, and the page writes the
// line back in with the number of the day it is seen, in the same place and type. The site is built with the captured
// line, the same on any day; the browser fills in the number.
function liveLine(L, w, h) {
  const n = (v) => Math.round(v * 100) / 100;
  const style = `font-family:${L.family};font-size:${n(L.size)}px;font-weight:${L.weight};letter-spacing:${n(L.spacing)}px;fill:${L.color}`;
  return `<svg class="live" viewBox="0 0 ${w} ${h}" aria-hidden="true"><text x="${n(L.x)}" y="${n(L.y)}" direction="${L.rtl ? 'rtl' : 'ltr'}" text-anchor="${L.anchor}" style="${esc(style)}" data-case-tpl="${esc(L.tpl)}">${esc(L.text)}</text></svg>`;
}

/** The second stage as it moves: the game's card tilting towards each call. Plays while it is in view, with a control
 * to stop it; without script, or when the visitor asks for less motion, the first frame stands still. */
function stageLoop(ctx) {
  const L = ctx.loop;
  if (!L) return '';
  const { t } = ctx;
  const base = `${ctx.root}img/${ctx.lang}/swipe-loop`;
  // Where the card rests inside the picture, so the page can draw it at the size and on the line of the other cards.
  const c = L.card || { x: 0.11, y: 0.1, w: 0.78, h: 0.8 };
  const box = `--fx:${c.x};--fy:${c.y};--fw:${c.w};--fh:${c.h};--ar:${(L.h / L.w).toFixed(4)}`;
  return `<figure class="card loop" style="${box}"><video class="loop-v" width="${L.w}" height="${L.h}" muted loop playsinline disablepictureinpicture preload="none" poster="${base}.webp" aria-label="${esc(t.raw('k2_loop_alt'))}"><source src="${base}.webm" type='video/webm; codecs="vp9"'><source src="${base}.mp4" type="video/mp4"></video><button class="loop-btn" type="button" hidden data-pause="${esc(t.raw('loop_pause'))}" data-play="${esc(t.raw('loop_play'))}" aria-label="${esc(t.raw('loop_play'))}"><svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="5" width="3.5" height="14" rx="1.2"/><rect x="13.5" y="5" width="3.5" height="14" rx="1.2"/></svg><svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6Z"/></svg></button></figure>`;
}

/** One of the four stages of a case: a real crop of the game, at its own size, today's number written in when it shows one. */
function stagePicture(ctx, k, alt) {
  const meta = ctx.stages?.[k];
  if (!meta) return '';
  const live = meta.live;
  return `<figure class="card" data-ui>${img(ctx, `stage-${k}${live ? '-live' : ''}`, alt, { w: meta.w, h: meta.h })}${live ? liveLine(live, meta.w, meta.h) : ''}</figure>`;
}

// Each feature tile holds one moment of the game's own interface, all at one scale: a piece of the game, not an icon.
function fragments(ctx) {
  const u = ctx.ui;
  const { t } = ctx;
  return {
    marks: `<div class="fr fr-marks" data-ui aria-hidden="true"><p class="from" dir="auto">${u.marked.from}</p><p class="body" dir="auto">${u.marked.body}</p></div>`,
    kinds: `<ul class="fr fr-kinds" data-ui aria-hidden="true">${u.channels.map((c) => `<li>${u.icon(c.icon)}<span>${esc(c.name)}</span></li>`).join('')}</ul>`,
    call: `<div class="fr fr-call" data-ui aria-hidden="true"><span class="who"><span class="av">${u.icon('user')}</span><span><b dir="ltr">${esc(u.caller)}</b><span>${esc(u.callLabel)}</span></span></span><span class="play">${u.icon('play')}<span>${esc(u.listen)}</span></span><span class="line">${esc(u.callLine)}</span></div>`,
    journey: `<div class="fr fr-journey" data-ui aria-hidden="true"><span class="lv"><span class="lp" style="--p:0.62"><svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><use href="#pearl"/></svg></span><span><b>${esc(u.rank)}</b><span>${esc(u.level)}</span></span></span><span class="pks">${u.packs.map((pk) => `<span class="pk">${u.icon(pk.icon)}<b>${esc(pk.name)}</b>${strand([1, 1, 1].map((_, i) => (i < pk.pearls ? 1 : null)), 'three', ctx.lang === 'ar')}</span>`).join('')}</span></div>`,
    family: `<div class="fr fr-family" data-ui aria-hidden="true"><ul class="party">${u.players.map((pl, i) => `<li class="${i === 0 ? 'me' : ''}">${u.icon('user')}<span>${esc(pl.name)}</span><b>${pl.score}</b></li>`).join('')}</ul><span class="set"><span class="lbl"><b>${esc(u.family)}</b><span>${esc(u.familySub)}</span></span><span class="sw" role="presentation"></span></span></div>`,
    private: `<p class="fr fr-private" data-ui aria-hidden="true">${t('f8_frag')}</p>`,
  };
}

const TILES = [
  // [fragment, heading, line]
  ['marks', 'f3_h', 'f3_t'], ['kinds', 'f1_h', 'f1_t'], ['call', 'f2_h', 'f2_t'],
  ['journey', 'fj_h', 'fj_t'], ['family', 'ff_h', 'ff_t'], ['private', 'f8_h', 'f8_t'],
];

export function homePage(ctx) {
  const { t, root, lang } = ctx;
  const play = `${root}play/?lang=${lang}`;
  const frag = fragments(ctx);
  // The question a scam's victim needs comes first, then cost and data; on a phone the rest fold.
  const faqs = [11, 1, 3, 2, 4, 5, 6, 7, 8, 9, 10, 12]
    .map((i, k) => `<details class="qa rv" style="--d:${k % 2}" open><summary><h3>${t(`q${i}`)}</h3></summary><p>${i === 12 ? t(ctx.storesLive ? 'a12_live' : 'a12_soon') : t(`a${i}`)}</p></details>`)
    .join('\n    ');
  const k2 = ctx.stages?.k2;
  const headline = (tag, attrs) => `<${tag} class="wl-t"${attrs}><span class="ln"><span>${t('hero_l1')}</span></span><span class="ln"><span>${t('hero_l2')}</span></span></${tag}>`;
  const otherLang = lang === 'ar' ? 'en' : 'ar';
  return `${head(ctx, { title: t.raw('meta_title'), desc: t.raw('meta_desc'), page: 'home' })}
<body>
${PEARL_DEFS}
<a class="skip" href="#check">${t('skip')}</a>
<main>
<section id="hero" class="water" aria-labelledby="hero-h">
  <div class="above">${headline('h1', ' id="hero-h"')}</div>
  <div class="below">${headline('p', ' aria-hidden="true"')}
    <div class="deep">
      ${necklace('hero-strand')}
      <p class="case-line"><b data-case-n>${t('bar_today')}</b><span data-case-sep hidden>${lang === 'ar' ? '، ' : ', '}</span><span data-case-date></span></p>
      <p class="sub">${t('hero_sub')}</p>
      <a class="btn" href="${play}">${t('cta_primary')}</a>
    </div>
  </div>
  ${k2 ? `<figure class="float" aria-hidden="true"><img src="${root}img/${lang}/stage-k2.webp" width="${k2.w}" height="${k2.h}" alt="" decoding="async" fetchpriority="high"></figure>` : ''}
  <header class="bar">
    <a class="wordmark" href="${root}${lang === 'ar' ? 'ar/' : ''}"${brandName(ctx) ? '' : ` aria-label="${esc(t.raw('home_link'))}"`}>${MARK_SVG()}${brandName(ctx) ? `<span>${esc(brandName(ctx))}</span>` : ''}</a>
    <span class="acts">${langSwitch(ctx, 'lang')}</span>
  </header>
</section>

<section id="check" class="ch f-mist showcase" aria-labelledby="sc-h">
  <div class="ch-head">
    <h2 id="sc-h" class="rv">${t('hero_check')}</h2>
    <div class="tries rv" style="--d:1">
      <p class="hint" id="sc-hint">${t('sc_hint')}</p>
      <div class="examples" role="group" aria-label="${esc(t.raw('sc_try'))}">
        ${ctx.examples.map((e, i) => `<button type="button" data-example="${i}" aria-pressed="${i === 0}">${esc(e.label)}</button>`).join('')}
      </div>
    </div>
  </div>
  <div class="field">
    <label class="sr-only" for="sc-input">${t('sc_label')}</label>
    <textarea id="sc-input" data-ui rows="6" dir="auto" spellcheck="false" autocomplete="off" autocapitalize="off" aria-describedby="sc-hint" placeholder="${esc(t.raw('sc_empty'))}">${esc(ctx.examples[0].text)}</textarea>
    <p class="note">${t('sc_note')}</p>
  </div>
  <div class="answer">
    <div class="chk" data-ui id="sc-result" aria-label="${esc(t.raw('sc_fragment'))}" role="region">${ctx.checker.html}</div>
    <p class="sr-only" aria-live="polite" id="sc-live"></p>
  </div>
  <div class="signs chk" data-ui id="sc-signs">${ctx.checker.list}</div>
</section>
<script type="application/json" id="sc-examples">${JSON.stringify(ctx.examples.map((e) => e.text)).replace(/</g, '\\u003c')}</script>

<section id="how" class="how" aria-labelledby="how-h">
  <div class="fld f-sea">
    <div class="top rv"><h2 id="how-h">${t('how_h2')}</h2><p>${t('how_p')}</p></div>
    ${stagePicture(ctx, 'k1', t.raw('k1_alt'))}
    <p class="clause rv" style="--d:1">${t('hw1')}</p>
  </div>
  <div class="fld f-pearl">
    ${stageLoop(ctx) || stagePicture(ctx, 'k2', t.raw('k2_alt'))}
    <p class="clause rv" style="--d:1">${t('hw2')}</p>
  </div>
  <div class="fld f-brass">
    ${stagePicture(ctx, 'k3', t.raw('k3_alt'))}
    <p class="clause rv" style="--d:1">${t('hw3')}</p>
  </div>
  <div class="fld f-sea2">
    ${stagePicture(ctx, 'k4', t.raw('k4_alt'))}
    <p class="clause rv" style="--d:1">${t('hw4')}</p>
  </div>
</section>

<section id="eye" class="eye f-sea" aria-labelledby="eye-h">
  <figure>
    <img src="${root}img/world/pearlers-1911.webp" width="2000" height="1000" alt="${esc(t.raw('eye_alt'))}" loading="lazy" decoding="async">
    <figcaption>${t('eye_cap')}</figcaption>
  </figure>
  <h2 id="eye-h" class="rv">${t('eye_h')}</h2>
  <p class="rv" style="--d:1">${t('eye_p')}</p>
</section>

<section id="features" class="feats f-sea" aria-labelledby="feat-h">
  <h2 id="feat-h" class="rv">${t('feat_h2')}</h2>
  <div class="grid">
    ${TILES.map(([f, h, p], i) => `<article class="tile t-${f} rv" style="--d:${i % 3}">${frag[f]}<div class="cap"><h3>${t(h)}</h3><p>${t(p)}</p></div></article>`).join('\n    ')}
  </div>
</section>

<section id="about" class="about f-mist" aria-labelledby="ab-h">
  <div class="panel">
    <h2 id="ab-h" class="rv">${t('ab_h')}</h2>
    <figure class="diver">
      <div class="disc"><img src="${root}img/world/pearl-diver-1911.webp" width="1200" height="1200" alt="${esc(t.raw('ab_photo_alt'))}" loading="lazy" decoding="async"></div>
      <figcaption>${t('ab_photo_cap')}</figcaption>
    </figure>
    <div class="blocks">
      <div class="rv"><h3>${t('ab_h1')}</h3><p>${t('ab_p1')}</p></div>
      <div class="rv" style="--d:1"><h3>${t('ab_h2')}</h3><p>${t('ab_p2')}</p><p class="sign"><b>${t('sign_name')}</b><span>${t('sign_role')}</span></p></div>
      <a class="btn rv" style="--d:2" href="mailto:${EMAIL}?subject=${encodeURIComponent(t.raw('mail_subject'))}">${t('ab_btn')}</a>
    </div>
  </div>
</section>

<section id="faq" class="faq f-mist" aria-labelledby="faq-h">
  <h2 id="faq-h" class="rv">${t('faq_h2')}</h2>
  <div class="qas">
    ${faqs}
  </div>
</section>

<section class="cta f-cloth" aria-labelledby="cta-h">
  <h2 id="cta-h" class="sr-only">${t('cta_primary')}</h2>
  <form class="sentence rv" action="${root}play/" method="get">
    <span>${t('cta_lead')}</span>
    <select name="lang" aria-label="${esc(t.raw('cta_lang_label'))}"><option value="${lang}" selected>${t(`cta_in_${lang}`)}</option><option value="${otherLang}">${t(`cta_in_${otherLang}`)}</option></select>
    <button type="submit">${t('cta_go')}</button>
  </form>
  <p class="note rv" style="--d:1">${t(ctx.storesLive ? 'cta_note_live' : 'cta_note')}</p>
  ${ctx.stores.length ? `<p class="stores rv" style="--d:2">${ctx.stores.map((s) => `<a href="${esc(s.url)}">${esc(s.label)}</a>`).join('')}</p>` : ''}
</section>
</main>
${footer(ctx)}
</body>
</html>
`;
}

function simplePage(ctx, { title, desc, page, body }) {
  const { t, root, lang } = ctx;
  return `${head(ctx, { title, desc, page })}
<body class="page">
${PEARL_DEFS}
<a class="skip" href="#main">${t('skip')}</a>
<header class="bar page-bar">
  ${wordmark(ctx)}
  <span class="acts"><a class="home" href="${root}${lang === 'ar' ? 'ar/' : ''}">${t('home_link')}</a>${langSwitch(ctx, 'lang')}</span>
</header>
<main id="main" class="doc">
${body}
</main>
${footer(ctx)}
</body>
</html>
`;
}

export function privacyPage(ctx) {
  const { t } = ctx;
  const sections = [1, 2, 3, 4, 5, 6, 7].map((i) => `<h2>${t(`pv_h${i}`)}</h2>\n<p>${t(`pv_p${i}`)}</p>`).join('\n');
  return simplePage(ctx, {
    title: t.raw('pv_title'), desc: t.raw('pv_desc'), page: 'privacy',
    body: `<h1>${t('pv_title')}</h1>\n<p class="updated">${t('pv_updated')}</p>\n<p class="lead">${t('pv_lead')}</p>\n${sections}`,
  });
}

export function supportPage(ctx) {
  const { t } = ctx;
  return simplePage(ctx, {
    title: t.raw('su_title'), desc: t.raw('su_desc'), page: 'support',
    body: `<h1>${t('su_title')}</h1>
<p class="lead">${t('su_lead')}</p>
<h2>${t('su_h1')}</h2>
<p>${t('su_p1')}</p>
<h2>${t('su_h2')}</h2>
<p>${t('su_p2')}</p>
<h2>${t('su_h3')}</h2>
<ul class="fixes">${[1, 2, 3, 4, 5].map((i) => `<li>${t(`su_f${i}`)}</li>`).join('')}</ul>
<h2>${t('su_h4')}</h2>
<p>${t('su_p4')}</p>`,
  });
}

export function pressPage(ctx) {
  const { t, root, lang } = ctx;
  const name = brandName(ctx);
  const fact = (k, v) => `<dt>${t(k)}</dt><dd>${v}</dd>`;
  const shots = ctx.pressShots.map((s) => `<a href="${root}img/${lang}/${s}.webp"><img src="${root}img/${lang}/${s}.webp" width="440" height="956" alt="${esc(t.raw(`shot_${s.replace(/\d+$/, '')}`))}" loading="lazy" decoding="async"></a>`).join('');
  return simplePage(ctx, {
    title: t.raw('pr_title'), desc: t.raw('pr_desc'), page: 'press',
    body: `<h1>${t('pr_title')}</h1>
<p class="lead">${t('pr_lead')}</p>
<h2>${t('pr_h_facts')}</h2>
<dl class="facts">
${name ? fact('pr_k_name', esc(name)) : ''}${fact('pr_k_dev', t('pr_v_dev'))}${fact('pr_k_platforms', t(ctx.storesLive ? 'pr_v_platforms' : 'pr_v_platforms_soon'))}${fact('pr_k_langs', t('pr_v_langs'))}${fact('pr_k_price', t('pr_v_price'))}${fact('pr_k_content', t('pr_v_content', { cards: ctx.cardCount }))}${fact('pr_k_privacy', t('pr_v_privacy'))}${fact('pr_k_contact', `<a href="mailto:${EMAIL}">${EMAIL}</a>`)}
</dl>
<h2>${t('pr_h_about')}</h2>
<p>${t('pr_about_1')}</p>
<p>${t('pr_about_2')}</p>
${ctx.trailer ? `<h2>${t('pr_h_trailer')}</h2>
<p>${t('pr_trailer_p')}</p>
<video class="trailer" controls preload="none" playsinline width="540" height="960" poster="${root}media/poster-${lang}.webp" aria-label="${esc(t.raw('pr_trailer_label'))}"><source src="${root}media/trailer-${lang}.mp4" type="video/mp4"></video>
<ul class="downloads">
<li><a href="${root}media/trailer-en.mp4" download>${t('pr_trailer_en')}</a></li>
<li><a href="${root}media/trailer-ar.mp4" download>${t('pr_trailer_ar')}</a></li>
</ul>` : ''}
<h2>${t('pr_h_assets')}</h2>
<ul class="downloads">
<li><a href="${root}img/icon-1024.png" download>${t('pr_icon')}</a></li>
<li><a href="${root}img/mark-flat.svg" download>${t('pr_mark')}</a></li>
</ul>
<div class="shots">${shots}</div>
<h2>${t('pr_h_credits')}</h2>
<p>${t('pr_credits')}</p>`,
  });
}

export function notFoundPage(ctx) {
  const { t } = ctx;
  return `${head(ctx, { title: t.raw('nf_title'), desc: t.raw('meta_desc'), page: '404' })}
<body class="page lost">
${PEARL_DEFS}
<main id="main" class="notfound">
  ${strand([1, 1, 1, null, 1, 1, null, 1, 1, 1], 'lost-strand', ctx.lang === 'ar')}
  <h1>${t('nf_title')}</h1>
  <p>${t('nf_p')}</p>
  <p><a class="btn" href="${ctx.root}${ctx.lang === 'ar' ? 'ar/' : ''}">${t('nf_btn')}</a></p>
</main>
</body>
</html>
`;
}
