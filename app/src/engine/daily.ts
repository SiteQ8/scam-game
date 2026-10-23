import type { Card } from '../content/types';
import { hashString, mulberry32, shuffle } from './random';

// Case #1 is 16 October 2026; every local calendar day after it gets the next number.
const EPOCH = Date.UTC(2026, 9, 16);
export const DAILY_SIZE = 10;

export function dayIndex(now = new Date()): number {
  const local = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((local - EPOCH) / 86400000);
}

export function caseNumber(day: number): number {
  return day + 1;
}

/** The local calendar date of a day index (day 0 is 16 October 2026). */
export function dateOfDay(day: number): Date {
  return new Date(2026, 9, 16 + day);
}

export function msToNextDay(now = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

export type Edition = 'gcc' | 'global';

/**
 * The daily case: ten cards chosen the same way on every device for a given day and edition.
 * Cards are taken in cycles so a card does not come back until the pool has been used once,
 * then the set is balanced (at least 3 legit, at most 7 scams, at most 2 per channel) and
 * ordered from easier to harder.
 */
export function dailyDeck(day: number, edition: Edition, all: readonly Card[]): Card[] {
  const pool = (edition === 'gcc' ? all.slice() : all.filter((c) => c.region === 'global')).sort((a, b) => a.id.localeCompare(b.id));
  if (pool.length <= DAILY_SIZE) return pool.slice().sort(byDifficulty);
  const perCycle = Math.floor(pool.length / DAILY_SIZE);
  const cycle = Math.floor(Math.max(0, day) / perCycle);
  const slot = Math.max(0, day) % perCycle;
  const order = shuffle(pool, mulberry32(hashString(`daily:${edition}:cycle:${cycle}`)));
  const window = order.slice(slot * DAILY_SIZE, slot * DAILY_SIZE + DAILY_SIZE);
  const rest = order.filter((c) => !window.includes(c));
  const rng = mulberry32(hashString(`daily:${edition}:day:${day}`));

  const pick = window.slice();
  const count = (pred: (c: Card) => boolean) => pick.filter(pred).length;
  const swapIn = (want: (c: Card) => boolean, outPred: (c: Card) => boolean) => {
    const candidates = shuffle(rest.filter((c) => want(c) && !pick.includes(c)), rng);
    const outIdx = pick.findIndex(outPred);
    if (candidates.length && outIdx >= 0) pick[outIdx] = candidates[0];
  };
  let guard = 0;
  while (count((c) => c.verdict === 'legit') < 3 && guard++ < 10) swapIn((c) => c.verdict === 'legit', (c) => c.verdict === 'scam');
  guard = 0;
  while (count((c) => c.verdict === 'scam') < 4 && guard++ < 10) swapIn((c) => c.verdict === 'scam', (c) => c.verdict === 'legit');
  guard = 0;
  const channelCount = (ch: string) => pick.filter((c) => c.channel === ch).length;
  for (const ch of new Set(pick.map((c) => c.channel))) {
    while (channelCount(ch) > 2 && guard++ < 20) {
      const victim = pick.filter((c) => c.channel === ch).pop()!;
      const repl = shuffle(rest.filter((c) => c.channel !== ch && c.verdict === victim.verdict && !pick.includes(c) && channelCount(c.channel) < 2), rng)[0];
      if (!repl) break;
      pick[pick.indexOf(victim)] = repl;
    }
  }
  return pick.sort(byDifficulty);
}

function byDifficulty(a: Card, b: Card) {
  return a.difficulty - b.difficulty || a.id.localeCompare(b.id);
}

/** The shared result: the case's strand, a white pearl for each right call and a dark bead for each miss. */
export function shareGrid(results: boolean[]): string {
  return results.map((r) => (r ? '⚪' : '⚫')).join('');
}
