import type { Achievement } from '../../engine/achievements';
import { MAX_LEVEL } from '../../engine/levels';
import { Icon } from './Icon';

const TIER_PEARLS = { bronze: 1, silver: 2, gold: 3 } as const;

/** A badge: earned, a nacre face in a brass ring; not yet, an empty brass seat. The tier shows as one to three pearls. */
export function Medal({ a, on, size = 'md', tier = false }: { a: Achievement; on: boolean; size?: 'md' | 'lg' | 'sm'; tier?: boolean }) {
  const n = TIER_PEARLS[a.tier];
  return (
    <span class={`medal ${size} ${on ? 'on' : 'off'}`} aria-hidden="true">
      <span class="face"><Icon name={a.icon} /></span>
      {tier && on && <span class="tier">{Array.from({ length: n }, () => <i class="bead ok" />)}</span>}
    </span>
  );
}

/** How large the level's pearl sits in its seat: small at level 1, growing fast at first, nearly filling it by the top level. */
export function pearlSize(n: number): number {
  const lv = Math.max(1, Math.min(MAX_LEVEL, n));
  if (lv <= 10) return 0.29 + 0.54 * (Math.log(lv) / Math.log(10));
  return 0.83 + 0.05 * ((lv - 10) / (MAX_LEVEL - 10));
}

/** The level as a pearl in a brass seat: the larger the pearl, the higher the level, the way merchants graded pearls by size. */
export function LevelPearl({ n, animate = false, size }: { n: number; animate?: boolean; size?: 'lg' | 'sm' }) {
  return (
    <span class={`level-pearl ${size || ''}`} style={{ '--p': pearlSize(n).toFixed(3) }} aria-hidden="true">
      <i class={`bead ok${animate ? ' fresh' : ''}`} />
    </span>
  );
}
