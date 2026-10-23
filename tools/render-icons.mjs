// Renders the app icon set, adaptive icon layers, splash images and web icons from art/icon.svg.
import { sharp as loadSharp } from './lib/env.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const sharp = loadSharp();
const svg = readFileSync('art/icon.svg', 'utf8');
const markOnly = svg.replace(/<rect width="1024" height="1024" fill="url\(#bg\)"\/>/, '');
// Mark scaled into the adaptive icon safe zone (centre 66%).
const foreground = markOnly.replace('<g id="mark">', '<g id="mark" transform="translate(512 512) scale(0.84) translate(-512 -512)">');
const mono = foreground.replace(/(fill|stroke)="url\(#(pearl|brass)\)"/g, '$1="#FFFFFF"').replace(/ filter="url\(#\w+\)"/g, '');
const bgOnly = svg.replace(/<g id="mark">[\s\S]*<\/g>\s*<\/svg>/, '</svg>');
mkdirSync('assets', { recursive: true });
mkdirSync('app/public/img', { recursive: true });
const png = (s, size, out, bg) => sharp(Buffer.from(s), { density: 300 }).resize(size, size).flatten(bg ? { background: bg } : false).png().toFile(out);
await png(svg, 1024, 'assets/icon-only.png', '#7C1424');
await sharp(Buffer.from(foreground), { density: 300 }).resize(1024, 1024).png().toFile('assets/icon-foreground.png');
await png(bgOnly, 1024, 'assets/icon-background.png', '#7C1424');
await sharp(Buffer.from(mono), { density: 300 }).resize(1024, 1024).png().toFile('assets/icon-monochrome.png');
// Splash: the icon itself, a small tile of red cloth with the mark, in the middle of the night sea.
const defs = svg.match(/<defs>[\s\S]*?<\/defs>/)[0];
const tile = svg.replace(/<svg[^>]*>/, '').replace('</svg>', '').replace(defs, '');
const splash = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732">${defs}<clipPath id="tile"><rect width="1024" height="1024" rx="230"/></clipPath><rect width="2732" height="2732" fill="#0D1D22"/><g transform="translate(1366 1366) scale(0.42) translate(-512 -512)"><g clip-path="url(#tile)">${tile}</g></g></svg>`;
await sharp(Buffer.from(splash), { density: 150 }).resize(2732, 2732).png().toFile('assets/splash.png');
await sharp(Buffer.from(splash), { density: 150 }).resize(2732, 2732).png().toFile('assets/splash-dark.png');
for (const s of [192, 512, 180, 32]) await png(svg, s, `app/public/img/icon-${s}.png`, '#7C1424');
// The Google Play listing icon: 512 pixels, 32 bit PNG.
mkdirSync('store/graphics', { recursive: true });
await sharp(Buffer.from(svg), { density: 300 }).resize(512, 512).flatten({ background: '#7C1424' }).ensureAlpha().png().toFile('store/graphics/icon-512.png');
writeFileSync('app/public/img/mark.svg', markOnly.replace('viewBox="0 0 1024 1024"', 'viewBox="120 120 784 784"'));
console.log('icons rendered');
