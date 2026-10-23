import { useEffect, useState } from 'preact/hooks';
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

/** The level as a pearl that grows with it, in a brass ring that fills toward the next level; it can fill when it first appears. */
export function LevelPearl({ n, pct, animate = false, size }: { n: number; pct: number; animate?: boolean; size?: 'lg' }) {
  const r = 22;
  const len = 2 * Math.PI * r;
  const [shown, setShown] = useState(animate ? 0 : pct);
  useEffect(() => {
    if (!animate) { setShown(pct); return; }
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(pct)));
    return () => cancelAnimationFrame(id);
  }, [pct]);
  // From two fifths of the ring at level 1 to four fifths by level 30.
  const grow = 0.4 + 0.42 * Math.min(1, Math.max(0, n - 1) / 29);
  return (
    <span class={`level-pearl ${size || ''}`} style={{ '--p': grow.toFixed(3) }} aria-hidden="true">
      <svg viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} />
        <circle class="fill" cx="24" cy="24" r={r} style={{ strokeDasharray: `${len}`, strokeDashoffset: `${len * (1 - shown)}` }} />
      </svg>
      <i class="bead ok" />
      <b class="num">{n}</b>
    </span>
  );
}
