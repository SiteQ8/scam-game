// Captures real screens of the game for the website, the store listings and the press kit.
// Build the capture variant first:  npx vite build --mode capture
// usage: node tools/marketing/capture.mjs [outdir] [en|ar]
// Writes <outdir>/<lang>/<name>.png at 440x956 CSS pixels, 3x, and the four stages of a case for the website,
// each element cut out at its own size.
import { launch } from '../lib/env.mjs';
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';

const OUT = process.argv[2] || '.work/capture';
const LANGS = process.argv[3] ? [process.argv[3]] : ['en', 'ar'];
const W = 440, H = 956, DPR = 3, PORT = 8898;
const BASE = `http://127.0.0.1:${PORT}/`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
if (!existsSync('dist-capture/index.html')) throw new Error('run: npx vite build --mode capture');

const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1', '--directory', 'dist-capture'], { stdio: 'ignore' });
await sleep(900);
const browser = await launch(['--autoplay-policy=no-user-gesture-required']);

const today = () => Math.floor((Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) - Date.UTC(2026, 9, 16)) / 86400000);
function settings(lang, extra = {}) {
  return { lang, region: 'both', theme: 'dark', sfx: false, music: false, autoplay: true, haptics: false, reduceMotion: false, textScale: 1, onboarded: true, ...extra };
}
// A believable player a few days in: a streak, a rank, three chapters done.
function progress() {
  const d = today();
  return {
    xp: 2350, judged: 64, right: 51, scamsCaught: 33, legitTrusted: 18, bestRun: 9,
    daily: {
      [d - 4]: { results: [true, true, true, false, true, true, true, true, false, true], score: 1180, done: true, edition: 'gcc' },
      [d - 3]: { results: [true, true, true, true, true, false, true, true, true, true], score: 1320, done: true, edition: 'gcc' },
      [d - 2]: { results: [true, false, true, true, true, true, false, true, true, true], score: 1150, done: true, edition: 'gcc' },
      [d - 1]: { results: [true, true, false, true, true, true, true, false, true, true], score: 1240, done: true, edition: 'gcc' },
    },
    dailyStreak: { current: 4, best: 6, lastDay: d - 1 },
    journey: { basics: { stars: 3, best: 10 }, delivery: { stars: 2, best: 8 }, banks: { stars: 1, best: 7 } },
    packs: { banking: { stars: 3, best: 9 }, delivery: { stars: 2, best: 8 }, ai: { stars: 1, best: 7 } },
    rushBest: 14, huntPerfect: 1, huntsPlayed: 4, partyGames: 1, checkerUses: 2, familyRounds: 0,
    cards: { 'sms-traffic-fine-gov-lookalike': { right: 0, wrong: 2 }, 'email-supplier-bank-details-change': { right: 0, wrong: 1 }, 'chat-voice-son-trip-abroad': { right: 0, wrong: 1 } },
    categories: { banking: { right: 9, wrong: 3 }, delivery: { right: 7, wrong: 1 }, family: { right: 3, wrong: 2 }, prize: { right: 4, wrong: 0 }, government: { right: 5, wrong: 2 }, jobs: { right: 2, wrong: 2 }, accounts: { right: 6, wrong: 1 } },
    achievements: { first: Date.now() - 4e8, streak3: Date.now() - 2e8, hunt: Date.now() - 1e8, party: Date.now() - 9e7, checker: Date.now() - 5e7, 'pack-banking': Date.now() - 3e7, 'pack-delivery': Date.now() - 2e7, 'pack-ai': Date.now() - 1e7 },
  };
}
// The same player some weeks on, with every chapter of the journey passed and the certificate issued.
function graduate(lang) {
  const p = progress();
  const chapters = ['basics', 'delivery', 'banks', 'official', 'calls', 'offers', 'social', 'expert'];
  p.journey = Object.fromEntries(chapters.map((id, i) => [id, { stars: [3, 2, 3, 2, 3, 2, 2, 1][i], best: [10, 8, 9, 8, 10, 9, 8, 7][i] }]));
  p.xp = 9800; p.judged = 210; p.right = 176;
  p.certificate = { name: lang === 'ar' ? 'نورة الأحمد' : 'Noura Al-Ahmad', issued: Date.now() - 864e5, serial: 'SD-K7QA-M9XR' };
  return p;
}

for (const lang of LANGS) {
  const dir = `${OUT}/${lang}`;
  mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true, locale: lang === 'ar' ? 'ar-KW' : 'en-GB', timezoneId: 'Asia/Kuwait', colorScheme: 'dark' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  const boot = async (s, p) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.evaluate((v) => localStorage.setItem('game.state.v1', v), JSON.stringify({ settings: s, progress: p }));
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__nav);
    await sleep(500);
  };
  const go = async (route, wait = 900) => { await page.evaluate((r) => window.__nav.reset(r), route); await sleep(wait); };
  const shot = async (name) => { await page.screenshot({ path: `${dir}/${name}.png` }); console.log(lang, name); };
  const practice = (ids) => go({ name: 'play', mode: 'practice', ids }, 1100);
  // A whole element, cut out at its own size, for the website's case in four stages. With a line selector the
  // crop is taken a second time with that line left out, and where the line sits is written relative to the crop.
  // With `cut`, only the kept element is drawn and everything around it is left clear, so rounded corners and the
  // card's own shadow sit on whatever field the website puts them on.
  // The website shows every card flat, with no drop shadow, so a cut-out leaves the game's shadow out.
  const CUT = (keep, drop) => `html, body { background: transparent !important; } body * { visibility: hidden !important; } ${keep}, ${keep} * { visibility: visible !important; } .stage .msg, .cloth { box-shadow: none !important; }${drop ? ` ${drop} { visibility: hidden !important; }` : ''}`;
  const stage = async (name, sel, pad = 0, lineSel = null, cut = null) => {
    await page.locator(sel).first().evaluate((e) => {
      const r = e.getBoundingClientRect();
      if (r.top < 0 || r.bottom > innerHeight) e.scrollIntoView({ block: 'center' });
    }).catch(() => {});
    await sleep(300);
    if (cut) {
      await page.evaluate((css) => {
        const st = document.createElement('style');
        st.id = 'cut-out';
        st.textContent = css;
        document.head.appendChild(st);
      }, CUT(cut.keep, cut.drop));
      await sleep(120);
    }
    const box = await page.locator(sel).first().boundingBox();
    if (!box) { console.log('no stage for', name, sel); return; }
    const x = Math.max(0, Math.floor(box.x - pad));
    const y = Math.max(0, Math.floor(box.y - pad));
    const clip = { x, y, width: Math.min(W - x, Math.ceil(box.width + pad * 2)), height: Math.min(H - y, Math.ceil(box.height + pad * 2)) };
    await page.screenshot({ path: `${dir}/stage-${name}.png`, clip, omitBackground: !!cut });
    const meta = { w: clip.width, h: clip.height, ...(cut ? { cut: true } : {}) };
    if (lineSel) {
      const line = await page.evaluate(([lineSel, ox, oy]) => {
        const el = document.querySelector(lineSel);
        if (!el) return null;
        const cs = getComputedStyle(el);
        const range = document.createRange();
        range.selectNodeContents(el);
        const r = range.getBoundingClientRect();
        const probe = document.createElement('span');
        probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
        el.appendChild(probe);
        const baseline = probe.getBoundingClientRect().bottom;
        probe.remove();
        const rtl = cs.direction === 'rtl';
        const centred = cs.textAlign === 'center';
        const out = {
          text: el.textContent, tpl: el.textContent.replace(/\d+/, '{n}'), rtl, anchor: centred ? 'middle' : 'start',
          x: (centred ? (r.left + r.right) / 2 : rtl ? r.right : r.left) - ox, y: baseline - oy,
          family: cs.fontFamily, size: parseFloat(cs.fontSize), weight: Number(cs.fontWeight), spacing: parseFloat(cs.letterSpacing) || 0, color: cs.color,
        };
        el.style.color = 'transparent';
        return out;
      }, [lineSel, clip.x, clip.y]);
      if (line) {
        await sleep(100);
        await page.screenshot({ path: `${dir}/stage-${name}-live.png`, clip, omitBackground: !!cut });
        meta.live = line;
        await page.evaluate((sel) => { document.querySelector(sel).style.color = ''; }, lineSel);
      }
    }
    if (cut) await page.evaluate(() => document.getElementById('cut-out')?.remove());
    writeFileSync(`${dir}/stage-${name}.json`, JSON.stringify(meta));
    console.log(lang, 'stage', name);
  };
  // First screen of a new player who came from the website in their language (the link carries ?lang=).
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE}?lang=${lang}`, { waitUntil: 'networkidle' });
  await sleep(1100);
  await shot('onboarding');

  await boot(settings(lang), progress());
  await go({ name: 'home' });
  await shot('home');

  // The card packs, further down the home screen.
  await page.evaluate(() => {
    const scroll = document.querySelector('.scroll');
    const title = [...document.querySelectorAll('.section-title')].find((h) => h.nextElementSibling?.classList.contains('pack-grid'));
    if (scroll && title) scroll.scrollTo({ top: title.offsetTop - 84 });
  });
  await sleep(500);
  await shot('packs');

  // Badges and the level.
  await go({ name: 'badges' }, 1100);
  await shot('badges');
  await go({ name: 'tips' });
  await shot('tips');

  // A card, the swipe in progress, and the verdict with its marks.
  await practice(['sms-parcel-redelivery-fee']);
  await shot('card');
  await stage('k1', '.stage .msg', 0, null, { keep: '.stage .card-pos', drop: '.stage .stamp' });
  const card = await page.locator('.stage .card-wrap').boundingBox();
  await page.mouse.move(card.x + card.width / 2, card.y + card.height * 0.42);
  await page.mouse.down();
  await page.mouse.move(card.x + card.width / 2 - 70, card.y + card.height * 0.42 + 6, { steps: 10 });
  await sleep(250);
  await shot('drag');
  // The second stage: the card past the line with its label at full strength, cut out on its own with clear
  // corners. It is held in the middle and drawn a little smaller, so the tilted card stays whole on the screen.
  await page.mouse.move(card.x + card.width / 2 - 112, card.y + card.height * 0.42 + 8, { steps: 6 });
  await sleep(250);
  await page.evaluate(() => {
    const wrap = document.querySelector('.stage .card-wrap');
    const rot = (wrap.style.transform.match(/rotate\(([-\d.]+)deg\)/) || [])[1] || '-5.6';
    wrap.style.transform = `translate3d(0, 4px, 0) rotate(${rot}deg) scale(0.86)`;
  });
  await page.evaluate((css) => {
    const st = document.createElement('style');
    st.id = 'cut-out';
    st.textContent = css;
    document.head.appendChild(st);
  }, CUT('.stage .card-pos'));
  await sleep(200);
  {
    const box = await page.evaluate(() => {
      const els = [document.querySelector('.stage .msg'), ...document.querySelectorAll('.stage .stamp')];
      const rs = els.filter(Boolean).map((e) => e.getBoundingClientRect()).filter((r) => r.width && r.height);
      const stamps = [...document.querySelectorAll('.stage .stamp')].filter((e) => Number(getComputedStyle(e).opacity) > 0.05).map((e) => e.getBoundingClientRect());
      const use = [rs[0], ...stamps];
      return { x: Math.min(...use.map((r) => r.left)), y: Math.min(...use.map((r) => r.top)), r: Math.max(...use.map((r) => r.right)), b: Math.max(...use.map((r) => r.bottom)) };
    });
    const pad = 22;
    const x = Math.max(0, Math.floor(box.x - pad));
    const y = Math.max(0, Math.floor(box.y - pad));
    const clip = { x, y, width: Math.min(W - x, Math.ceil(box.r - box.x + pad * 2)), height: Math.min(H - y, Math.ceil(box.b - box.y + pad * 2)) };
    await page.screenshot({ path: `${dir}/stage-k2.png`, clip, omitBackground: true });
    writeFileSync(`${dir}/stage-k2.json`, JSON.stringify({ w: clip.width, h: clip.height, cut: true }));
    console.log(lang, 'stage', 'k2');
  }
  await page.evaluate(() => document.getElementById('cut-out')?.remove());
  await page.mouse.move(card.x + card.width / 2, card.y + card.height * 0.42, { steps: 6 });
  await page.mouse.up();
  await sleep(700);
  await page.click('.verdict-btn.scam');
  await sleep(2200);
  await shot('debrief');
  // The sheet steps down to a peek, so the whole card shows its numbered marks.
  await page.click('.sheet-handle');
  await sleep(900);
  // This stage is about the marks, so the verdict labels step aside for the picture.
  await stage('k3', '.stage .msg', 0, null, { keep: '.stage .card-pos', drop: '.stage .stamp' });

  // A genuine message: green signs and a trap.
  await practice(['sms-bank-otp-own-purchase']);
  await page.click('.verdict-btn.legit');
  await sleep(2200);
  await shot('debrief2');

  for (const [name, id] of [['chat', 'chat-hi-mum-new-number'], ['email', 'email-supplier-bank-details-change'], ['web', 'web-bank-login-lookalike-padlock'], ['qr', 'qr-parking-meter-sticker'], ['social', 'social-giveaway-fake-badge'], ['market', 'market-buyer-overpay-refund']]) {
    await practice([id]);
    await shot(name);
  }

  // A call, part way through.
  await practice(['call-bank-fraud-otp']);
  await sleep(7500);
  await shot('call');

  await go({ name: 'journey' });
  await shot('journey');

  await go({ name: 'hunt' }, 1200);
  const marks = page.locator('[data-i]');
  if ((await marks.count()) > 1) { await marks.nth(0).click(); await sleep(400); await marks.nth(1).click(); await sleep(700); }
  await shot('hunt');

  await go({ name: 'partySetup' });
  const names = lang === 'ar' ? ['نورة', 'فهد', 'جدتي'] : ['Noura', 'Fahad', 'Grandma'];
  const inputs = page.locator('.player-row input');
  await inputs.nth(0).fill(names[0]);
  await inputs.nth(1).fill(names[1]);
  await page.locator('.players .btn-secondary').click();
  await sleep(200);
  await page.locator('.player-row input').nth(2).fill(names[2]);
  await page.locator('.player-row input').nth(2).blur();
  await sleep(400);
  await shot('party');

  await go({ name: 'checker' });
  const sample = lang === 'ar'
    ? 'عاجل: تم إيقاف بطاقتك، حدّث بياناتك خلال 24 ساعة عبر الرابط kw-card-update.top/verify وإلا سيتم حظر الحساب'
    : 'URGENT: your card is suspended. Verify your details within 24 hours at kw-card-update.top/verify or your account will be blocked.';
  await page.fill('.checker-input textarea', sample);
  await page.click('.wrap > div > .btn-primary');
  await sleep(1400);
  await page.evaluate(() => document.querySelector('.scroll')?.scrollTo({ top: 0 }));
  await sleep(300);
  await shot('checker');

  await go({ name: 'stats' });
  await shot('stats');
  await go({ name: 'settings' });
  await shot('settings');
  await go({ name: 'about' });
  await shot('about');

  // Family mode: larger text and calmer motion on the same home screen.
  await boot(settings(lang, { family: true }), progress());
  await go({ name: 'home' });
  await shot('family');

  // The certificate after the whole journey, with the player's name on it.
  await boot(settings(lang), graduate(lang));
  await go({ name: 'certificate' }, 2600);
  await shot('certificate');

  await boot(settings(lang), progress());

  // The daily case played through, so the closed case and its share grid show.
  await go({ name: 'home' });
  const plan = await page.evaluate(() => window.__daily.dailyDeck(window.__daily.dayIndex(), 'gcc', window.__cards.filter((c) => !c.pack)).map((c) => c.verdict));
  await go({ name: 'play', mode: 'daily' }, 1100);
  for (let i = 0; i < plan.length; i++) {
    const wrong = i === 2 || i === 7;
    const say = wrong ? (plan[i] === 'scam' ? 'legit' : 'scam') : plan[i];
    await page.click(`.verdict-btn.${say}`);
    await sleep(1300);
    await page.click('.bottom-bar .btn-primary');
    await sleep(900);
  }
  // The finished strand catches the light pearl by pearl; the pictures wait until it has.
  await sleep(2600);
  await shot('results');
  // The finished strand on its cloth, the last stage of a case.
  await stage('k4', '.result-cloth', 0, '#res-h', { keep: '.result-cloth' });

  if (errors.length) console.log(lang, 'page errors:', errors.join('\n'));
  await ctx.close();
}
await browser.close();
server.kill();
