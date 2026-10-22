// Renders the game's checker result as the HTML fragment shown on the website.
// The same function runs at build time (so the page reads well without script) and in the browser.
import { check, extractLinks, locateEvidence, GCC_CODES, type CheckResult, type Finding } from '../../app/src/engine/checker';
import { S } from '../../app/src/i18n/strings';
import { ICONS } from '../../app/src/ui/icons.generated';

export type Lang = 'en' | 'ar';

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ESC[c]);

export const icon = (name: string, cls = 'ico') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

interface Mark { start: number; end: number; n: number }

const PHONE = /\+\s?\d[\d\s•()]{5,}\d/g;
/** Inside Arabic a phone number would flip (+965 becomes 965+), so it keeps its own direction.
 * Latin words and addresses already read correctly, so they are left alone. */
function isolate(text: string): string {
  let out = '';
  let last = 0;
  for (const m of text.matchAll(PHONE)) {
    const at = m.index ?? 0;
    out += esc(text.slice(last, at)) + `<bdi dir="ltr">${esc(m[0])}</bdi>`;
    last = at + m[0].length;
  }
  return out + esc(text.slice(last));
}
const phoneLike = (t: string) => /^\+?\s?\d[\d\s•()]*$/.test(t);
const ARABIC = /[\u0600-\u06FF]/;
const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;

/** Where each address and email sits, so it stays whole instead of breaking at a hyphen. */
function addressRanges(text: string): Array<[number, number]> {
  const found: Array<[number, number]> = [];
  const add = (v: string) => { for (let at = text.indexOf(v); at >= 0; at = text.indexOf(v, at + v.length)) found.push([at, at + v.length]); };
  extractLinks(text).forEach(add);
  for (const m of text.matchAll(EMAIL)) add(m[0]);
  found.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const out: Array<[number, number]> = [];
  for (const r of found) if (!out.length || r[0] >= out[out.length - 1][1]) out.push(r);
  return out;
}

function markedText(text: string, marks: Mark[]): string {
  const sorted = marks.slice().sort((a, b) => a.start - b.start).filter((m, i, all) => i === 0 || m.start >= all[i - 1].end);
  // An address is wrapped only when every mark sits wholly inside it or wholly outside it, so the tags nest.
  const spans = addressRanges(text).filter(([s, e]) => sorted.every((m) => m.end <= s || m.start >= e || (m.start >= s && m.end <= e)));
  const cuts = [...new Set([0, text.length, ...sorted.flatMap((m) => [m.start, m.end]), ...spans.flat()])].sort((a, b) => a - b);
  let out = '';
  cuts.forEach((p, i) => {
    for (const m of sorted) if (m.end === p) out += '</mark>';
    for (const [, e] of spans) if (e === p) out += '</span>';
    for (const [s, e] of spans) if (s === p) out += `<span class="addr"${ARABIC.test(text.slice(s, e)) ? '' : ' dir="ltr"'}>`;
    for (const m of sorted) {
      if (m.start !== p) continue;
      const inner = text.slice(m.start, m.end);
      out += `<mark class="${/\s/.test(inner) ? 'm' : 'm nw'}" style="--i:${m.n}"${phoneLike(inner) ? ' dir="ltr"' : ''}><span class="m-n" aria-hidden="true">${m.n}</span>`;
    }
    if (i < cuts.length - 1) out += isolate(text.slice(p, cuts[i + 1]));
  });
  return out;
}

export interface View { html: string; result: CheckResult | null; summary: string }

const LEVEL = { high: ['levelHigh', 'shield-alert'], medium: ['levelMedium', 'triangle-alert'], low: ['levelLow', 'info'] } as const;

export function count(n: number, lang: Lang): string {
  if (lang === 'en') return `${n} warning sign${n === 1 ? '' : 's'}`;
  if (n === 1) return 'علامة تحذير واحدة';
  if (n === 2) return 'علامتا تحذير';
  if (n >= 3 && n <= 10) return `${n} علامات تحذير`;
  return `${n} علامة تحذير`;
}

/** How many of the signs are marked in the text, worded for the total. */
function marked(m: number, n: number, lang: Lang): string {
  if (lang === 'en') return m === n ? (n === 1 ? 'marked in the text' : n === 2 ? 'both marked in the text' : `all ${n} marked in the text`) : `${m} marked in the text`;
  if (m === n) return n === 1 ? 'وهي محددة في النص' : n === 2 ? 'وكلتاهما محددة في النص' : 'وكلها محددة في النص';
  if (m === 1) return n === 2 ? 'إحداهما محددة في النص' : 'واحدة منها محددة في النص';
  if (m === 2) return 'اثنتان منها محددتان في النص';
  return `${m} منها محددة في النص`;
}

/** Build the result fragment for a message. */
export function render(text: string, lang: Lang, empty: string): View {
  // The examples carry invisible marks for the text box (direction marks, word joiners); the view does its own layout.
  const input = text.replace(/[\u200E\u200F\u2060\u2066-\u2069]/g, '').trim();
  if (!input) return { html: `<p class="chk-empty">${esc(empty)}</p>`, result: null, summary: empty };
  const result = check(input, { localCodes: GCC_CODES });
  const negatives = result.findings.filter((f) => !f.positive);
  const positives = result.findings.filter((f) => f.positive);
  const marks: Mark[] = [];
  negatives.forEach((f, i) => {
    const at = locateEvidence(input, f.evidence);
    if (at && !marks.some((m) => at[0] < m.end && at[1] > m.start)) marks.push({ start: at[0], end: at[1], n: i + 1 });
  });
  const [labelKey, ico] = LEVEL[result.level];
  const label = S[labelKey][lang];
  const tail = marks.length ? marked(marks.length, negatives.length, lang) : '';
  const sub = negatives.length ? `${count(negatives.length, lang)}${tail ? (tail.startsWith('و') ? ' ' : lang === 'en' ? ', ' : '، ') + tail : ''}` : S.noFlags[lang];
  const item = (f: Finding, i: number, kind: 'red' | 'green') =>
    `<li class="${kind}"><span class="chk-n" aria-hidden="true">${kind === 'red' ? i + 1 : icon('check', 'ico-n')}</span><div><b>${esc(f[lang].title)}</b><p>${esc(f[lang].body)}</p></div></li>`;
  const html = [
    `<div class="chk-head lvl-${result.level}">${icon(ico, 'ico-head')}<div><b>${esc(label)}</b><span>${esc(sub)}</span></div></div>`,
    `<div class="chk-msg" dir="auto">${markedText(input, marks)}</div>`,
    negatives.length || positives.length
      ? `<ol class="chk-list">${negatives.map((f, i) => item(f, i, 'red')).join('')}${positives.map((f, i) => item(f, i, 'green')).join('')}</ol>`
      : '',
    `<p class="chk-foot">${icon('info', 'ico-foot')}<span>${esc(S.checkerDisclaimer[lang])}</span></p>`,
  ].join('');
  return { html, result, summary: lang === 'ar' ? `${label}، ${sub}` : `${label}. ${sub}` };
}
