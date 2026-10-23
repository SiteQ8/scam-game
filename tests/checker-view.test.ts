// The website's checker numbers the signs it marks in reading order: down the message they read 1, 2, 3,
// and the list under the message starts with those same numbers before the signs that have nothing to mark.
import { describe, it, expect } from 'vitest';
import { render } from '../site/src/checker-view';
import { CARDS } from '../app/src/content/cards';
import { cardText } from '../app/src/engine/card-text';

const numbers = (html: string, cls: string) => [...html.matchAll(new RegExp(`<span class="${cls}" aria-hidden="true">(\\d+)</span>`, 'g'))].map((m) => Number(m[1]));

describe('the website checker', () => {
  for (const lang of ['en', 'ar'] as const) {
    it(`marks read 1, 2, 3 down every scam message in ${lang}`, () => {
      const bad: string[] = [];
      let marked = 0;
      for (const card of CARDS.filter((c) => c.verdict === 'scam')) {
        const html = render(cardText(card, lang), lang, '').html;
        const inText = numbers(html, 'm-n');
        const inList = numbers(html, 'chk-n');
        marked += inText.length;
        if (!inText.every((v, k) => v === k + 1)) bad.push(`${card.id}: text ${inText.join(' ')}`);
        if (!inList.every((v, k) => v === k + 1)) bad.push(`${card.id}: list ${inList.join(' ')}`);
      }
      expect(marked).toBeGreaterThan(50);
      expect(bad).toEqual([]);
    });
  }
});
