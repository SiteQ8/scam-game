// Merges content/cards/*.json into the app bundle, links the produced audio files
// and renders the training QR codes. Run after validate-content.mjs.
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'content', 'cards');
const pub = join(root, 'app', 'public');
const outFile = join(root, 'app', 'src', 'content', 'cards.json');

const cards = [];
for (const f of readdirSync(src).filter((x) => x.endsWith('.json')).sort()) {
  for (const c of JSON.parse(readFileSync(join(src, f), 'utf8'))) cards.push(c);
}
cards.sort((a, b) => a.id.localeCompare(b.id));

// The code printed on QR cards opens nothing: it only says what it is if someone scans the screen.
const QR_TEXT = 'Training example from a scam awareness game. This code opens nothing.';

let audioLinked = 0;
let audioMissing = 0;
for (const c of cards) {
  if (c.channel === 'qr') {
    const svg = await QRCode.toString(QR_TEXT, { type: 'svg', margin: 0, errorCorrectionLevel: 'M' });
    // The dark modules are the path drawn with a stroke; its attributes come in any order.
    const path = [...svg.matchAll(/<path([^>]*)\/>/g)].map((m) => m[1]).find((a) => /stroke=/.test(a))?.match(/\sd="([^"]+)"/);
    const vb = svg.match(/viewBox="([^"]+)"/);
    c.qr = { viewBox: vb ? vb[1] : '0 0 33 33', d: path ? path[1] : '' };
    if (!c.qr.d) throw new Error(`QR drawing failed for ${c.id}`);
  }
  for (const lang of ['ar', 'en']) {
    const block = c[lang];
    if (c.channel === 'call') {
      const rel = `audio/calls/${c.id}.${lang}.mp3`;
      if (existsSync(join(pub, rel))) {
        block.audio = rel;
        audioLinked++;
        const tf = join(pub, rel.replace('.mp3', '.json'));
        if (existsSync(tf)) block.timing = JSON.parse(readFileSync(tf, 'utf8'));
      } else audioMissing++;
    }
    if (c.channel === 'chat') {
      block.card.messages.forEach((m, i) => {
        if (!m.voice) return;
        const rel = `audio/voice/${c.id}.${lang}.${i}.mp3`;
        if (existsSync(join(pub, rel))) {
          m.audio = rel;
          audioLinked++;
          // The bubble shows the real length of the recording, not the length written in the card.
          const df = join(pub, rel.replace('.mp3', '.json'));
          if (existsSync(df)) {
            const secs = Math.max(1, Math.round(JSON.parse(readFileSync(df, 'utf8')).duration));
            m.duration = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
          }
        } else audioMissing++;
      });
    }
  }
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(cards));
console.log(`content: ${cards.length} cards, audio linked ${audioLinked}, audio missing ${audioMissing}`);
