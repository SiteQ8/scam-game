// Page templates for the website. Every visible word comes from site/copy.json in both languages.
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ESC[c]);

export const EMAIL = 'site@hotmail.com';

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
    return s;
  };
  t.raw = raw;
  return t;
}

export const MARK_SVG = (cls = '') => `<svg class="${cls}" viewBox="0 0 1024 1024" aria-hidden="true" focusable="false"><rect width="1024" height="1024" fill="#0F1624"/><g transform="rotate(-8 470 500)"><rect x="262" y="186" width="420" height="566" rx="78" fill="#FBFAF7"/><rect x="338" y="318" width="252" height="40" rx="20" fill="#A3ABB8"/><rect x="312" y="408" width="322" height="96" rx="26" fill="#FFD43B"/><rect x="338" y="436" width="252" height="40" rx="20" fill="#141820"/><rect x="338" y="558" width="172" height="40" rx="20" fill="#A3ABB8"/></g><g transform="rotate(-14 694 704)"><circle cx="694" cy="704" r="148" fill="none" stroke="#E5484D" stroke-width="40"/><circle cx="694" cy="704" r="97" fill="none" stroke="#E5484D" stroke-width="16"/><path d="M656 666 732 742 M732 666 656 742" stroke="#E5484D" stroke-width="30" stroke-linecap="round"/></g></svg>`;

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
    "font-src 'self'", "media-src 'self'", "frame-src 'self'", "connect-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'none'",
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
<meta name="theme-color" content="#f4f3f0">
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
<link rel="preload" href="${root}assets/fonts/${lang === 'ar' ? 'alexandria-arabic-wght-normal' : 'alexandria-latin-wght-normal'}.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${root}assets/fonts/ibm-plex-sans-arabic-${lang === 'ar' ? 'arabic' : 'latin'}-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${root}assets/site.css?v=${ctx.hash.css}">
${page === 'home' && lang === 'en' ? `<script src="${root}assets/lang.js?v=${ctx.hash.lang}"></script>\n` : ''}<script type="module" src="${root}assets/site.js?v=${ctx.hash.js}"></script>
${ctx.jsonld ? `<script type="application/ld+json">${ctx.jsonld}</script>\n` : ''}</head>`;
}

function footer(ctx) {
  const { t, root, lang } = ctx;
  const pre = lang === 'ar' ? `${root}ar/` : root;
  const repo = ctx.brand.repo ? `<a href="https://github.com/${esc(ctx.brand.repo)}">${t('foot_code')}</a>` : '';
  return `<footer class="foot">
  <p class="what">${t('foot_what')}</p>
  <nav aria-label="${esc(t.raw('foot_what'))}"><a href="${root}play/?lang=${lang}">${t('foot_play')}</a><a href="${pre}privacy/">${t('foot_privacy')}</a><a href="${pre}support/">${t('foot_support')}</a><a href="${pre}press/">${t('foot_press')}</a>${repo}</nav>
  <p class="copy">${t('foot_copy')}</p>
</footer>`;
}

const img = (ctx, file, alt, { cls = '', w = 440, h = 956, lazy = true, priority = false } = {}) =>
  `<img class="${cls}" src="${ctx.root}img/${ctx.lang}/${file}.webp" width="${w}" height="${h}" alt="${esc(alt)}" decoding="async"${lazy ? ' loading="lazy"' : ''}${priority ? ' fetchpriority="high"' : ''}>`;

function stageBar(ctx) {
  const { t } = ctx;
  // Built the same on any day, so CI can compare the site byte for byte: the browser fills in today's number and date.
  return `<figcaption class="bar"><span><b data-case-n>${t('bar_today')}</b><span data-case-sep hidden>${ctx.lang === 'ar' ? '، ' : ', '}</span><span data-case-date></span></span><span>${t('bar_note')}</span></figcaption>`;
}

export const HERO_SHOTS = [['home', 'shot_home'], ['card', 'shot_card'], ['debrief', 'shot_debrief']];
export const TOUR = [
  { id: 'how', shot: 'results', alt: 'shot_results' },
  { id: 'f1', shot: 'chat', alt: 'shot_chat' },
  { id: 'f2', shot: 'call', alt: 'shot_call' },
  { id: 'f3', shot: 'debrief2', alt: 'shot_debrief' },
  { id: 'f4', shot: 'journey', alt: 'shot_journey' },
  { id: 'f5', shot: 'party', alt: 'shot_party' },
  { id: 'f6', shot: 'settings', alt: 'shot_settings' },
];

function slip(ctx) {
  const { t } = ctx;
  const row = (r, v) => `<tr><td><span class="row"><span class="what">${t(r)}</span><span class="lead" aria-hidden="true"></span><span class="val">${v}</span></span></td></tr>`;
  const grid = `<span class="grid" role="img" aria-label="${esc(t.raw('slip_grid_label'))}">${[1, 1, 0, 1, 1, 1, 0, 1, 0, 1].map((ok) => `<i${ok ? '' : ' class="x"'}></i>`).join('')}</span>`;
  return `<div class="slip rv" style="--d:2">
  <table>
    <tbody><tr><th scope="rowgroup">${t('slip_g1')}</th></tr>${row('slip_r1', t('slip_v1'))}${row('slip_r2', t('slip_v2'))}</tbody>
    <tbody><tr><th scope="rowgroup">${t('slip_g2')}</th></tr>${row('slip_r3', t('slip_v3'))}${row('slip_r4', t('slip_v4'))}${row('slip_r5', t('slip_v5'))}</tbody>
    <tbody><tr><th scope="rowgroup">${t('slip_g3')}</th></tr>${row('slip_r6', t('slip_v6'))}${row('slip_r7', grid)}</tbody>
  </table>
  <p class="total"><span>${t('slip_total')}</span><span>${t('slip_total_v')}</span></p>
</div>`;
}

function module(ctx, n) {
  const { t } = ctx;
  const crop = ctx.crops[`f${n}`] || { w: 360, h: 180 };
  return `<article class="mod" data-shot="f${n}">
  <div class="panel rv">${img(ctx, `crop-f${n}`, t.raw(TOUR[n].alt), { w: crop.w, h: crop.h })}</div>
  <div class="txt rv" style="--d:1"><h3>${t(`f${n}_h`)}</h3><p>${t(`f${n}_p1`)}</p><p>${t(`f${n}_p2`)}</p></div>
</article>`;
}

export function homePage(ctx) {
  const { t, root, lang } = ctx;
  const play = `${root}play/?lang=${lang}`;
  const name = brandName(ctx);
  const faqs = Array.from({ length: 12 }, (_, i) => i + 1)
    .map((i) => `<p><b>${t(`q${i}`)}</b> ${i === 12 ? t(ctx.storesLive ? 'a12_live' : 'a12_soon') : t(`a${i}`)}</p>`)
    .join('\n    ');
  const soon = `<p class="soon"><span class="dot" aria-hidden="true"></span>${t('soon_apps')}</p>`;
  const stores = ctx.stores.length
    ? `<p class="stores">${ctx.stores.map((s) => `<a href="${esc(s.url)}">${esc(s.label)}</a>`).join('')}</p>`
    : soon;
  return `${head(ctx, { title: t.raw('meta_title'), desc: t.raw('meta_desc'), page: 'home' })}
<body>
<a class="skip" href="#hero">${t('skip')}</a>
<main>
<div class="split split-hero">
  <div class="sheet">
    <nav class="topbar" aria-label="${esc(t.raw('nav_label'))}">
      <div class="side"><a class="wide" href="#how">${t('nav_how')}</a><a class="wide" href="#features">${t('nav_features')}</a></div>
      ${wordmark(ctx)}
      <div class="side"><a class="wide" href="#faq">${t('nav_faq')}</a>${langSwitch(ctx)}</div>
    </nav>
    <section id="hero" class="hero" tabindex="-1" aria-labelledby="hero-h">
      <h1 id="hero-h">${t('hero_h1')}</h1>
      <p class="lede">${t('hero_sub')}</p>
      <div class="actions">
        <a class="btn" href="${play}">${t('cta_primary')}</a>
        <a class="link" href="#check">${t('hero_check')}</a>
      </div>
      ${ctx.storesLive ? '' : soon}
    </section>
  </div>
  <figure class="stage on-dark" data-stage="hero" aria-label="${esc(t.raw('stage_label'))}">
    <div class="phone-wrap"><div class="phone"><div class="screen">
      ${HERO_SHOTS.map(([f, a], i) => img(ctx, f, t.raw(a), { cls: i === 0 ? 'on' : '', lazy: i !== 0, priority: i === 0 })).join('\n      ')}
    </div></div></div>
    ${stageBar(ctx)}
  </figure>
</div>

<section id="check" class="showcase on-dark-left" aria-labelledby="sc-h">
  <h2 id="sc-h" class="sc-h"><span class="a">${t('sc_a')}</span> <span class="b">${t('sc_b')}</span></h2>
  <div class="sc-in on-dark">
    <label class="sr-only" for="sc-input">${t('sc_label')}</label>
    <textarea id="sc-input" rows="7" dir="auto" spellcheck="false" autocomplete="off" autocapitalize="off">${esc(ctx.examples[0].text)}</textarea>
    <p class="hint">${t('sc_hint')}</p>
    <div class="examples" role="group" aria-label="${esc(t.raw('sc_try'))}">
      ${ctx.examples.map((e, i) => `<button type="button" data-example="${i}" aria-pressed="${i === 0}">${esc(e.label)}</button>`).join('')}
    </div>
  </div>
  <div class="sc-out">
    <div class="chk" data-ui id="sc-result" aria-label="${esc(t.raw('sc_fragment'))}" role="region">${ctx.checkerHtml}</div>
    <p class="sr-only" aria-live="polite" id="sc-live"></p>
    <p class="note">${t('sc_note')}</p>
  </div>
</section>
<script type="application/json" id="sc-examples">${JSON.stringify(ctx.examples.map((e) => e.text)).replace(/</g, '\\u003c')}</script>

<div class="split tour">
  <div class="column">
    <section id="how" class="how" data-shot="how" aria-labelledby="how-h">
      <h2 id="how-h" class="rv">${t('how_h2')}</h2>
      <p class="rv" style="--d:1">${t('how_p')}</p>
      ${slip(ctx)}
    </section>
    <section id="features" class="features" aria-labelledby="feat-h">
      <h2 id="feat-h" class="rv">${t('feat_h2')}</h2>
      ${[1, 2, 3, 4, 5, 6].map((n) => module(ctx, n)).join('\n      ')}
    </section>
  </div>
  <figure class="stage on-dark" data-stage="tour" aria-hidden="true">
    <div class="phone-wrap"><div class="phone"><div class="screen">
      ${TOUR.map((s, i) => `<img class="${i === 0 ? 'on' : ''}" data-for="${s.id}" src="${root}img/${lang}/${s.shot}.webp" width="440" height="956" alt="" decoding="async" loading="lazy">`).join('\n      ')}
    </div></div></div>
    ${stageBar(ctx)}
  </figure>
</div>

<section class="letter" aria-labelledby="letter-h">
  <h2 id="letter-h" class="sr-only">${t('letter_label')}</h2>
  ${MARK_SVG('seal rv')}
  <p class="rv">${t('letter_1')}</p>
  <p class="rv">${t('letter_2')}</p>
  <p class="rv">${t('letter_3')}</p>
  <p class="rv">${t('letter_4')}</p>
  <p class="sign rv"><span class="name">${t('sign_name')}</span><span class="role">${t('sign_role')}</span></p>
</section>

<section id="faq" class="faq" aria-labelledby="faq-h">
  <h2 id="faq-h" class="rv">${t('faq_h2')}</h2>
  <div class="cols rv" style="--d:1">
    ${faqs}
  </div>
</section>

<section class="cta" aria-labelledby="cta-h">
  <div class="cta-copy">
    <h2 id="cta-h" class="rv"><span>${t('cta_h2_1')}</span> <span>${t('cta_h2_2')}</span></h2>
    <p class="rv" style="--d:1">${t('cta_p')}</p>
    <a class="btn rv" style="--d:2" href="${play}">${t('cta_primary')}</a>
    ${stores}
  </div>
  <div class="cta-app rv" style="--d:1">
    <div class="app-frame" data-ui>
      ${img(ctx, 'onboarding', t.raw('shot_onboarding'))}
      <iframe data-src="${play}" title="${esc(t.raw('cta_frame'))}" tabindex="-1" loading="lazy" referrerpolicy="same-origin"></iframe>
    </div>
  </div>
</section>
</main>
${footer(ctx)}
</body>
</html>
`;
}

function simplePage(ctx, { title, desc, page, body }) {
  const { t } = ctx;
  return `${head(ctx, { title, desc, page })}
<body class="page">
<a class="skip" href="#main">${t('skip')}</a>
<header class="topbar">
  <div class="side"><a href="${ctx.root}${ctx.lang === 'ar' ? 'ar/' : ''}">${t('home_link')}</a></div>
  ${wordmark(ctx)}
  <div class="side">${langSwitch(ctx)}</div>
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
<body class="page">
<main id="main" class="notfound">
  ${MARK_SVG('seal')}
  <h1>${t('nf_title')}</h1>
  <p>${t('nf_p')}</p>
  <p><a class="btn" href="${ctx.root}${ctx.lang === 'ar' ? 'ar/' : ''}">${t('nf_btn')}</a></p>
</main>
</body>
</html>
`;
}
