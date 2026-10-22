// Renders the app icon set, adaptive icon layers, splash images and web icons from art/icon.svg.
import { sharp as loadSharp } from './lib/env.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const sharp = loadSharp();
const svg = readFileSync('art/icon.svg', 'utf8');
const markOnly = svg.replace(/<rect width="1024" height="1024" fill="url\(#bg\)"\/>/, '');
// Mark scaled into the adaptive icon safe zone (centre 66%).
const foreground = markOnly.replace('<g id="mark">', '<g id="mark" transform="translate(512 512) scale(0.62) translate(-490 -480)">');
const mono = foreground.replace(/fill="#(FBFAF7|A3ABB8|FFD43B|141820)"/g, 'fill="#FFFFFF"').replace(/stroke="#E5484D"/g, 'stroke="#FFFFFF"').replace(/filter="url\(#sh\)"/, '');
const bgOnly = svg.replace(/<g id="mark">[\s\S]*<\/g>\s*<\/svg>/, '</svg>');
mkdirSync('assets', { recursive: true });
mkdirSync('app/public/img', { recursive: true });
const png = (s, size, out, bg) => sharp(Buffer.from(s), { density: 300 }).resize(size, size).flatten(bg ? { background: bg } : false).png().toFile(out);
await png(svg, 1024, 'assets/icon-only.png', '#0F1624');
await sharp(Buffer.from(foreground), { density: 300 }).resize(1024, 1024).png().toFile('assets/icon-foreground.png');
await png(bgOnly, 1024, 'assets/icon-background.png', '#0F1624');
await sharp(Buffer.from(mono), { density: 300 }).resize(1024, 1024).png().toFile('assets/icon-monochrome.png');
// Splash: the mark small in the middle of the desk colour.
const splash = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732"><rect width="2732" height="2732" fill="#0C111B"/><g transform="translate(1366 1366) scale(0.62) translate(-490 -480)">${markOnly.match(/<g id="mark">([\s\S]*)<\/g>\s*<\/svg>/)[1]}</g><defs><filter id="sh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="30" stdDeviation="36" flood-color="#000000" flood-opacity="0.55"/></filter></defs></svg>`;
await sharp(Buffer.from(splash), { density: 150 }).resize(2732, 2732).png().toFile('assets/splash.png');
await sharp(Buffer.from(splash), { density: 150 }).resize(2732, 2732).png().toFile('assets/splash-dark.png');
for (const s of [192, 512, 180, 32]) await png(svg, s, `app/public/img/icon-${s}.png`, '#0F1624');
writeFileSync('app/public/img/mark.svg', markOnly.replace('viewBox="0 0 1024 1024"', 'viewBox="160 120 720 760"'));
console.log('icons rendered');
