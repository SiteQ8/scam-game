// @vitest-environment jsdom
// The debrief numbers the marks in reading order: on every card, in both languages, they read 1, 2, 3 from the top,
// and the list under the card carries the same numbers.
import { describe, it, expect } from 'vitest';
import { h, render } from 'preact';
import { CARDS } from '../app/src/content/cards';
import { CardView } from '../app/src/ui/cards/CardView';
import { markNumbers } from '../app/src/ui/cards/marker';
import type { Lang, LangBlock } from '../app/src/content/types';

describe('debrief marks', () => {
  for (const lang of ['en', 'ar'] as Lang[]) {
    it(`read 1, 2, 3 down every card in ${lang}`, () => {
      const bad: string[] = [];
      const host = document.createElement('div');
      for (const card of CARDS) {
        render(h(CardView, { card, lang, mode: 'debrief', marksOn: true }), host);
        const seen = [...host.querySelectorAll('.mk-n')].map((e) => Number(e.textContent));
        if (!seen.every((v, k) => v === k + 1)) bad.push(`${card.id}: ${seen.join(' ')}`);
        render(null, host);
      }
      expect(bad).toEqual([]);
    });

    it(`give each signal its own number in ${lang}`, () => {
      for (const card of CARDS) {
        const n = markNumbers(card, lang);
        expect([...n].sort((a, b) => a - b)).toEqual((card[lang] as LangBlock).signals.map((_, i) => i + 1));
      }
    });
  }
});
