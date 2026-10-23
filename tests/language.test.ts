// Language rules enforced at build time: no dashes anywhere, and Arabic periods only at the end of a sentence.
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { S, CATEGORY_NAMES, CHANNEL_NAMES, RANKS, COUNTS } from '../app/src/i18n/strings';
import { ACHIEVEMENTS } from '../app/src/engine/achievements';
import { check } from '../app/src/engine/checker';
import copy from '../site/copy.json';
import storeCaptions from '../tools/marketing/store-captions.json';

const DASH = /[‒–—―−]/;
const SPACED_HYPHEN = /(^|\s)-(\s|$)/;
const strip = (s: string) => s.replace(/[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, ' ').replace(/\d+\.\d+/g, ' ').replace(/(د\.ك|ر\.س|د\.إ|ر\.ق|د\.ب|ر\.ع)/g, ' ');

function arabicOk(s: string, where: string) {
  expect(DASH.test(s), `${where}: dash in "${s}"`).toBe(false);
  expect(SPACED_HYPHEN.test(s), `${where}: hyphen used as dash in "${s}"`).toBe(false);
  const inner = strip(s.trim().replace(/\.$/, ''));
  expect(inner.includes('.'), `${where}: period in the middle of "${s}"`).toBe(false);
}
function englishOk(s: string, where: string) {
  expect(DASH.test(s), `${where}: dash in "${s}"`).toBe(false);
  expect(SPACED_HYPHEN.test(s), `${where}: hyphen used as dash in "${s}"`).toBe(false);
}

describe('interface strings', () => {
  it('every key has Arabic and English that follow the rules', () => {
    for (const [k, v] of Object.entries(S)) {
      expect(v.ar.length, `${k}.ar empty`).toBeGreaterThan(0);
      expect(v.en.length, `${k}.en empty`).toBeGreaterThan(0);
      arabicOk(v.ar, `S.${k}`);
      englishOk(v.en, `S.${k}`);
    }
  });
  it('names, ranks and counts follow the rules', () => {
    for (const rec of [...Object.values(CATEGORY_NAMES), ...Object.values(CHANNEL_NAMES), ...RANKS]) { arabicOk(rec.ar, 'name'); englishOk(rec.en, 'name'); }
    for (const c of Object.values(COUNTS)) for (const f of Object.values(c.ar)) arabicOk(f, 'count');
  });
  it('achievements follow the rules', () => {
    for (const a of ACHIEVEMENTS) {
      arabicOk(a.ar.title, `${a.id}.title`); arabicOk(a.ar.body, `${a.id}.body`);
      englishOk(a.en.title, `${a.id}.title`); englishOk(a.en.body, `${a.id}.body`);
      expect(a.ar.body.trim().endsWith('.'), `${a.id}: Arabic sentence must end with a period`).toBe(true);
    }
  });
  it('checker explanations follow the rules', () => {
    const r = check('URGENT: your account will be suspended. Pay the fee at http://secure-gov-kw.verify-pay.top/x or send your OTP. Congratulations you have won. bit.ly/x Hi mum this is my new number, send gift cards. Dear customer');
    expect(r.findings.length).toBeGreaterThan(8);
    for (const f of r.findings) { arabicOk(f.ar.title, f.id); arabicOk(f.ar.body, f.id); englishOk(f.en.title, f.id); englishOk(f.en.body, f.id); }
  });
});

describe('website copy', () => {
  it('every entry has Arabic and English that follow the rules', () => {
    const entries = Object.entries(copy as Record<string, unknown>).filter(([, v]) => v && typeof v === 'object' && 'en' in (v as object));
    expect(entries.length).toBeGreaterThan(50);
    for (const [k, v] of entries) {
      const { en, ar } = v as { en: string; ar: string };
      expect(typeof ar === 'string' && ar.trim().length > 0, `copy.${k}.ar missing`).toBe(true);
      expect(typeof en === 'string' && en.trim().length > 0, `copy.${k}.en missing`).toBe(true);
      // Markup and placeholders are not prose.
      const prose = (t: string) => t.replace(/<[^>]+>/g, ' ').replace(/\{[a-z_]+\}/g, ' ');
      arabicOk(prose(ar), `copy.${k}`);
      englishOk(prose(en), `copy.${k}`);
    }
  });
});

describe('release notes', () => {
  const dir = join(__dirname, '..', '.github', 'release-notes');
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')) : [];

  it('exist for every version, in English and Arabic, and follow the rules', () => {
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const lines = readFileSync(join(dir, f), 'utf8').split('\n');
      expect(lines[0], `${f}: the first line is the title`).toMatch(new RegExp(`^# ${f.replace(/\.md$/, '').replace(/\./g, '\\.')}\\b`));
      expect(lines.includes('## العربية'), `${f}: Arabic section`).toBe(true);
      for (const line of lines.filter((l) => l.trim())) {
        // Markdown marks and link targets are not prose.
        const prose = line.replace(/\]\([^)]*\)/g, ']').replace(/[*#[\]]/g, ' ');
        if (/[؀-ۿ]/.test(prose)) arabicOk(prose, f);
        else englishOk(prose, f);
      }
    }
  });
});

describe('store screenshot captions', () => {
  it('have Arabic and English that follow the rules', () => {
    for (const c of storeCaptions as Array<{ screen: string; en: { h: string; sub: string }; ar: { h: string; sub: string } }>) {
      for (const k of ['h', 'sub'] as const) {
        expect(c.ar[k].trim().length, `${c.screen}.ar.${k}`).toBeGreaterThan(0);
        arabicOk(c.ar[k], `captions.${c.screen}.${k}`);
        englishOk(c.en[k], `captions.${c.screen}.${k}`);
      }
    }
  });
});
