import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Lang, Verdict } from '../../content/types';
import { S } from '../../i18n/strings';
import { impact } from '../../platform/haptics';

export interface SwipeApi {
  decide: (v: Verdict) => void;
  exit: (dir: 'left' | 'right') => Promise<void>;
}

interface Props {
  children: ComponentChildren;
  locked: boolean;
  said: Verdict | null;
  truth: Verdict | null;
  lang: Lang;
  reduceMotion: boolean;
  parked?: boolean;
  offset?: number;
  onDecide: (v: Verdict) => void;
  apiRef: { current: SwipeApi | null };
}

const DIST = 96;
const VELOCITY = 0.45; // px per ms

/** The judged card: follows the finger, previews the stamp, and commits on distance or a quick flick. */
export function SwipeCard({ children, locked, said, truth, lang, reduceMotion, parked = false, offset = 0, onDecide, apiRef }: Props) {
  const [settled, setSettled] = useState<Record<string, boolean>>({});
  const wrap = useRef<HTMLDivElement>(null);
  const stScam = useRef<HTMLDivElement>(null);
  const stLegit = useRef<HTMLDivElement>(null);
  const g = useRef({ active: false, dragging: false, x0: 0, y0: 0, id: -1, pts: [] as { x: number; t: number }[], decided: false, crossed: 0 });

  const preview = (dx: number) => {
    const p = Math.min(1, Math.abs(dx) / (DIST + 10));
    const on = dx < 0 ? stScam.current : stLegit.current;
    const off = dx < 0 ? stLegit.current : stScam.current;
    if (on) {
      on.style.opacity = String(p * 0.9);
      on.style.transform = `translate(-50%, -50%) rotate(var(--rot)) scale(${1.3 - 0.3 * p})`;
    }
    if (off) { off.style.opacity = '0'; off.style.transform = ''; }
    const crossed = Math.abs(dx) >= DIST ? Math.sign(dx) : 0;
    if (crossed !== g.current.crossed) { g.current.crossed = crossed; if (crossed) impact('light'); }
  };
  const clearPreview = () => {
    for (const el of [stScam.current, stLegit.current]) if (el) { el.style.opacity = ''; el.style.transform = ''; }
  };

  const decide = (v: Verdict) => {
    if (g.current.decided || !wrap.current) return;
    g.current.decided = true;
    const el = wrap.current;
    el.style.transition = 'transform 260ms cubic-bezier(0.23, 1, 0.32, 1)';
    el.style.transform = '';
    clearPreview();
    onDecide(v);
  };

  const exit = (dir: 'left' | 'right') => new Promise<void>((res) => {
    const el = wrap.current;
    if (!el) return res();
    el.style.transition = reduceMotion ? 'opacity 160ms ease' : 'transform 300ms cubic-bezier(0.32, 0, 0.67, 0), opacity 300ms ease';
    if (!reduceMotion) el.style.transform = `translate3d(${dir === 'left' ? -125 : 125}%, -2%, 0) rotate(${dir === 'left' ? -16 : 16}deg)`;
    el.style.opacity = '0';
    setTimeout(res, reduceMotion ? 150 : 270);
  });

  useEffect(() => { apiRef.current = { decide, exit }; return () => { apiRef.current = null; }; });

  const onDown = (e: PointerEvent) => {
    if (locked || g.current.decided || !e.isPrimary) return;
    if ((e.target as HTMLElement).closest('button')) return;
    Object.assign(g.current, { active: true, dragging: false, x0: e.clientX, y0: e.clientY, id: e.pointerId, pts: [{ x: e.clientX, t: e.timeStamp }], crossed: 0 });
  };
  const onMove = (e: PointerEvent) => {
    const s = g.current;
    if (!s.active || e.pointerId !== s.id || !wrap.current) return;
    const dx = e.clientX - s.x0;
    const dy = e.clientY - s.y0;
    if (!s.dragging) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.15) {
        s.dragging = true;
        wrap.current.setPointerCapture(e.pointerId);
        wrap.current.style.transition = 'none';
      } else if (Math.abs(dy) > 12) { s.active = false; return; } else return;
    }
    e.preventDefault();
    const rot = reduceMotion ? 0 : Math.max(-16, Math.min(16, dx / 20));
    wrap.current.style.transform = `translate3d(${dx}px, ${reduceMotion ? 0 : dy * 0.1}px, 0) rotate(${rot}deg)`;
    preview(dx);
    s.pts.push({ x: e.clientX, t: e.timeStamp });
    if (s.pts.length > 6) s.pts.shift();
  };
  const settle = () => {
    const el = wrap.current;
    if (!el) return;
    el.style.transition = 'transform 460ms cubic-bezier(0.3, 1.35, 0.5, 1)';
    el.style.transform = '';
    for (const st of [stScam.current, stLegit.current]) if (st) { st.style.transition = 'opacity 200ms ease'; st.style.opacity = '0'; setTimeout(() => { st.style.transition = ''; st.style.opacity = ''; st.style.transform = ''; }, 220); }
  };
  const onUp = (e: PointerEvent) => {
    const s = g.current;
    if (!s.active || e.pointerId !== s.id) return;
    s.active = false;
    if (!s.dragging) return;
    s.dragging = false;
    const dx = e.clientX - s.x0;
    const a = s.pts[0];
    const b = s.pts[s.pts.length - 1];
    const v = (b.x - a.x) / Math.max(1, b.t - a.t);
    if (Math.abs(dx) >= DIST || (Math.abs(v) > VELOCITY && Math.abs(dx) > 24 && Math.sign(v) === Math.sign(dx))) decide(dx < 0 ? 'scam' : 'legit');
    else settle();
  };
  const onCancel = () => { if (g.current.dragging) settle(); g.current.active = false; g.current.dragging = false; };

  const wrong = said && truth && said !== truth;
  const stampClass = (v: Verdict, isTruth = false) => {
    const key = isTruth ? `t-${v}` : v;
    const active = isTruth || said === v;
    if (!active) return `stamp ${v}`;
    const state = settled[key] ? 'settled' : 'slam';
    return `stamp ${v} ${isTruth ? 'truth' : ''} ${state} ${parked && settled[key] ? 'parked' : ''} ${!isTruth && wrong ? 'fade' : ''}`;
  };
  const onEnd = (key: string) => () => setSettled((s) => ({ ...s, [key]: true }));
  return (
    <div class="card-wrap entering" ref={wrap} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onCancel}>
      <div class="card-pos" style={{ '--offset': `${offset}px` }}>
        {children}
        <div ref={stScam} class={stampClass('scam')} lang={lang} onAnimationEnd={onEnd('scam')} aria-hidden="true">{S.scam[lang]}</div>
        <div ref={stLegit} class={stampClass('legit')} lang={lang} onAnimationEnd={onEnd('legit')} aria-hidden="true">{S.legit[lang]}</div>
        {wrong && truth && <div class={stampClass(truth, true)} lang={lang} onAnimationEnd={onEnd(`t-${truth}`)} aria-hidden="true">{S[truth][lang]}</div>}
      </div>
    </div>
  );
}
