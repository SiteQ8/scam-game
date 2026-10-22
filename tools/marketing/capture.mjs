// Captures real screens of the game for the website, the store listings and the press kit.
// Build the capture variant first:  npx vite build --mode capture
// usage: node tools/marketing/capture.mjs [outdir] [en|ar]
// Writes <outdir>/<lang>/<name>.png at 440x956 CSS pixels, 3x, plus small crops for the website.
import { launch } from '../lib/env.mjs';
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';

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
    daily: { [d - 1]: { results: [true, true, false, true, true, true, true, false, true, true], score: 1240, done: true, edition: 'gcc' } },
    dailyStreak: { current: 4, best: 6, lastDay: d - 1 },
    journey: { basics: { stars: 3, best: 10 }, delivery: { stars: 2, best: 8 }, banks: { stars: 1, best: 7 } },
    rushBest: 14, huntPerfect: 1, huntsPlayed: 4, partyGames: 1, checkerUses: 2,
    cards: { 'sms-traffic-fine-gov-lookalike': { right: 0, wrong: 2 }, 'email-supplier-bank-details-change': { right: 0, wrong: 1 }, 'chat-voice-son-trip-abroad': { right: 0, wrong: 1 } },
    categories: { banking: { right: 9, wrong: 3 }, delivery: { right: 7, wrong: 1 }, family: { right: 3, wrong: 2 }, prize: { right: 4, wrong: 0 }, government: { right: 5, wrong: 2 }, jobs: { right: 2, wrong: 2 }, accounts: { right: 6, wrong: 1 } },
    achievements: { first: Date.now() - 4e8, streak3: Date.now() - 2e8, hunt: Date.now() - 1e8, party: Date.now() - 9e7, checker: Date.now() - 5e7 },
  };
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
  const crop = async (name, sel, h, pad = 0) => {
    const box = await page.locator(sel).first().boundingBox();
    if (!box) { console.log('no crop for', name, sel); return; }
    // The element's whole width, so no line is cut off; the website scales the crop to 360 px.
    const x = Math.max(0, box.x - pad);
    const width = Math.min(W - x, box.width + pad * 2);
    await page.screenshot({ path: `${dir}/crop-${name}.png`, clip: { x, y: Math.max(0, box.y - pad), width, height: h } });
    console.log(lang, 'crop', name);
  };
  const practice = (ids) => go({ name: 'play', mode: 'practice', ids }, 1100);

  // First screen of a new player who came from the website in their language (the link carries ?lang=).
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE}?lang=${lang}`, { waitUntil: 'networkidle' });
  await sleep(1100);
  await shot('onboarding');

  await boot(settings(lang), progress());
  await go({ name: 'home' });
  await shot('home');

  // A card, the swipe in progress, and the verdict with its marks.
  await practice(['sms-parcel-redelivery-fee']);
  await shot('card');
  const card = await page.locator('.stage .card-wrap').boundingBox();
  await page.mouse.move(card.x + card.width / 2, card.y + card.height * 0.42);
  await page.mouse.down();
  await page.mouse.move(card.x + card.width / 2 - 70, card.y + card.height * 0.42 + 6, { steps: 10 });
  await sleep(250);
  await shot('drag');
  await page.mouse.move(card.x + card.width / 2, card.y + card.height * 0.42, { steps: 6 });
  await page.mouse.up();
  await sleep(700);
  await page.click('.verdict-btn.scam');
  await sleep(2200);
  await shot('debrief');
  await crop('f3', '.sheet .signals', 196);

  // A genuine message: green signs and a trap.
  await practice(['sms-bank-otp-own-purchase']);
  await page.click('.verdict-btn.legit');
  await sleep(2200);
  await shot('debrief2');

  for (const [name, id] of [['chat', 'chat-hi-mum-new-number'], ['email', 'email-supplier-bank-details-change'], ['web', 'web-bank-login-lookalike-padlock'], ['qr', 'qr-parking-meter-sticker'], ['social', 'social-giveaway-fake-badge'], ['market', 'market-buyer-overpay-refund']]) {
    await practice([id]);
    await shot(name);
    if (name === 'chat') await crop('f1', '.stage .msg', 200);
  }

  // A call, part way through.
  await practice(['call-bank-fraud-otp']);
  await sleep(7500);
  await shot('call');
  await crop('f2', '.stage .msg', 200);

  await go({ name: 'journey' });
  await shot('journey');
  await crop('f4', '.route', 200, 4);

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
  await crop('f5', '.players', 196, 6);

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
  await crop('f6', '.panel.prose', 168, 2);

  // The daily case played through, so the closed case and its share grid show.
  await go({ name: 'home' });
  const plan = await page.evaluate(() => window.__daily.dailyDeck(window.__daily.dayIndex(), 'gcc', window.__cards).map((c) => c.verdict));
  await go({ name: 'play', mode: 'daily' }, 1100);
  for (let i = 0; i < plan.length; i++) {
    const wrong = i === 2 || i === 7;
    const say = wrong ? (plan[i] === 'scam' ? 'legit' : 'scam') : plan[i];
    await page.click(`.verdict-btn.${say}`);
    await sleep(1300);
    await page.click('.bottom-bar .btn-primary');
    await sleep(900);
  }
  await sleep(1200);
  await shot('results');

  if (errors.length) console.log(lang, 'page errors:', errors.join('\n'));
  await ctx.close();
}
await browser.close();
server.kill();
