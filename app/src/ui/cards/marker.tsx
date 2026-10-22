import type { ComponentChildren } from 'preact';
import type { Signal } from '../../content/types';

const URLISH = /((?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s،,]*)?|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi;

export interface MarkerOptions {
  /** Highlight marks (debrief). */
  on: boolean;
  /** Index of the signal to pulse. */
  active?: number | null;
  /** Flag hunt: which marks were found so far (they stay hidden until found). */
  hunt?: Set<number>;
}

export interface Marker {
  seg: (text: string) => ComponentChildren;
  plain: (text: string) => ComponentChildren;
}

const FILE_EXT = /\.(pdf|html?|docx?|xlsx?|pptx?|zip|rar|exe|apk|jpe?g|png|gif|txt|csv|js|svg|mp3|mp4|wav)$/i;
/** A match inside a longer token (a file name, a handle, an email's local part) is not a link. */
export function isLinkish(text: string, at: number, v: string): boolean {
  if (/^\d+(\.\d+)+$/.test(v)) return false;
  if (/[A-Za-z0-9_@.\-]/.test(text[at - 1] || '')) return false;
  if (/[A-Za-z0-9_]/.test(text[at + v.length] || '')) return false;
  if (!v.includes('@') && !v.includes('/') && FILE_EXT.test(v)) return false;
  return true;
}

const PHONE = /\+\s?\d[\d\s•()]{5,}\d/g;
const ARABIC = /[\u0600-\u06FF]/;
/** Text with no Arabic letters but with digits or Latin letters reads left to right even inside Arabic. */
export const isLtrRun = (t: string) => !ARABIC.test(t) && /[0-9A-Za-z]/.test(t);

/** Phone numbers inside a sentence keep their own direction, so +965 never turns into 965+. */
function phones(text: string, keyBase: string): ComponentChildren[] {
  const out: ComponentChildren[] = [];
  let last = 0;
  for (const m of text.matchAll(PHONE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    out.push(<bdi key={`${keyBase}-p${at}`} dir="ltr">{m[0]}</bdi>);
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function linkify(text: string, keyBase: string): ComponentChildren[] {
  const out: ComponentChildren[] = [];
  let last = 0;
  for (const m of text.matchAll(URLISH)) {
    const v = m[0];
    const at = m.index ?? 0;
    if (!isLinkish(text, at, v)) continue;
    if (at > last) out.push(...phones(text.slice(last, at), `${keyBase}-${last}`));
    out.push(<span class="link" key={`${keyBase}-l${at}`}>{v}</span>);
    last = at + v.length;
  }
  if (last < text.length) out.push(...phones(text.slice(last), `${keyBase}-${last}`));
  return out;
}

/** Keeps Latin runs (addresses, codes, amounts) whole and in their own direction inside Arabic sentences. */
const LTR_RUN = /[A-Za-z0-9][A-Za-z0-9._%+\-@:/]*[A-Za-z0-9/]|[A-Za-z0-9]/g;
export function bidi(text: string): ComponentChildren[] {
  const out: ComponentChildren[] = [];
  let last = 0;
  for (const m of text.matchAll(LTR_RUN)) {
    const at = m.index ?? 0;
    if (!/[A-Za-z]/.test(m[0]) || m[0].length < 4) continue;
    if (at > last) out.push(text.slice(last, at));
    out.push(<bdi class="ltr-run" key={`b${at}`} dir="ltr">{m[0]}</bdi>);
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * Splits card text so each signal's mark is wrapped once, in reading order, across the whole card.
 * A mark is used the first time it appears; later fields show it as plain text.
 */
export function createMarker(signals: Signal[] | null, opts: MarkerOptions): Marker {
  const used = new Set<number>();
  let n = 0;
  const seg = (text: string): ComponentChildren => {
    if (!text) return text;
    if (!signals || !signals.length) return linkify(text, `p${n++}`);
    const parts: ComponentChildren[] = [];
    let rest = text;
    let guard = 0;
    while (rest && guard++ < 12) {
      let best: { i: number; at: number } | null = null;
      signals.forEach((s, i) => {
        if (used.has(i)) return;
        const at = rest.indexOf(s.mark);
        if (at >= 0 && (!best || at < best.at)) best = { i, at };
      });
      if (!best) break;
      const { i, at } = best as { i: number; at: number };
      const s = signals[i];
      used.add(i);
      if (at > 0) parts.push(...linkify(rest.slice(0, at), `s${n++}`));
      const isLink = /[a-z0-9-]+\.[a-z]{2,}/i.test(s.mark) && !/\s/.test(s.mark);
      if (opts.hunt) {
        const found = opts.hunt.has(i);
        parts.push(
          <span key={`m${i}`} data-i={i} dir={isLtrRun(s.mark) ? 'ltr' : undefined} class={`${found ? `mk ${s.kind} on` : 'mk-hidden'} ${isLink ? 'link' : ''}`}>
            {s.mark}
            {found && <span class="mk-n">{i + 1}</span>}
          </span>,
        );
      } else if (opts.on) {
        parts.push(
          <span key={`m${i}`} data-i={i} dir={isLtrRun(s.mark) ? 'ltr' : undefined} class={`mk ${s.kind} ${isLink ? 'link' : ''} ${opts.active === i ? 'pulse' : ''}`} style={{ transitionDelay: `${120 + i * 110}ms` }}>
            {s.mark}
            <span class="mk-n" aria-hidden="true">{i + 1}</span>
          </span>,
        );
      } else {
        parts.push(isLink ? <span key={`m${i}`} class="link">{s.mark}</span> : isLtrRun(s.mark) ? <bdi key={`m${i}`} dir="ltr">{s.mark}</bdi> : s.mark);
      }
      rest = rest.slice(at + s.mark.length);
    }
    if (rest) parts.push(...linkify(rest, `r${n++}`));
    return parts;
  };
  return { seg, plain: (text: string) => linkify(text, `x${n++}`) };
}
