import type { Achievement } from '../../engine/achievements';
import { Icon } from './Icon';

/** A badge as a round medal: tier coloured when earned, a progress ring while it is still on its way. */
export function Medal({ a, on, ratio, size = 'md' }: { a: Achievement; on: boolean; ratio?: number; size?: 'md' | 'lg' }) {
  const r = 30;
  const len = 2 * Math.PI * r;
  return (
    <span class={`medal ${size} tier-${a.tier} ${on ? 'on' : 'off'}`} aria-hidden="true">
      {!on && ratio !== undefined && (
        <svg class="ring" viewBox="0 0 68 68">
          <circle cx="34" cy="34" r={r} />
          <circle class="fill" cx="34" cy="34" r={r} style={{ strokeDasharray: `${len}`, strokeDashoffset: `${len * (1 - Math.max(0, Math.min(1, ratio)))}` }} />
        </svg>
      )}
      <span class="face"><Icon name={a.icon} /></span>
    </span>
  );
}

/** The level as a number inside a ring that fills toward the next level. */
export function LevelRing({ n, pct }: { n: number; pct: number }) {
  const r = 34;
  const len = 2 * Math.PI * r;
  return (
    <span class="level-ring" aria-hidden="true">
      <svg viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} />
        <circle class="fill" cx="40" cy="40" r={r} style={{ strokeDasharray: `${len}`, strokeDashoffset: `${len * (1 - pct)}` }} />
      </svg>
      <b class="num">{n}</b>
    </span>
  );
}
