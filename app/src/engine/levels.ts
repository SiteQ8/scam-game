// Levels turn experience points into steady steps: every round of ten cards moves the bar,
// and the ranks (Rookie to Guardian) name the stretch of levels a player is in.
export const MAX_LEVEL = 50;

/** XP needed to reach level n: 150 × n × (n − 1), so level 2 is 300 XP, level 5 is 3,000 and level 10 is 13,500. */
export function xpForLevel(n: number): number {
  return 150 * n * (n - 1);
}

export interface Level { n: number; floor: number; next: number | null; pct: number }

export function levelFor(xp: number): Level {
  let n = 1;
  while (n < MAX_LEVEL && xp >= xpForLevel(n + 1)) n++;
  const floor = xpForLevel(n);
  const next = n < MAX_LEVEL ? xpForLevel(n + 1) : null;
  return { n, floor, next, pct: next ? Math.min(1, (xp - floor) / (next - floor)) : 1 };
}

/** The days of the last week, oldest first, with whether the daily case was closed on each. */
export function lastWeek(today: number, done: (day: number) => boolean): { day: number; done: boolean }[] {
  return Array.from({ length: 7 }, (_, i) => today - 6 + i).map((day) => ({ day, done: done(day) }));
}
