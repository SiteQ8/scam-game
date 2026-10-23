import type { Card, PackId } from '../content/types';
import type { IconName } from '../ui/icons.generated';

export interface Pack { id: PackId; icon: IconName }

/** The themed packs, in the order the home screen shows them. */
export const PACKS: Pack[] = [
  { id: 'banking', icon: 'landmark' },
  { id: 'delivery', icon: 'package' },
  { id: 'jobs', icon: 'briefcase' },
  { id: 'invest', icon: 'trending-up' },
  { id: 'gov', icon: 'building-2' },
  { id: 'ai', icon: 'sparkles' },
];

/**
 * Cards that belong to no pack. The daily case and the journey draw only from these, so a day's
 * case and a chapter's cards stay the same when packs are added; packs join the random modes.
 */
export const isCore = (c: Card) => !c.pack;

/** A pack's cards, easier first. */
export function packDeck(id: PackId, all: readonly Card[]): Card[] {
  return all.filter((c) => c.pack === id).sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id));
}
