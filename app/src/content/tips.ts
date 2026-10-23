import data from './tips.json';

export interface Tip { id: string; topic: string; en: string; ar: string }

export const TIPS = data as Tip[];

/** The tip for a day index: one per day, in the order written, starting again after the last. */
export function tipFor(day: number): Tip {
  return TIPS[((day % TIPS.length) + TIPS.length) % TIPS.length];
}
