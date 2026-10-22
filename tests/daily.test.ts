import { describe, it, expect } from 'vitest';
import type { Card } from '../app/src/content/types';
import { dailyDeck, dayIndex, caseNumber, shareGrid, DAILY_SIZE } from '../app/src/engine/daily';
import { chapterDeck, starsFor, CHAPTERS } from '../app/src/engine/deck';
import data from '../app/src/content/cards.json';

const CARDS = data as unknown as Card[];
const fake = (n: number): Card[] => Array.from({ length: n }, (_, i) => ({
  id: `sms-fake-${i}`, channel: (['sms', 'email', 'chat', 'web', 'call', 'qr'] as const)[i % 6], verdict: i % 5 < 3 ? 'scam' : 'legit',
  category: 'delivery', region: i % 3 ? 'gcc' : 'global', difficulty: (i % 5) + 1, ar: {} as never, en: { signals: [], card: { messages: [] } } as never,
}) as Card);

describe('daily case', () => {
  it('numbers days from 16 October 2026', () => {
    expect(dayIndex(new Date(2026, 9, 16, 9))).toBe(0);
    expect(caseNumber(dayIndex(new Date(2026, 9, 17, 23, 59)))).toBe(2);
    expect(dayIndex(new Date(2027, 0, 1))).toBe(77);
  });
  it('is the same on every device for a day and edition', () => {
    const pool = fake(120);
    expect(dailyDeck(5, 'gcc', pool).map((c) => c.id)).toEqual(dailyDeck(5, 'gcc', pool).map((c) => c.id));
    expect(dailyDeck(5, 'gcc', pool).map((c) => c.id)).not.toEqual(dailyDeck(6, 'gcc', pool).map((c) => c.id));
  });
  it('is balanced and ordered from easy to hard', () => {
    const pool = fake(120);
    for (let d = 0; d < 30; d++) {
      const deck = dailyDeck(d, 'gcc', pool);
      expect(deck).toHaveLength(DAILY_SIZE);
      expect(new Set(deck.map((c) => c.id)).size).toBe(DAILY_SIZE);
      expect(deck.filter((c) => c.verdict === 'legit').length).toBeGreaterThanOrEqual(3);
      const diffs = deck.map((c) => c.difficulty);
      expect(diffs).toEqual([...diffs].sort((a, b) => a - b));
    }
  });
  it('keeps the global edition to global cards', () => {
    expect(dailyDeck(3, 'global', fake(120)).every((c) => c.region === 'global')).toBe(true);
  });
  it('builds a spoiler free share grid', () => {
    expect(shareGrid([true, false, true])).toBe('🟩🟥🟩');
  });
  it('works on the real content', () => {
    const deck = dailyDeck(0, 'gcc', CARDS);
    expect(deck.length).toBe(Math.min(DAILY_SIZE, CARDS.length));
  });
});

describe('journey', () => {
  it('scores stars by accuracy', () => {
    expect(starsFor(10, 10)).toBe(3);
    expect(starsFor(9, 10)).toBe(2);
    expect(starsFor(7, 10)).toBe(1);
    expect(starsFor(6, 10)).toBe(0);
  });
  it('gives each chapter a stable deck', () => {
    for (const ch of CHAPTERS) expect(chapterDeck(ch.id, CARDS).map((c) => c.id)).toEqual(chapterDeck(ch.id, CARDS).map((c) => c.id));
  });
});
