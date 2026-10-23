import type { ComponentChildren } from 'preact';
import { signal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { Icon } from './Icon';
import type { IconName } from '../icons.generated';
import { t } from '../../i18n/i18n';
import { selection } from '../../platform/haptics';
import { sfx } from '../../platform/audio';

/** The mark: a brass loupe over a pearl, on the merchant's red cloth. */
export function Mark({ class: cls = 'mark' }: { class?: string }) {
  return (
    <svg class={cls} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <radialGradient id="sd-pearl" cx="0.36" cy="0.32" r="0.72">
          <stop offset="0" stop-color="#ffffff" />
          <stop offset="0.2" stop-color="#f6efe3" />
          <stop offset="0.62" stop-color="#dccfbc" />
          <stop offset="1" stop-color="#b3a48c" />
        </radialGradient>
        <radialGradient id="sd-cloth" cx="0.85" cy="0.1" r="1.1">
          <stop offset="0" stop-color="#94202f" />
          <stop offset="0.55" stop-color="#7c1424" />
          <stop offset="1" stop-color="#5c0e1a" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#sd-cloth)" />
      <path d="M38.6 38.6 50 50" stroke="#c9a45c" stroke-width="7" stroke-linecap="round" />
      <circle cx="28" cy="28" r="15" fill="none" stroke="#c9a45c" stroke-width="4.5" />
      <circle cx="28" cy="28" r="9.5" fill="url(#sd-pearl)" />
    </svg>
  );
}

export function TopBar({ title, onBack, right, backIcon = 'arrow-left' }: { title?: string; onBack?: () => void; right?: ComponentChildren; backIcon?: IconName }) {
  return (
    <div class="topbar">
      {onBack ? (
        <button class="icon-btn" onClick={onBack} aria-label={t('back')}>
          <Icon name={backIcon} class={backIcon === 'arrow-left' ? 'flip-rtl' : ''} />
        </button>
      ) : <span class="spacer" />}
      <h1>{title}</h1>
      {right || <span class="spacer" />}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      class="switch"
      role="switch"
      aria-checked={checked ? 'true' : 'false'}
      aria-label={label}
      onClick={() => { selection(); onChange(!checked); }}
    />
  );
}

export function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div class="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button role="radio" aria-checked={o.value === value ? 'true' : 'false'} onClick={() => { selection(); onChange(o.value); }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** A chapter's or a pack's result as three pearls, in place of stars. */
export function Pearls({ n, of = 3 }: { n: number; of?: number }) {
  return (
    <span class="pearls" role="img" aria-label={`${n}/${of}`}>
      {Array.from({ length: of }, (_, i) => <i class={`bead ${i < n ? 'ok' : 'seat'}`} />)}
    </span>
  );
}

/** How far the draped strand sags, as a share of its width, and where its two ends sit. */
const SAG = 0.2;
const END = 0.04;

/**
 * Where each pearl of a draped strand sits: spread evenly along the curve y = SAG · (1 − u²), not evenly across,
 * so the pearls keep the same spacing on the steep ends as in the middle, as they would on a real string.
 * x and y are shares of the strand's width.
 */
export function drape(total: number): { x: number; y: number }[] {
  if (total < 2) return [{ x: 0.5, y: SAG }];
  const half = (1 - 2 * END) / 2;
  const STEPS = 400;
  const at = (u: number) => ({ x: 0.5 + u * half, y: SAG * (1 - u * u) });
  const length: number[] = [0];
  for (let k = 1; k <= STEPS; k++) {
    const a = at(-1 + (2 * (k - 1)) / STEPS);
    const b = at(-1 + (2 * k) / STEPS);
    length.push(length[k - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  const all = length[STEPS];
  return Array.from({ length: total }, (_, i) => {
    const want = (all * i) / (total - 1);
    let k = 1;
    while (k < STEPS && length[k] < want) k++;
    const f = (want - length[k - 1]) / (length[k] - length[k - 1] || 1);
    return at(-1 + (2 * (k - 1 + f)) / STEPS);
  });
}

/**
 * The strand: one seat per card. A right call seats a lustrous pearl, a wrong one a dull bead,
 * and the seat being played rings in brass. Beads added since the last render drop in.
 * A finished strand can be graduated like a necklace, the pearls largest in the middle,
 * and on the cloth it can be draped, laid in a shallow curve the way a necklace rests.
 */
export function Strand({ total, results, current = -1, size, label, graduated = false, draped = false }: { total: number; results: boolean[]; current?: number; size?: 'sm' | 'lg'; label?: string; graduated?: boolean; draped?: boolean }) {
  const last = useRef(results.length);
  const fresh = useRef(results.length);
  if (results.length > last.current) { fresh.current = last.current; last.current = results.length; }
  else if (results.length < last.current) { last.current = results.length; fresh.current = results.length; }
  const spots = draped ? drape(total) : null;
  return (
    <div class={`strand ${size || ''}${graduated ? ' graduated' : ''}${draped ? ' draped' : ''}`} style={{ '--n': total, '--sag': SAG }} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : 'true'}>
      {draped && (
        <svg class="thread" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" style={{ left: `${END * 100}%`, width: `${(1 - 2 * END) * 100}%`, aspectRatio: `${1 - 2 * END} / ${SAG}` }}>
          <path d="M0 0Q50 20 100 0" vector-effect="non-scaling-stroke" />
        </svg>
      )}
      {Array.from({ length: total }, (_, i) => {
        const state = i < results.length ? (results[i] ? 'ok' : 'no') : i === current ? 'seat now' : 'seat';
        const isFresh = i >= fresh.current && i < results.length;
        const mid = (total - 1) / 2;
        const g = graduated && total > 1 ? 1 - Math.abs(i - mid) / mid : 1;
        const spot = spots ? { '--x': `${(spots[i].x * 100).toFixed(2)}%`, '--y': spots[i].y.toFixed(4) } : {};
        return <i key={i} class={`bead ${state}${isFresh ? ' fresh' : ''}`} style={{ '--i': i, '--g': g.toFixed(3), ...spot }} />;
      })}
    </div>
  );
}

// Confirm dialog
export function Confirm({ title, body, confirm, cancel, danger, onConfirm, onCancel }: { title: string; body: string; confirm: string; cancel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);
  return (
    <div class="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t">
        <h3 id="dlg-t">{title}</h3>
        <p>{body}</p>
        <div class="btn-row">
          <button class="btn btn-secondary" onClick={onCancel} autoFocus>{cancel}</button>
          <button class={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirm}</button>
        </div>
      </div>
    </div>
  );
}

// Toasts
const toastMsg = signal<{ text: string; icon: IconName; id: number } | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(text: string, icon: IconName = 'info') {
  toastMsg.value = { text, icon, id: Date.now() };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastMsg.value = null; }, 2600);
}
export function ToastHost() {
  const m = toastMsg.value;
  if (!m) return null;
  return (
    <div class="toast" role="status" key={m.id}>
      <Icon name={m.icon} />
      <span>{m.text}</span>
    </div>
  );
}

/** Screen reader announcement. */
export function announce(text: string) {
  const el = document.getElementById('announcer');
  if (el) { el.textContent = ''; setTimeout(() => { el.textContent = text; }, 30); }
}

export function tapSound() { void sfx('tap'); }
