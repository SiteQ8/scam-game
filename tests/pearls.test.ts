// The pearl as the unit of the game: the level graded by the pearl's size, a strand told in words, and a strand draped on the cloth.
import { describe, it, expect, afterEach } from 'vitest';
import { pearlSize } from '../app/src/ui/components/Medal';
import { strandTally } from '../app/src/i18n/i18n';
import { settings } from '../app/src/state/store';
import { MAX_LEVEL } from '../app/src/engine/levels';
import { drape } from '../app/src/ui/components/common';

const SEAT = 48;

describe('the level pearl', () => {
  it('starts small and fills most of its seat by level 10', () => {
    expect(pearlSize(1) * SEAT).toBeGreaterThan(13);
    expect(pearlSize(1) * SEAT).toBeLessThan(15);
    expect(pearlSize(10) * SEAT).toBeGreaterThan(39);
    expect(pearlSize(10) * SEAT).toBeLessThan(41);
  });
  it('grows with every level and never leaves its seat', () => {
    for (let n = 2; n <= MAX_LEVEL; n++) expect(pearlSize(n)).toBeGreaterThan(pearlSize(n - 1));
    expect(pearlSize(MAX_LEVEL)).toBeLessThanOrEqual(0.9);
    expect(pearlSize(0)).toBe(pearlSize(1));
    expect(pearlSize(MAX_LEVEL + 5)).toBe(pearlSize(MAX_LEVEL));
  });
});

describe('a strand in words', () => {
  const use = (l: 'en' | 'ar') => { settings.value = { ...settings.value, lang: l }; };
  afterEach(() => use('en'));
  it('counts pearls and beads in English', () => {
    use('en');
    expect(strandTally(10, 10)).toBe('10 lustrous pearls');
    expect(strandTally(9, 10)).toBe('9 lustrous pearls and 1 dull bead');
    expect(strandTally(0, 10)).toBe('10 dull beads');
  });
  it('counts pearls and beads in Arabic with the right number forms', () => {
    use('ar');
    expect(strandTally(9, 10)).toBe('9 لؤلؤات لامعة وخرزة باهتة واحدة');
    expect(strandTally(8, 10)).toBe('8 لؤلؤات لامعة وخرزتان باهتتان');
    expect(strandTally(1, 1)).toBe('لؤلؤة لامعة واحدة');
    expect(strandTally(0, 2)).toBe('خرزتان باهتتان');
  });
});

describe('a draped strand', () => {
  const spots = drape(10);
  it('hangs between its two ends, lowest in the middle', () => {
    expect(spots[0].x).toBeCloseTo(0.04, 3);
    expect(spots[9].x).toBeCloseTo(0.96, 3);
    expect(spots[0].y).toBeCloseTo(0, 3);
    expect(spots[9].y).toBeCloseTo(0, 3);
    for (let i = 0; i < 5; i++) {
      expect(spots[i].x + spots[9 - i].x).toBeCloseTo(1, 3);
      expect(spots[i].y).toBeCloseTo(spots[9 - i].y, 3);
      if (i) expect(spots[i].y).toBeGreaterThan(spots[i - 1].y);
    }
  });
  it('keeps its pearls evenly spaced along the thread', () => {
    const gaps = spots.slice(1).map((s, i) => Math.hypot(s.x - spots[i].x, s.y - spots[i].y));
    for (const g of gaps) expect(Math.abs(g - gaps[0])).toBeLessThan(0.004);
  });
});
