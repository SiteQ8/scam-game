import { computed } from '@preact/signals';
import { settings } from '../state/store';
import { S, COUNTS, RANKS, type StringKey } from './strings';
import type { Lang } from '../content/types';

function deviceLang(): Lang {
  const list = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']);
  return list.some((l) => l && l.toLowerCase().startsWith('ar')) && list[0].toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export const lang = computed<Lang>(() => (settings.value.lang === 'system' ? deviceLang() : settings.value.lang));
export const isRTL = computed(() => lang.value === 'ar');

export function t(key: StringKey, vars?: Record<string, string | number>): string {
  let s: string = S[key][lang.value];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(fmtNum(v));
  return s;
}

/** Pick the en/ar value of a bilingual record. */
export function L(rec: { en: string; ar: string }): string {
  return rec[lang.value];
}

const nf = new Intl.NumberFormat('en-US');
export function fmtNum(v: string | number): string {
  return typeof v === 'number' ? nf.format(v) : v;
}

const arRules = new Intl.PluralRules('ar');
/** A number with its noun, with Arabic agreement (يوم واحد، يومان، ثلاثة أيام، أحد عشر يوماً). */
export function count(n: number, noun: keyof typeof COUNTS): string {
  const c = COUNTS[noun];
  if (lang.value === 'ar') {
    const cat = arRules.select(n) as 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
    const form = cat === 'zero' ? c.ar.other : c.ar[cat];
    return form.replace('{n}', nf.format(n));
  }
  return `${nf.format(n)} ${n === 1 ? c.en[0] : c.en[1]}`;
}

/** A strand in words: "8 lustrous pearls and 2 dull beads", «8 لؤلؤات لامعة وخرزتان باهتتان». */
export function strandTally(right: number, total: number): string {
  const wrong = total - right;
  if (!wrong) return count(right, 'pearl');
  if (!right) return count(wrong, 'bead');
  return lang.value === 'ar' ? `${count(right, 'pearl')} و${count(wrong, 'bead')}` : `${count(right, 'pearl')} and ${count(wrong, 'bead')}`;
}

export function rankFor(xp: number) {
  let idx = 0;
  RANKS.forEach((r, i) => { if (xp >= r.xp) idx = i; });
  const cur = RANKS[idx];
  const next = RANKS[idx + 1];
  return { idx, name: cur[lang.value], next: next ? { name: next[lang.value], xp: next.xp } : null, floor: cur.xp };
}

/** Countdown text such as "5h 12m" or "5س 12د". */
export function duration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return lang.value === 'ar' ? `${h}س ${m}د` : `${h}h ${m}m`;
}

export function applyDocumentLang() {
  const el = document.documentElement;
  el.lang = lang.value;
  el.dir = isRTL.value ? 'rtl' : 'ltr';
}
