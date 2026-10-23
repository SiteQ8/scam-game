// The pearl world for the marketing pictures: the website's colours and the game's two typefaces, read from the app,
// so the link previews, store pictures and trailers match what people see when they open the game.
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve('.');
const fonts = join(root, 'app/src/assets/fonts');

/** The @font-face rules of the app, pointing at the font files on disk. */
export const FACES = readFileSync(join(root, 'app/src/styles/fonts.css'), 'utf8').replaceAll('../assets/fonts/', `file://${fonts}/`);

export const DISPLAY = "'Aref Ruqaa', 'Readex Pro', serif";
export const TEXT = "'Readex Pro', sans-serif";

/** The colours, as on the website (site/assets/site.css). */
export const C = {
  sea: '#0d1d22', sea2: '#1a343b', mist: '#e7edec', cloth: '#7c1424', brass: '#c9a45c', pearl: '#f1f0ed',
  onSea: '#f1f0ed', onSea2: '#b8c4c2', onMist: '#10252b', onMist2: '#3d5358', onCloth: '#fbeee9', onCloth2: '#f2cdc6',
  onBrass: '#231807', onBrass2: '#4a3812', phone: '#060b0d',
};

/** Each field with its inks, and the colour a marked word takes on it. */
export const FIELDS = {
  mist: { bg: C.mist, ink: C.onMist, ink2: C.onMist2, mark: C.cloth },
  sea: { bg: C.sea, ink: C.onSea, ink2: C.onSea2, mark: '#e2c27f' },
  cloth: { bg: C.cloth, ink: C.onCloth, ink2: C.onCloth2, mark: '#f6dca4' },
  brass: { bg: C.brass, ink: C.onBrass, ink2: C.onBrass2, mark: C.cloth },
};

/** Sets the two headline lines across the surface between two fields: the first line's ink ends `gap` pixels above
 * the surface and the second line's ink starts `gap` pixels below it, measured on the rendered type, so no letter
 * is cut by the surface in either script. Reads data-seam, data-gap and data-after from <body>; an element with the
 * class "after" is set that many pixels below the second line's ink. Call window.waterline() once the fonts are in. */
export const WATERLINE = `window.waterline = () => {
  const b = document.body.dataset;
  const seam = +b.seam, gap = +b.gap;
  const ctx = document.createElement('canvas').getContext('2d');
  const ink = (el) => {
    const cs = getComputedStyle(el);
    ctx.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    ctx.direction = cs.direction;
    const m = ctx.measureText(el.textContent.trim());
    const line = parseFloat(cs.lineHeight);
    return { m, base: (line - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent };
  };
  const l1 = document.querySelector('.l1'), l2 = document.querySelector('.l2');
  const a = ink(l1), c = ink(l2);
  l1.style.top = (seam - gap - a.m.actualBoundingBoxDescent - a.base) + 'px';
  const top2 = seam + gap + c.m.actualBoundingBoxAscent - c.base;
  l2.style.top = top2 + 'px';
  const after = document.querySelector('.after');
  if (after) after.style.top = (top2 + c.base + c.m.actualBoundingBoxDescent + (+b.after || 0)) + 'px';
};`;

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ESC[c]);
