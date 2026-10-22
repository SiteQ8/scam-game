import type { ComponentChildren } from 'preact';
import { signal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { Icon } from './Icon';
import type { IconName } from '../icons.generated';
import { t } from '../../i18n/i18n';
import { selection } from '../../platform/haptics';
import { sfx } from '../../platform/audio';

export function Mark({ class: cls = 'mark' }: { class?: string }) {
  return (
    <svg class={cls} viewBox="0 0 64 64" aria-hidden="true">
      <g transform="rotate(-8 30 32)">
        <rect x="12" y="9" width="36" height="46" rx="8" fill="#FBFAF7" />
        <rect x="18" y="19" width="22" height="3.6" rx="1.8" fill="#A3ABB8" />
        <rect x="16" y="27" width="27" height="8" rx="2.2" fill="#FFD43B" />
        <rect x="18" y="29.2" width="21" height="3.6" rx="1.8" fill="#141820" />
        <rect x="18" y="40" width="15" height="3.6" rx="1.8" fill="#A3ABB8" />
      </g>
      <g transform="rotate(-14 45 46)">
        <circle cx="45" cy="46" r="11.5" fill="none" stroke="#E5484D" stroke-width="3.4" />
        <circle cx="45" cy="46" r="7.4" fill="none" stroke="#E5484D" stroke-width="1.6" />
        <path d="M42 43 48 49M48 43 42 49" stroke="#E5484D" stroke-width="2.4" stroke-linecap="round" />
      </g>
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

export function Stars({ n, of = 3 }: { n: number; of?: number }) {
  return (
    <span class="stars" aria-label={`${n}/${of}`}>
      {Array.from({ length: of }, (_, i) => <Icon name="star" class={i < n ? 'on' : ''} />)}
    </span>
  );
}

export function Pips({ total, results, current }: { total: number; results: boolean[]; current: number }) {
  return (
    <div class="pips" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <i class={`pip ${i < results.length ? (results[i] ? 'ok' : 'no') : i === current ? 'now' : ''}`} />
      ))}
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
