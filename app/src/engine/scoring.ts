import type { Card } from '../content/types';
import { updateProgress, type Progress } from '../state/store';

export function pointsFor(card: Card, correct: boolean, streak: number): number {
  if (!correct) return 0;
  return 100 + 25 * (card.difficulty - 1) + Math.min(streak, 5) * 10;
}

export interface Judgement { card: Card; said: 'scam' | 'legit'; correct: boolean; points: number }

/** Records one judged card in the lifetime stats. */
export function recordJudgement(j: Judgement, run: number) {
  updateProgress((p: Progress) => {
    p.judged += 1;
    p.xp += j.points;
    if (j.correct) {
      p.right += 1;
      if (j.card.verdict === 'scam') p.scamsCaught += 1;
      else p.legitTrusted += 1;
    }
    p.bestRun = Math.max(p.bestRun, run);
    const rec = p.cards[j.card.id] || { right: 0, wrong: 0 };
    if (j.correct) rec.right += 1; else rec.wrong += 1;
    p.cards[j.card.id] = rec;
    const cat = p.categories[j.card.category] || { right: 0, wrong: 0 };
    if (j.correct) cat.right += 1; else cat.wrong += 1;
    p.categories[j.card.category] = cat;
  });
}
