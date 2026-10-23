// Levels, the streak week and badges: numbers that always move forward and badges that agree with their progress bars.
import { describe, it, expect } from 'vitest';
import type { Card } from '../app/src/content/types';
import data from '../app/src/content/cards.json';
import { levelFor, xpForLevel, lastWeek, MAX_LEVEL } from '../app/src/engine/levels';
import { ACHIEVEMENTS } from '../app/src/engine/achievements';
import { defaultProgress, type Progress } from '../app/src/state/store';

const CARDS = data as unknown as Card[];

describe('levels', () => {
  it('start at level 1 and need more XP for every next level', () => {
    expect(levelFor(0).n).toBe(1);
    expect(levelFor(299).n).toBe(1);
    expect(levelFor(300).n).toBe(2);
    expect(levelFor(13500).n).toBe(10);
    for (let n = 2; n <= MAX_LEVEL; n++) expect(xpForLevel(n) - xpForLevel(n - 1)).toBeGreaterThan(xpForLevel(n - 1) - xpForLevel(Math.max(1, n - 2)) - 1);
    expect(levelFor(10_000_000)).toMatchObject({ n: MAX_LEVEL, next: null, pct: 1 });
  });
  it('fill the bar between two levels', () => {
    const lv = levelFor(600);
    expect(lv.n).toBe(2);
    expect(lv.pct).toBeCloseTo(0.5);
  });
});

describe('the streak week', () => {
  it('lists the last seven days ending today', () => {
    const week = lastWeek(10, (d) => d % 2 === 0);
    expect(week.map((w) => w.day)).toEqual([4, 5, 6, 7, 8, 9, 10]);
    expect(week.filter((w) => w.done).map((w) => w.day)).toEqual([4, 6, 8, 10]);
  });
});

describe('badges', () => {
  it('have unique ids, a group and a tier', () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
    for (const a of ACHIEVEMENTS) {
      expect(['skill', 'daily', 'journey', 'modes']).toContain(a.group);
      expect(['bronze', 'silver', 'gold']).toContain(a.tier);
    }
  });
  it('unlock exactly when their progress bar is full', () => {
    const players: Progress[] = [defaultProgress(), {
      ...defaultProgress(), xp: 40000, judged: 700, right: 600, legitTrusted: 30, bestRun: 12, rushBest: 26,
      dailyStreak: { current: 30, best: 30, lastDay: 30 },
      journey: Object.fromEntries(['basics', 'delivery', 'banks', 'official', 'calls', 'offers', 'social', 'expert'].map((id) => [id, { stars: 3, best: 10 }])),
      packs: Object.fromEntries(['banking', 'delivery', 'jobs', 'invest', 'gov', 'ai'].map((id) => [id, { stars: 3, best: 10 }])),
      cards: Object.fromEntries(CARDS.map((c) => [c.id, { right: 1, wrong: 0 }])),
    }];
    for (const p of players) {
      for (const a of ACHIEVEMENTS) {
        if (!a.progress) continue;
        const [done, goal] = a.progress(p, CARDS);
        expect(a.check(p, CARDS), `${a.id}: ${done}/${goal}`).toBe(goal > 0 && done >= goal);
      }
    }
  });
});
