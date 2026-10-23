// The themed packs: every pack has its words in both languages and ten balanced cards, and pack
// cards stay out of the daily case and the journey so those do not change when packs are added.
import { describe, it, expect } from 'vitest';
import type { Card } from '../app/src/content/types';
import data from '../app/src/content/cards.json';
import { PACKS, packDeck, isCore } from '../app/src/engine/packs';
import { dailyDeck } from '../app/src/engine/daily';
import { chapterDeck, CHAPTERS } from '../app/src/engine/deck';
import { S } from '../app/src/i18n/strings';

const CARDS = data as unknown as Card[];

describe('packs', () => {
  it('have a title and a line in both languages', () => {
    for (const p of PACKS) {
      for (const key of [`pack_${p.id}`, `pack_${p.id}_sub`]) {
        const v = S[key as keyof typeof S];
        expect(v, key).toBeTruthy();
        expect(v.en.length && v.ar.length, key).toBeTruthy();
      }
    }
  });

  it('hold ten cards each: six scams, four genuine, five channels or more, three of a channel at most', () => {
    for (const p of PACKS) {
      const deck = packDeck(p.id, CARDS);
      expect(deck.length, `${p.id}: cards`).toBe(10);
      expect(deck.filter((c) => c.verdict === 'scam').length, `${p.id}: scams`).toBe(6);
      const channels = deck.reduce<Record<string, number>>((m, c) => ({ ...m, [c.channel]: (m[c.channel] || 0) + 1 }), {});
      expect(Object.keys(channels).length, `${p.id}: channels`).toBeGreaterThanOrEqual(5);
      expect(Math.max(...Object.values(channels)), `${p.id}: one channel too often`).toBeLessThanOrEqual(3);
      expect(deck.filter((c) => c.difficulty <= 2).length, `${p.id}: easy cards`).toBeGreaterThanOrEqual(2);
      expect(deck.filter((c) => c.difficulty >= 4).length, `${p.id}: hard cards`).toBeGreaterThanOrEqual(2);
    }
  });

  it('list every pack a card names', () => {
    const ids = new Set(PACKS.map((p) => p.id));
    for (const c of CARDS) if (c.pack) expect(ids.has(c.pack), c.id).toBe(true);
  });

  it('never reach the daily case or a journey chapter', () => {
    const core = CARDS.filter(isCore);
    for (let d = 0; d < 60; d++) for (const ed of ['gcc', 'global'] as const) expect(dailyDeck(d, ed, core).some((c) => c.pack)).toBe(false);
    for (const ch of CHAPTERS) expect(chapterDeck(ch.id, core).some((c) => c.pack)).toBe(false);
  });
});
