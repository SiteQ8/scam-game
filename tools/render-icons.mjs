// Renders the app icon set, adaptive icon layers, splash images and web icons from art/icon.svg.
import { sharp as loadSharp } from './lib/env.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const sharp = loadSharp();
const svg = readFileSync('art/icon.svg', 'utf8');
const markOnly = svg.replace(/<rect width="1024" height="1024" fill="url\(#bg\)"\/>/, '');
// Mark scaled into the adaptive icon safe zone (centre 66%).
const foreground = markOnly.replace('<g id="mark">', '<g id="mark" transform="translate(512 512) scale(0.84) translate(-512 -512)">');
const mono = foreground.replace(/fill="(#(FBFAF7|A3ABB8|FFD43B|141820)|url\(#paper\))"/g, 'fill="#FFFFFF"').replace(/stroke="#E5484D"/g, 'stroke="#FFFFFF"').replace(/ filter="url\(#\w+\)"/g, '');
const bgOnly = svg.replace(/<g id="mark">[\s\S]*<\/g>\s*<\/svg>/, '</svg>');
mkdirSync('assets', { recursive: true });
mkdirSync('app/public/img', { recursive: true });
const png = (s, size, out, bg) => sharp(Buffer.from(s), { density: 300 }).resize(size, size).flatten(bg ? { background: bg } : false).png().toFile(out);
await png(svg, 1024, 'assets/icon-only.png', '#0F1624');
await sharp(Buffer.from(foreground), { density: 300 }).resize(1024, 1024).png().toFile('assets/icon-foreground.png');
await png(bgOnly, 1024, 'assets/icon-background.png', '#0F1624');
await sharp(Buffer.from(mono), { density: 300 }).resize(1024, 1024).png().toFile('assets/icon-monochrome.png');
// Splash: the mark small in the middle of the desk colour.
const defs = svg.match(/<defs>[\s\S]*?<\/defs>/)[0];
const splash = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732">${defs}<rect width="2732" height="2732" fill="#0C111B"/><g transform="translate(1366 1366) scale(0.5) translate(-512 -512)">${markOnly.match(/<g id="mark">([\s\S]*)<\/g>\s*<\/svg>/)[1]}</g></svg>`;
await sharp(Buffer.from(splash), { density: 150 }).resize(2732, 2732).png().toFile('assets/splash.png');
await sharp(Buffer.from(splash), { density: 150 }).resize(2732, 2732).png().toFile('assets/splash-dark.png');
for (const s of [192, 512, 180, 32]) await png(svg, s, `app/public/img/icon-${s}.png`, '#0F1624');
// The Google Play listing icon: 512 pixels, 32 bit PNG.
mkdirSync('store/graphics', { recursive: true });
await sharp(Buffer.from(svg), { density: 300 }).resize(512, 512).flatten({ background: '#0F1624' }).ensureAlpha().png().toFile('store/graphics/icon-512.png');
writeFileSync('app/public/img/mark.svg', markOnly.replace('viewBox="0 0 1024 1024"', 'viewBox="140 140 740 740"'));
console.log('icons rendered');
