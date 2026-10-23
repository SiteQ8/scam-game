// Draws the swipe for the website's second stage: the real card, dragged towards Scam, back, towards Genuine and
// back again, on the website's own mist so it sits in its field without an edge. The card is drawn flat, with no
// shadow, the way the website shows every card. It starts and ends at rest, so it loops without a seam. Each frame is a screenshot of the game with the card posed by the game's own drag rules
// (tilt and label strength); the card travels less than a finger would, so the whole card stays in the picture.
// Build the capture variant first:  npx vite build --mode capture
// usage: node tools/marketing/loop.mjs [out dir]
// Writes <out>/<lang>/swipe-loop.mp4, swipe-loop.webm, swipe-loop.webp and <out>/loop.json: the CSS size of the
// picture and where the card rests inside it (shares of its width and height), so the page can line it up.
import { launch } from '../lib/env.mjs';
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const OUT = resolve(process.argv[2] || 'site/img');
const MIST = '#e7edec';
const W = 720, H = 900, Z = 2; // the layout in CSS pixels, drawn twice as large
const PORT = 8899, FPS = 30;
const CARD = 408; // the card's width on a phone, as in the other three stages
const TRAVEL = 0.25; // share of the finger's travel the card shows
const DX = 112; // past the game's line, so the label shows at full strength
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
if (!existsSync('dist-capture/index.html')) throw new Error('run: npx vite build --mode capture');

// The timeline, in seconds: rest, towards Scam, hold, back, rest, towards Genuine, hold, back, rest.
const STEPS = [[0.6, 0], [0.9, -DX], [0.7, -DX], [0.7, 0], [0.5, 0], [0.9, DX], [0.7, DX], [0.7, 0], [0.7, 0]];
const LENGTH = STEPS.reduce((a, [d]) => a + d, 0);
const FRAMES = Math.round(LENGTH * FPS);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const dxAt = (s) => {
  let from = 0;
  for (const [d, to] of STEPS) {
    if (s <= d) return from + (to - from) * ease(Math.max(0, s / d));
    s -= d; from = to;
  }
  return from;
};

const work = join(tmpdir(), 'swipe-loop');
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1', '--directory', 'dist-capture'], { stdio: 'ignore' });
await sleep(900);
const browser = await launch();
const sizes = {};

for (const lang of ['en', 'ar']) {
  const frames = join(work, lang);
  rmSync(frames, { recursive: true, force: true });
  mkdirSync(frames, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: W * Z, height: H * Z }, deviceScaleFactor: 1, locale: lang === 'ar' ? 'ar-KW' : 'en-GB', timezoneId: 'Asia/Kuwait', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((l) => localStorage.setItem('game.state.v1', JSON.stringify({ settings: { lang: l, region: 'both', theme: 'dark', sfx: false, music: false, autoplay: false, haptics: false, reduceMotion: false, textScale: 1, onboarded: true }, progress: { xp: 2350 } })), lang);
  await page.addInitScript(() => { document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.zoom = '2'; }); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__nav);
  await page.evaluate(() => window.__nav.reset({ name: 'play', mode: 'practice', ids: ['sms-parcel-redelivery-fee'] }));
  await sleep(1600);
  // Only the card is drawn, on the website's mist, flat with a hairline edge; nothing moves on its own.
  await page.addStyleTag({ content: `html, body { background: ${MIST} !important; } body * { visibility: hidden !important; } .stage .card-pos, .stage .card-pos * { visibility: visible !important; } .stage .msg { max-width: ${CARD}px !important; box-shadow: 0 0 0 1px rgba(16, 37, 43, 0.12) !important; } *, *::before, *::after { transition: none !important; animation: none !important; }` });
  await sleep(400);
  const box = await page.evaluate(() => { const r = document.querySelector('.stage .msg').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });

  // The picture: the card at rest with room for its tilt, its travel and its label, the same above and below.
  const rad = (DX / 20) * Math.PI / 180;
  const halfW = (box.w / 2) * Math.cos(rad) + (box.h / 2) * Math.sin(rad) + DX * TRAVEL * Z;
  const halfH = (box.h / 2) * Math.cos(rad) + (box.w / 2) * Math.sin(rad);
  const pad = 26 * Z;
  const even = (v) => Math.round(v / 2) * 2;
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const side = pad + 16 * Z, above = pad * 0.6, below = pad * 0.6;
  const clip = { width: even(2 * (halfW + side)), height: even(2 * halfH + above + below) };
  clip.x = even(cx - clip.width / 2);
  clip.y = even(cy - halfH - above);

  for (let i = 0; i < FRAMES; i++) {
    const dx = dxAt(i / FPS);
    await page.evaluate(([dx, travel]) => {
      const wrap = document.querySelector('.stage .card-wrap');
      const scam = document.querySelector('.stage .stamp.scam');
      const legit = document.querySelector('.stage .stamp.legit');
      wrap.style.transform = `translate3d(${dx * travel}px, 0, 0) rotate(${Math.max(-16, Math.min(16, dx / 20))}deg)`;
      const p = Math.min(1, Math.abs(dx) / 106);
      const on = dx < 0 ? scam : legit, off = dx < 0 ? legit : scam;
      on.style.opacity = String(p * 0.9);
      on.style.transform = `translate(-50%, -50%) rotate(var(--rot)) scale(${1.3 - 0.3 * p})`;
      off.style.opacity = '0';
    }, [dx, TRAVEL]);
    await page.screenshot({ path: join(frames, `f${String(i).padStart(4, '0')}.png`), clip });
  }
  await ctx.close();

  const outW = 720, outH = even((clip.height * outW) / clip.width);
  const dir = join(OUT, lang);
  mkdirSync(dir, { recursive: true });
  // Tagged as BT.709 so browsers turn it back into the same mist the page is painted with.
  const vf = `scale=${outW}:${outH}:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p`;
  const tags = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv'];
  const input = ['-framerate', String(FPS), '-i', join(frames, 'f%04d.png')];
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...input, '-an', '-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-profile:v', 'high', ...tags, '-movflags', '+faststart', join(dir, 'swipe-loop.mp4')]);
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...input, '-an', '-vf', vf, '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-row-mt', '1', ...tags, join(dir, 'swipe-loop.webm')]);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', join(frames, 'f0000.png'), '-vf', `scale=${outW}:${outH}:flags=lanczos`, '-c:v', 'libwebp', '-quality', '86', join(dir, 'swipe-loop.webp')]);
  const r = (v) => Math.round(v * 10000) / 10000;
  sizes[lang] = { w: outW / 2, h: outH / 2, card: { x: r((box.x - clip.x) / clip.width), y: r((box.y - clip.y) / clip.height), w: r(box.w / clip.width), h: r(box.h / clip.height) } };
  console.log(lang, 'swipe loop', `${FRAMES} frames`, `${outW}x${outH}`);
}
writeFileSync(join(OUT, 'loop.json'), JSON.stringify(sizes));
await browser.close();
server.kill();
