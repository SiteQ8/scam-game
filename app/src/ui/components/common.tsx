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

/**
 * The strand: one seat per card. A right call seats a lustrous pearl, a wrong one a dull bead,
 * and the seat being played rings in brass. Beads added since the last render drop in.
 */
export function Strand({ total, results, current = -1, size, label }: { total: number; results: boolean[]; current?: number; size?: 'sm' | 'lg'; label?: string }) {
  const last = useRef(results.length);
  const fresh = useRef(results.length);
  if (results.length > last.current) { fresh.current = last.current; last.current = results.length; }
  else if (results.length < last.current) { last.current = results.length; fresh.current = results.length; }
  return (
    <div class={`strand ${size || ''}`} style={{ '--n': total }} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : 'true'}>
      {Array.from({ length: total }, (_, i) => {
        const state = i < results.length ? (results[i] ? 'ok' : 'no') : i === current ? 'seat now' : 'seat';
        const isFresh = i >= fresh.current && i < results.length;
        return <i key={i} class={`bead ${state}${isFresh ? ' fresh' : ''}`} style={{ '--i': i }} />;
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
