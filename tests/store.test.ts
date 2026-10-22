// The store listings stay within each store's limits and follow the language rules in both languages.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const store = join(__dirname, '..', 'store');
const read = (f: string) => readFileSync(join(store, f), 'utf8');
// Until the name and address are filled in, each placeholder counts as 20 characters.
const measure = (s: string) => [...s.replace(/\{\{[A-Z_]+\}\}/g, 'x'.repeat(20))].length;
const DASH = /[‒–—―−]/;
const SPACED_HYPHEN = /(^|\s)-(\s|$)/;
const prose = (s: string) => s.replace(/https?:\/\/\S+/g, ' ').replace(/\{\{[A-Z_]+\}\}\S*/g, ' ').replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, ' ').replace(/[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+(\/\S*)?/g, ' ').replace(/\d+\.\d+/g, ' ');

const LIMITS: Record<string, number> = {};
for (const l of ['en-US', 'ar-SA']) Object.assign(LIMITS, { [`app-store/${l}/name.txt`]: 30, [`app-store/${l}/subtitle.txt`]: 30, [`app-store/${l}/promotional_text.txt`]: 170, [`app-store/${l}/description.txt`]: 4000, [`app-store/${l}/keywords.txt`]: 100, [`app-store/${l}/release_notes.txt`]: 4000 });
for (const l of ['en-US', 'ar']) Object.assign(LIMITS, { [`google-play/${l}/title.txt`]: 30, [`google-play/${l}/short_description.txt`]: 80, [`google-play/${l}/full_description.txt`]: 4000, [`google-play/${l}/changelogs/default.txt`]: 500 });

describe.skipIf(!existsSync(join(store, 'app-store')))('store listings', () => {
  it('fit every field limit', () => {
    for (const [f, limit] of Object.entries(LIMITS)) expect(measure(read(f)), f).toBeLessThanOrEqual(limit);
    expect(Buffer.byteLength(read('app-store/review-notes.txt'), 'utf8')).toBeLessThanOrEqual(4000);
  });

  it('use no dashes, and Arabic periods only end sentences', () => {
    for (const f of [...Object.keys(LIMITS), 'app-store/review-notes.txt']) {
      const text = read(f);
      expect(DASH.test(text), `${f}: dash`).toBe(false);
      expect(text.split('\n').some((line) => SPACED_HYPHEN.test(prose(line))), `${f}: hyphen used as a dash`).toBe(false);
      if (/\/(ar-SA|ar)\//.test(f)) {
        for (const line of text.split('\n')) {
          const inner = prose(line).trim().replace(/[.؟?:]$/, '');
          expect(inner.includes('.'), `${f}: period inside "${line.slice(0, 60)}"`).toBe(false);
        }
      }
    }
  });

  it('keep App Store keywords in the required form', () => {
    for (const l of ['en-US', 'ar-SA']) {
      const words = read(`app-store/${l}/keywords.txt`).trim().split(',');
      for (const w of words) {
        expect(w, `${l}: space around "${w}"`).toBe(w.trim());
        expect([...w].length, `${l}: keyword "${w}" is too short`).toBeGreaterThan(2);
      }
      expect(new Set(words).size, `${l}: repeated keyword`).toBe(words.length);
    }
  });
});
