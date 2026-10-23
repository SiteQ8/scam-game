// Draws the journey certificate on a canvas, 1080 by 1350 like a portrait post, entirely on the device.
import type { Lang } from '../../content/types';

export interface CertificateData {
  lang: Lang;
  game: string;
  name: string;
  title: string;
  awardedTo: string;
  body: string;
  stats: { value: string; label: string }[];
  date: string;
  serial: string;
  site: string;
}

export const CERT_W = 1080;
export const CERT_H = 1350;

// The game's mark: a brass loupe over a pearl, on the merchant's red cloth.
const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><radialGradient id="p" cx="0.36" cy="0.32" r="0.72"><stop offset="0" stop-color="#ffffff"/><stop offset="0.2" stop-color="#f6efe3"/><stop offset="0.62" stop-color="#dccfbc"/><stop offset="1" stop-color="#b3a48c"/></radialGradient><radialGradient id="c" cx="0.85" cy="0.1" r="1.1"><stop offset="0" stop-color="#94202f"/><stop offset="0.55" stop-color="#7c1424"/><stop offset="1" stop-color="#5c0e1a"/></radialGradient></defs><rect width="64" height="64" rx="15" fill="url(#c)"/><path d="M38.6 38.6 50 50" stroke="#c9a45c" stroke-width="7" stroke-linecap="round"/><circle cx="28" cy="28" r="15" fill="none" stroke="#c9a45c" stroke-width="4.5"/><circle cx="28" cy="28" r="9.5" fill="url(#p)"/></svg>`;

const DISPLAY = "'Aref Ruqaa', serif";
const BODY = "'Readex Pro', sans-serif";
const INK = '#2a1418';
const BRASS = '#7a5a1f';
const CLOTH = '#7c1424';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; });
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** Splits text into lines that fit the width, breaking only between words. */
function wrap(g: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && g.measureText(next).width > width) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Wraps into as few lines as at the full width, but as even as possible, so no word is left alone on the last line. */
function balanced(g: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines = wrap(g, text, width);
  if (lines.length < 2) return lines;
  let lo = width / 2;
  let hi = width;
  while (hi - lo > 4) {
    const mid = (lo + hi) / 2;
    if (wrap(g, text, mid).length > lines.length) lo = mid; else hi = mid;
  }
  return wrap(g, text, hi);
}

/** Shrinks the font until the text fits on one line. */
function fit(g: CanvasRenderingContext2D, text: string, weight: number, start: number, family: string, width: number): number {
  let size = start;
  for (; size > 28; size -= 2) {
    g.font = `${weight} ${size}px ${family}`;
    if (g.measureText(text).width <= width) break;
  }
  return size;
}

/** A pearl with its lustre and a soft shadow on the paper. */
function pearl(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const lustre = g.createRadialGradient(x - r * 0.32, y - r * 0.36, r * 0.05, x, y, r);
  lustre.addColorStop(0, '#ffffff');
  lustre.addColorStop(0.24, '#f6efe3');
  lustre.addColorStop(0.68, '#dccfbc');
  lustre.addColorStop(1, '#b3a48c');
  g.save();
  g.shadowColor = 'rgba(70, 40, 12, 0.32)';
  g.shadowBlur = r * 0.6;
  g.shadowOffsetY = r * 0.28;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fillStyle = lustre;
  g.fill();
  g.restore();
}

/** A graduated strand on a brass thread, the pearls largest in the middle. */
function strand(g: CanvasRenderingContext2D, cx: number, y: number) {
  const count = 9;
  const gap = 48;
  const span = gap * (count - 1);
  g.strokeStyle = 'rgba(160, 124, 56, 0.75)';
  g.lineWidth = 2.5;
  g.beginPath();
  g.moveTo(cx - span / 2 - 30, y);
  g.lineTo(cx + span / 2 + 30, y);
  g.stroke();
  for (let i = 0; i < count; i++) {
    const t = Math.abs(i - (count - 1) / 2) / ((count - 1) / 2);
    pearl(g, cx - span / 2 + i * gap, y, 17 - t * 7);
  }
}

export async function drawCertificate(d: CertificateData): Promise<HTMLCanvasElement> {
  const all = [d.game, d.name, d.title, d.awardedTo, d.body, d.date, d.serial, d.site, ...d.stats.flatMap((s) => [s.value, s.label])].join(' ');
  await Promise.all([
    document.fonts.load(`700 80px ${DISPLAY}`, all),
    document.fonts.load(`400 34px ${BODY}`, all),
    document.fonts.load(`600 34px ${BODY}`, all),
  ]).catch(() => undefined);

  const c = document.createElement('canvas');
  c.width = CERT_W;
  c.height = CERT_H;
  const g = c.getContext('2d')!;
  const rtl = d.lang === 'ar';
  g.direction = rtl ? 'rtl' : 'ltr';
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  const cx = CERT_W / 2;

  // The merchant's red cloth, then the nacre paper laid on it.
  const cloth = g.createRadialGradient(rtl ? 120 : CERT_W - 120, 0, 60, cx, CERT_H / 2, CERT_H);
  cloth.addColorStop(0, '#9a2333');
  cloth.addColorStop(0.5, CLOTH);
  cloth.addColorStop(1, '#4e0b16');
  g.fillStyle = cloth;
  g.fillRect(0, 0, CERT_W, CERT_H);
  g.save();
  g.shadowColor = 'rgba(30, 0, 6, 0.6)';
  g.shadowBlur = 60;
  g.shadowOffsetY = 24;
  roundRect(g, 64, 64, CERT_W - 128, CERT_H - 128, 36);
  g.fillStyle = '#f7f1e6';
  g.fill();
  g.restore();
  // A brass frame: a firm line and a hairline inside it.
  roundRect(g, 92, 92, CERT_W - 184, CERT_H - 184, 24);
  g.strokeStyle = 'rgba(169, 132, 63, 0.85)';
  g.lineWidth = 3;
  g.stroke();
  roundRect(g, 104, 104, CERT_W - 208, CERT_H - 208, 16);
  g.strokeStyle = 'rgba(169, 132, 63, 0.45)';
  g.lineWidth = 1.5;
  g.stroke();

  // The mark and the game's name.
  const mark = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(MARK_SVG)}`);
  g.drawImage(mark, cx - 58, 128, 116, 116);
  g.fillStyle = CLOTH;
  const gs = fit(g, d.game, 700, 46, DISPLAY, 760);
  g.font = `700 ${gs}px ${DISPLAY}`;
  g.fillText(d.game, cx, 306);

  // Title.
  g.fillStyle = INK;
  const ts = fit(g, d.title, 700, 78, DISPLAY, 820);
  g.font = `700 ${ts}px ${DISPLAY}`;
  g.fillText(d.title, cx, 404);

  let y = 468;
  if (d.name) {
    g.fillStyle = BRASS;
    g.font = `400 34px ${BODY}`;
    g.fillText(d.awardedTo, cx, y);
    y += 104;
    const ns = fit(g, d.name, 700, 96, DISPLAY, 800);
    g.font = `700 ${ns}px ${DISPLAY}`;
    g.fillStyle = INK;
    g.fillText(d.name, cx, y);
    y += 56;
  }
  // The strand under the name, the game's own mark of a closed case.
  strand(g, cx, y);
  y += 76;

  // What it is for.
  g.fillStyle = '#3d2f22';
  g.font = `400 36px ${BODY}`;
  for (const line of balanced(g, d.body, 780)) { g.fillText(line, cx, y); y += 56; }

  // Three numbers.
  const top = Math.max(y + 24, 800);
  const colW = 280;
  d.stats.forEach((s, i) => {
    const x = cx + (rtl ? 1 : -1) * colW + (rtl ? -1 : 1) * i * colW;
    roundRect(g, x - colW / 2 + 12, top, colW - 24, 140, 18);
    g.strokeStyle = 'rgba(169, 132, 63, 0.55)';
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = INK;
    const vs = fit(g, s.value, 700, 56, DISPLAY, colW - 60);
    g.font = `700 ${vs}px ${DISPLAY}`;
    g.fillText(s.value, x, top + 74);
    g.fillStyle = BRASS;
    g.font = `400 28px ${BODY}`;
    g.fillText(s.label, x, top + 116);
  });

  // Date and number on the reading side, the game's brass roundel on the other.
  const startX = rtl ? CERT_W - 150 : 150;
  g.textAlign = rtl ? 'right' : 'left';
  g.fillStyle = INK;
  g.font = `600 34px ${BODY}`;
  g.fillText(d.date, startX, 1104);
  g.fillStyle = BRASS;
  g.font = `400 28px ${BODY}`;
  g.fillText(d.serial, startX, 1148);

  // A printed roundel, not a metal seal: two brass hairlines around the mark and the game's name. It claims nothing.
  const sx = rtl ? 250 : CERT_W - 250;
  const sy = 1100;
  g.save();
  g.translate(sx, sy);
  g.strokeStyle = 'rgba(169, 132, 63, 0.85)';
  g.lineWidth = 2.5;
  g.beginPath(); g.arc(0, 0, 104, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(169, 132, 63, 0.45)';
  g.lineWidth = 1.5;
  g.beginPath(); g.arc(0, 0, 94, 0, Math.PI * 2); g.stroke();
  g.drawImage(mark, -34, -74, 68, 68);
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  g.fillStyle = CLOTH;
  g.font = `700 30px ${DISPLAY}`;
  const nameLines = wrap(g, d.game, 150).slice(0, 2);
  nameLines.forEach((line, i) => g.fillText(line, 0, nameLines.length > 1 ? 30 + i * 34 : 42));
  g.restore();

  // Where to play.
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  g.direction = 'ltr';
  g.fillStyle = '#8a7458';
  g.font = `400 28px ${BODY}`;
  g.fillText(d.site, cx, CERT_H - 126);
  return c;
}
