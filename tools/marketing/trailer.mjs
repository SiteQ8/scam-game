// Builds the 33 second launch trailer (1080x1920, H.264 and AAC) in Arabic and English.
// Real app footage and screens inside a phone, an ElevenLabs opening shot, ElevenLabs narration
// (Abu Salem in Arabic), the game's own music and sound effects.
//
// Needs: a capture (tools/marketing/capture.mjs) and a recording (tools/marketing/record.mjs),
//        the site built once (docs/assets/fonts), ffmpeg on the PATH.
// usage: node tools/marketing/trailer.mjs <capture dir> <recording dir> <out dir> [en|ar]
import { launch } from '../lib/env.mjs';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { MARK_SVG } from '../../site/render.mjs';

const [capture, recording, out, only] = process.argv.slice(2).map((p, i) => (i < 3 ? resolve(p) : p));
if (!capture || !recording || !out) throw new Error('usage: node tools/marketing/trailer.mjs <capture dir> <recording dir> <out dir> [en|ar]');
const root = resolve('.');
const fonts = join(root, 'docs/assets/fonts');
const copy = JSON.parse(readFileSync(join(root, 'site/copy.json'), 'utf8'));
const brand = JSON.parse(readFileSync(join(root, 'brand.json'), 'utf8'));
const marks = JSON.parse(readFileSync(join(recording, 'marks.json'), 'utf8'));
const work = join(tmpdir(), 'trailer-work');
mkdirSync(work, { recursive: true });
mkdirSync(out, { recursive: true });

const W = 1080, H = 1920, FPS = 30, TOTAL = 33.8;
// The phone: the same proportions as the website and the store screenshots.
const PHONE_TOP = 430, PHONE_BOTTOM = 56;
const phoneH = H - PHONE_TOP - PHONE_BOTTOM;
const pad = Math.round(phoneH * 0.0116);
const SH = phoneH - pad * 2, SW = Math.round((SH * 440) / 956 / 2) * 2;
const PW = SW + pad * 2, PX = Math.round((W - PW) / 2), SX = PX + pad, SY = PHONE_TOP + pad;

const CAPTIONS = {
  open: { en: 'A message just arrived. Real or scam?', ar: 'وصلتك رسالة، فهل هي حقيقية أم احتيال؟' },
  swipe: { en: copy.hero_h1.en, ar: copy.hero_h1.ar, mark: { en: 'scams', ar: 'الاحتيال' } },
  marked: { en: copy.f3_h.en, ar: copy.f3_h.ar, mark: { en: 'marked', ar: 'واضحة' } },
  call: { en: copy.f2_h.en, ar: copy.f2_h.ar },
  nine: { en: copy.f1_h.en, ar: copy.f1_h.ar },
  check: { en: copy.hero_check.en, ar: copy.hero_check.ar },
  day: { en: copy.how_h2.en, ar: copy.how_h2.ar },
  together: { en: copy.f5_h.en, ar: copy.f5_h.ar },
};
// Until the apps are in the stores the trailer ends on the coming soon line; afterwards, on where to get it.
const END_LINE = brand.appStoreId || brand.playLive
  ? { en: 'Free on iPhone, Android and the web', ar: 'مجانية على آيفون وأندرويد والويب' }
  : { en: 'Coming soon to iPhone and Android', ar: 'قريباً على آيفون وأندرويد' };

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const withMark = (text, word) => (word && text.includes(word) ? esc(text).replace(esc(word), `<mark>${esc(word)}</mark>`) : esc(text));
const FACES = `
@font-face { font-family: 'Alexandria'; src: url('file://${fonts}/alexandria-latin-wght-normal.woff2') format('woff2'); font-weight: 100 900; unicode-range: U+0000-00FF, U+2000-206F; }
@font-face { font-family: 'Alexandria'; src: url('file://${fonts}/alexandria-arabic-wght-normal.woff2') format('woff2'); font-weight: 100 900; unicode-range: U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF; }
@font-face { font-family: 'Plex'; src: url('file://${fonts}/ibm-plex-sans-arabic-arabic-400-normal.woff2') format('woff2'); font-weight: 400; unicode-range: U+0600-06FF, U+FB50-FDFF, U+FE70-FEFF; }
@font-face { font-family: 'Plex'; src: url('file://${fonts}/ibm-plex-sans-arabic-latin-400-normal.woff2') format('woff2'); font-weight: 400; unicode-range: U+0000-00FF, U+2000-206F; }
* { margin: 0; box-sizing: border-box; }
mark { background: #ffd43b; color: #141820; padding: 0 0.12em; border-radius: 0.06em; -webkit-box-decoration-break: clone; box-decoration-break: clone; }`;

/** A caption above the phone, with a transparent hole where the screen shows through. */
function framePage(lang, key) {
  const c = CAPTIONS[key];
  const ar = lang === 'ar';
  const r = Math.round(phoneH * 0.064), sr = Math.round(phoneH * 0.053);
  return `<!doctype html><html lang="${lang}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>${FACES}
html, body { width: ${W}px; height: ${H}px; background: transparent; overflow: hidden; }
svg { position: absolute; inset: 0; }
h1 { position: absolute; top: 112px; inset-inline: 84px; color: #141820; font: 500 ${ar ? 86 : 92}px/${ar ? 1.3 : 1.05} 'Alexandria', sans-serif; letter-spacing: ${ar ? 0 : '-0.022em'}; text-wrap: balance; }
</style></head><body>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <mask id="hole"><rect width="${W}" height="${H}" fill="#fff"/><rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="${sr}" fill="#000"/></mask>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="${Math.round(phoneH * 0.025)}" stdDeviation="${Math.round(phoneH * 0.03)}" flood-color="#141820" flood-opacity="0.32"/></filter>
  </defs>
  <g mask="url(#hole)">
    <rect width="${W}" height="${H}" fill="#f4f3f0"/>
    <rect x="${PX}" y="${PHONE_TOP}" width="${PW}" height="${phoneH}" rx="${r}" fill="#1b2130" filter="url(#shadow)"/>
  </g>
</svg>
<h1>${withMark(c[lang], c.mark?.[lang])}</h1>
</body></html>`;
}

/** The opening caption, set over the ElevenLabs shot. */
function openPage(lang) {
  const ar = lang === 'ar';
  return `<!doctype html><html lang="${lang}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>${FACES}
html, body { width: ${W}px; height: ${H}px; background: transparent; overflow: hidden; }
.shade { position: absolute; inset: 0 0 auto; height: 760px; background: linear-gradient(rgba(6, 9, 15, 0.82), rgba(6, 9, 15, 0)); }
h1 { position: absolute; top: 120px; inset-inline: 84px; color: #f1f4f8; font: 500 ${ar ? 84 : 90}px/${ar ? 1.32 : 1.06} 'Alexandria', sans-serif; letter-spacing: ${ar ? 0 : '-0.02em'}; text-wrap: balance; }
</style></head><body><div class="shade"></div><h1>${esc(CAPTIONS.open[lang])}</h1></body></html>`;
}

function endPage(lang) {
  const ar = lang === 'ar';
  const name = ar ? brand.nameAr || brand.nameEn : brand.nameEn;
  return `<!doctype html><html lang="${lang}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>${FACES}
html, body { width: ${W}px; height: ${H}px; background: #f4f3f0; color: #141820; overflow: hidden; font-family: 'Plex', sans-serif; }
.stack { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 0 96px 120px; }
.mark { width: 200px; height: 200px; border-radius: 48px; overflow: hidden; box-shadow: 0 30px 60px -24px rgba(20, 24, 32, 0.4); }
.mark svg { width: 100%; height: 100%; display: block; }
.name { margin-top: 64px; font: 600 64px/1.2 'Alexandria', sans-serif; }
h1 { margin-top: ${name ? 28 : 72}px; font: 500 ${ar ? 112 : 120}px/${ar ? 1.3 : 1.02} 'Alexandria', sans-serif; letter-spacing: ${ar ? 0 : '-0.025em'}; text-wrap: balance; }
p { margin-top: 44px; font-size: 44px; line-height: 1.4; color: #4a5361; }
.site { margin-top: 18px; font-size: 40px; color: #141820; }
</style></head><body><div class="stack">
<div class="mark">${MARK_SVG('')}</div>
${name ? `<div class="name">${esc(name)}</div>` : ''}
<h1>${withMark(copy.hero_h1[lang], CAPTIONS.swipe.mark[lang])}</h1>
<p>${esc(END_LINE[lang])}</p>
${brand.domain ? `<div class="site" dir="ltr">${esc(brand.domain)}</div>` : ''}
</div></body></html>`;
}

async function renderPngs(lang) {
  const browser = await launch(['--allow-file-access-from-files']);
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const shoot = async (html, file, transparent) => {
    const tmp = join(work, 'page.html');
    writeFileSync(tmp, html);
    await page.goto(`file://${tmp}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(120);
    await page.screenshot({ path: file, omitBackground: transparent });
  };
  for (const key of Object.keys(CAPTIONS).filter((k) => k !== 'open')) await shoot(framePage(lang, key), join(work, `${lang}-frame-${key}.png`), true);
  await shoot(openPage(lang), join(work, `${lang}-open.png`), true);
  await shoot(endPage(lang), join(work, `${lang}-end.png`), false);
  await browser.close();
}

/** Speech segments of the narration take, found from its pauses. */
function narrationLines(file) {
  const log = execFileSync('sh', ['-c', `ffmpeg -hide_banner -i "${file}" -af silencedetect=noise=-38dB:d=0.45 -f null - 2>&1`], { encoding: 'utf8' });
  let starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  let ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  // speech runs from the end of one pause to the start of the next; a pause at the very start is skipped
  let first = 0;
  if (starts.length && starts[0] < 0.3) { first = ends[0]; starts = starts.slice(1); ends = ends.slice(1); }
  const cuts = [first, ...ends];
  const stops = [...starts, dur];
  const lines = cuts.map((a, i) => [Math.max(0, a - 0.05), Math.min(dur, stops[i] + 0.12)]).filter(([a, b]) => b - a > 0.4);
  if (lines.length !== 6) throw new Error(`expected 6 narration lines in ${file}, found ${lines.length}`);
  return lines;
}

function build(lang) {
  const m = { swipe: marks[`${lang}-swipe`].start, call: marks[`${lang}-call`].start, checker: marks[`${lang}-checker`].start };
  const narration = join(root, `art/trailer/narration-${lang}.mp3`);
  const lines = narrationLines(narration);
  const at = [0.25, 4.7, 6.6, 15.8, 24.5, 28.8]; // where each narration line starts on the timeline
  const audio = (n) => join(root, 'app/public/audio', n);

  // Screen content: [input, from, to, at] for clips; stills are shown whole.
  const inputs = [];
  const add = (args) => { inputs.push(args); return inputs.length - 1; };
  const iOpen = add(['-i', join(root, 'art/trailer/opening.mp4')]);
  const iSwipe = add(['-i', join(recording, `${lang}-swipe.webm`)]);
  const iCall = add(['-i', join(recording, `${lang}-call.webm`)]);
  const iCheck = add(['-i', join(recording, `${lang}-checker.webm`)]);
  const still = (name, dur) => add(['-loop', '1', '-framerate', String(FPS), '-t', String(dur), '-i', join(capture, lang, `${name}.png`)]);
  const png = (file, dur) => add(['-loop', '1', '-framerate', String(FPS), '-t', String(dur), '-i', file]);
  const f = (k) => join(work, `${lang}-frame-${k}.png`);

  const content = [
    { i: iSwipe, from: m.swipe + 0.05, len: 7.0, t: 4.4 },
    { i: iCall, from: m.call, len: 4.2, t: 11.4 },
    { i: still('chat', 1.25), t: 15.6, len: 1.25 },
    { i: still('email', 1.25), t: 16.85, len: 1.25 },
    { i: still('web', 1.25), t: 18.1, len: 1.25 },
    { i: still('qr', 1.25), t: 19.35, len: 1.25 },
    { i: iCheck, from: m.checker + 0.6, len: 3.8, t: 20.6 },
    { i: still('home', 1.9), t: 24.4, len: 1.9 },
    { i: still('party', 1.9), t: 26.3, len: 1.9 },
  ];
  const frames = [
    { k: 'swipe', t: 4.4, len: 3.8 }, { k: 'marked', t: 8.2, len: 3.2 }, { k: 'call', t: 11.4, len: 4.2 },
    { k: 'nine', t: 15.6, len: 5.0 }, { k: 'check', t: 20.6, len: 3.8 }, { k: 'day', t: 24.4, len: 1.9 }, { k: 'together', t: 26.3, len: 1.95 },
  ].map((x) => ({ ...x, i: png(f(x.k), x.len) }));
  const iOpenCap = png(join(work, `${lang}-open.png`), 4.4);
  const iEnd = png(join(work, `${lang}-end.png`), TOTAL - 28.2);

  const iNarr = add(['-i', narration]);
  const iMusic = add(['-stream_loop', '-1', '-i', audio('music/theme.mp3')]);
  const iCaller = add(['-i', audio(`calls/call-bank-fraud-otp.${lang}.mp3`)]);
  const sfx = [
    ['sfx/whoosh.mp3', 4.3, 0.35], ['sfx/stamp.mp3', 6.25, 0.8], ['sfx/correct.mp3', 8.25, 0.5], ['sfx/whoosh.mp3', 11.3, 0.3],
    ['sfx/ring.mp3', 11.45, 0.35], ['sfx/whoosh.mp3', 15.5, 0.3], ['sfx/whoosh.mp3', 20.5, 0.3], ['sfx/reveal.mp3', 21.6, 0.4],
    ['sfx/whoosh.mp3', 24.3, 0.3], ['sfx/whoosh.mp3', 28.15, 0.35],
  ].map(([n, t, v]) => ({ i: add(['-i', audio(n)]), t, v }));

  const g = [];
  g.push(`color=c=0xf4f3f0:s=${W}x${H}:r=${FPS}:d=${TOTAL}[base]`);
  let last = 'base';
  content.forEach((c, n) => {
    const src = c.from !== undefined
      ? `[${c.i}:v]trim=start=${c.from.toFixed(3)}:duration=${c.len},setpts=PTS-STARTPTS,fps=${FPS}`
      : `[${c.i}:v]fps=${FPS},setpts=PTS-STARTPTS`;
    g.push(`${src},scale=${SW}:${SH}:flags=lanczos,format=yuv420p,setpts=PTS+${c.t}/TB[c${n}]`);
    g.push(`[${last}][c${n}]overlay=${SX}:${SY}:eof_action=pass:enable='between(t,${c.t},${(c.t + c.len).toFixed(2)})'[v${n}]`);
    last = `v${n}`;
  });
  frames.forEach((fr, n) => {
    const fadeIn = n === 0 ? 0 : 0.18;
    g.push(`[${fr.i}:v]format=rgba,fade=t=in:st=0:d=${fadeIn || 0.01}:alpha=1,setpts=PTS-STARTPTS+${fr.t}/TB[f${n}]`);
    g.push(`[${last}][f${n}]overlay=0:0:eof_action=pass:enable='between(t,${fr.t},${(fr.t + fr.len).toFixed(2)})'[w${n}]`);
    last = `w${n}`;
  });
  // the ElevenLabs shot, slowed to fill its 4.4 seconds and gently pushed in, fading into the app
  g.push(`[${iOpen}:v]setpts=1.09*(PTS-STARTPTS),fps=${FPS},scale=${W}:${H}:flags=lanczos,scale=w='trunc(${W}*(1+0.04*t/4.4)/2)*2':h='trunc(${H}*(1+0.04*t/4.4)/2)*2':eval=frame,crop=${W}:${H},format=rgba,fade=t=out:st=4.05:d=0.35:alpha=1,trim=duration=4.4[op]`);
  g.push(`[${last}][op]overlay=0:0:eof_action=pass[o1]`);
  g.push(`[${iOpenCap}:v]format=rgba,fade=t=in:st=0.5:d=0.4:alpha=1,fade=t=out:st=4.0:d=0.35:alpha=1[oc]`);
  g.push(`[o1][oc]overlay=0:0:eof_action=pass:enable='between(t,0,4.4)'[o2]`);
  g.push(`[${iEnd}:v]format=rgba,fade=t=in:st=0:d=0.45:alpha=1,setpts=PTS-STARTPTS+28.2/TB[end]`);
  g.push(`[o2][end]overlay=0:0:eof_action=pass:enable='gte(t,28.2)',fade=t=in:st=0:d=0.3,fade=t=out:st=${TOTAL - 0.5}:d=0.5,format=yuv420p[vout]`);

  // Audio: narration lines placed on the timeline, the caller's own voice, sound effects, and the theme ducked under speech.
  const fmt = 'aformat=sample_rates=48000:channel_layouts=stereo';
  const voices = [];
  lines.forEach(([a, b], n) => {
    g.push(`[${iNarr}:a]atrim=start=${a.toFixed(3)}:end=${b.toFixed(3)},asetpts=PTS-STARTPTS,${fmt},afade=t=in:d=0.03,afade=t=out:st=${(b - a - 0.08).toFixed(3)}:d=0.08,adelay=${Math.round(at[n] * 1000)}:all=1[n${n}]`);
    voices.push(`[n${n}]`);
  });
  g.push(`[${iCaller}:a]atrim=0:3.3,asetpts=PTS-STARTPTS,${fmt},afade=t=out:st=2.9:d=0.4,volume=0.7,adelay=12200:all=1[caller]`);
  voices.push('[caller]');
  g.push(`${voices.join('')}amix=inputs=${voices.length}:normalize=0,apad=whole_dur=${TOTAL}[speech]`);
  g.push(`[speech]asplit=2[speechA][speechB]`);
  const fx = sfx.map((s, n) => { g.push(`[${s.i}:a]${fmt},volume=${s.v},adelay=${Math.round(s.t * 1000)}:all=1[s${n}]`); return `[s${n}]`; });
  g.push(`[${iMusic}:a]${fmt},atrim=0:${TOTAL},asetpts=PTS-STARTPTS,volume=0.32,afade=t=in:d=1.2,afade=t=out:st=${TOTAL - 2}:d=2[music]`);
  g.push(`[music][speechA]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[ducked]`);
  g.push(`[ducked][speechB]${fx.join('')}amix=inputs=${2 + fx.length}:normalize=0,atrim=0:${TOTAL},loudnorm=I=-16:TP=-1.5:LRA=11,${fmt}[aout]`);

  const file = join(out, `trailer-${lang}.mp4`);
  const args = ['-y', '-v', 'error', ...inputs.flat(), '-filter_complex', g.join(';'), '-map', '[vout]', '-map', '[aout]', '-t', String(TOTAL),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', file];
  writeFileSync(join(work, `${lang}-ffmpeg.txt`), args.join('\n'));
  execFileSync('ffmpeg', args, { stdio: 'inherit' });
  // A still for the video player before it plays: the debrief with every sign marked.
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', '9.6', '-i', file, '-frames:v', '1', '-vf', 'scale=540:-2', '-c:v', 'libwebp', '-quality', '82', join(out, `poster-${lang}.webp`)]);
  console.log('trailer', lang, file);
}

for (const lang of only ? [only] : ['en', 'ar']) {
  if (!existsSync(join(recording, `${lang}-swipe.webm`))) throw new Error(`record first: node tools/marketing/record.mjs ${recording}`);
  await renderPngs(lang);
  build(lang);
}
