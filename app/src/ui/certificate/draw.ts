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
  stamp: string;
  site: string;
}

export const CERT_W = 1080;
export const CERT_H = 1350;

const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="140 140 740 740"><g transform="translate(512 512) scale(0.92) translate(-552 -512)"><g transform="rotate(-8 470 490)"><rect x="228" y="150" width="486" height="660" rx="90" fill="#FBFAF7"/><rect x="318" y="300" width="300" height="48" rx="24" fill="#A3ABB8"/><rect x="286" y="408" width="370" height="118" rx="32" fill="#FFD43B"/><rect x="318" y="443" width="300" height="48" rx="24" fill="#141820"/><rect x="318" y="586" width="200" height="48" rx="24" fill="#A3ABB8"/></g><g transform="rotate(-14 712 724)"><circle cx="712" cy="724" r="168" fill="none" stroke="#E5484D" stroke-width="54"/><path d="M660 672 764 776 M764 672 660 776" stroke="#E5484D" stroke-width="50" stroke-linecap="round"/></g></g></svg>`;

const DISPLAY = "'Alexandria Variable', 'Alexandria', sans-serif";
const BODY = "'IBM Plex Sans Arabic', sans-serif";
const INK = '#141820';
const BROWN = '#6b5a3a';

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

export async function drawCertificate(d: CertificateData): Promise<HTMLCanvasElement> {
  const all = [d.game, d.name, d.title, d.awardedTo, d.body, d.date, d.serial, d.stamp, d.site, ...d.stats.flatMap((s) => [s.value, s.label])].join(' ');
  await Promise.all([
    document.fonts.load(`800 80px ${DISPLAY}`, all),
    document.fonts.load(`600 40px ${DISPLAY}`, all),
    document.fonts.load(`400 34px ${BODY}`, all),
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

  // The investigator's desk, then the paper with a soft shadow.
  const desk = g.createRadialGradient(cx, 300, 100, cx, CERT_H / 2, CERT_H);
  desk.addColorStop(0, '#1a2332');
  desk.addColorStop(1, '#0a0e16');
  g.fillStyle = desk;
  g.fillRect(0, 0, CERT_W, CERT_H);
  g.save();
  g.shadowColor = 'rgba(0, 0, 0, 0.55)';
  g.shadowBlur = 60;
  g.shadowOffsetY = 24;
  roundRect(g, 64, 64, CERT_W - 128, CERT_H - 128, 44);
  g.fillStyle = '#fbf6ea';
  g.fill();
  g.restore();
  roundRect(g, 92, 92, CERT_W - 184, CERT_H - 184, 30);
  g.strokeStyle = 'rgba(122, 91, 37, 0.35)';
  g.lineWidth = 2;
  g.stroke();

  // The mark and the game's name.
  const mark = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(MARK_SVG)}`);
  g.drawImage(mark, cx - 62, 132, 124, 124);
  g.fillStyle = BROWN;
  g.font = `600 40px ${DISPLAY}`;
  g.fillText(d.game, cx, 312);

  // Title.
  g.fillStyle = INK;
  const ts = fit(g, d.title, 800, 70, DISPLAY, 820);
  g.font = `800 ${ts}px ${DISPLAY}`;
  g.fillText(d.title, cx, 420);

  let y = 500;
  if (d.name) {
    g.fillStyle = BROWN;
    g.font = `400 34px ${BODY}`;
    g.fillText(d.awardedTo, cx, y);
    y += 112;
    const ns = fit(g, d.name, 800, 92, DISPLAY, 780);
    g.font = `800 ${ns}px ${DISPLAY}`;
    const w = Math.min(860, g.measureText(d.name).width + 64);
    // The highlighter stroke behind the name.
    g.save();
    g.translate(cx, y - ns * 0.32);
    g.rotate(-0.02);
    g.fillStyle = 'rgba(255, 212, 59, 0.85)';
    roundRect(g, -w / 2, -ns * 0.42, w, ns * 0.8, 14);
    g.fill();
    g.restore();
    g.fillStyle = INK;
    g.fillText(d.name, cx, y);
    y += 86;
  }

  // What it is for.
  g.fillStyle = '#3d3426';
  g.font = `400 36px ${BODY}`;
  for (const line of balanced(g, d.body, 780)) { g.fillText(line, cx, y); y += 56; }

  // Three numbers.
  const top = Math.max(y + 34, 860);
  const colW = 280;
  d.stats.forEach((s, i) => {
    const x = cx + (rtl ? 1 : -1) * colW + (rtl ? -1 : 1) * i * colW;
    roundRect(g, x - colW / 2 + 12, top, colW - 24, 150, 22);
    g.fillStyle = 'rgba(122, 91, 37, 0.08)';
    g.fill();
    g.fillStyle = INK;
    const vs = fit(g, s.value, 750, 54, DISPLAY, colW - 60);
    g.font = `750 ${vs}px ${DISPLAY}`;
    g.fillText(s.value, x, top + 76);
    g.fillStyle = BROWN;
    g.font = `400 28px ${BODY}`;
    g.fillText(s.label, x, top + 122);
  });

  // Date and number on the reading side, the stamp on the other.
  const startX = rtl ? CERT_W - 150 : 150;
  g.textAlign = rtl ? 'right' : 'left';
  g.fillStyle = INK;
  g.font = `600 34px ${DISPLAY}`;
  g.fillText(d.date, startX, 1136);
  g.fillStyle = BROWN;
  g.font = `400 28px ${BODY}`;
  g.fillText(d.serial, startX, 1180);

  const sx = rtl ? 250 : CERT_W - 250;
  const sy = 1130;
  g.save();
  g.translate(sx, sy);
  g.rotate(rtl ? 0.16 : -0.16);
  g.strokeStyle = 'rgba(214, 50, 59, 0.88)';
  g.fillStyle = 'rgba(214, 50, 59, 0.9)';
  g.lineWidth = 7;
  g.beginPath(); g.arc(0, 0, 104, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 3;
  g.beginPath(); g.arc(0, 0, 88, 0, Math.PI * 2); g.stroke();
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const ss = fit(g, d.stamp, 800, 46, DISPLAY, 150);
  g.font = `800 ${ss}px ${DISPLAY}`;
  g.fillText(d.stamp, 0, 2);
  g.restore();

  // Where to play.
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  g.direction = 'ltr';
  g.fillStyle = '#8a7a58';
  g.font = `400 28px ${BODY}`;
  g.fillText(d.site, cx, CERT_H - 118);
  return c;
}
