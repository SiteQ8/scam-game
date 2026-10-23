// Website behaviour: today's case number, entrances, the live checker, the moving swipe, the questions on a phone,
// the time in Kuwait City and the language choice.
import { render, type Lang } from './checker-view';
import { dayIndex, caseNumber } from '../../app/src/engine/daily';

const root = document.documentElement;
const lang: Lang = root.lang === 'ar' ? 'ar' : 'en';
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const $ = <T extends Element = HTMLElement>(sel: string, el: ParentNode = document) => el.querySelector(sel) as T | null;
const $$ = <T extends Element = HTMLElement>(sel: string, el: ParentNode = document) => Array.from(el.querySelectorAll(sel)) as T[];

/* Today's case number and date, the same numbering the game uses. */
function stampToday() {
  const n = Math.max(1, caseNumber(dayIndex()));
  const now = new Date();
  const loc = lang === 'ar' ? 'ar-KW-u-nu-latn' : 'en-GB';
  const parts = new Intl.DateTimeFormat(loc, { weekday: 'long', day: 'numeric', month: 'long' }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || '';
  const date = `${get('weekday')} ${get('day')} ${get('month')}`;
  for (const el of $$('[data-case-n]')) el.textContent = lang === 'ar' ? `الملف رقم ${n}` : `Case #${n}`;
  // The phone screens that show the case number get today's too, in the line the capture left out.
  for (const el of $$('[data-case-tpl]')) el.textContent = (el.getAttribute('data-case-tpl') || '').replace('{n}', String(n));
  for (const el of $$('[data-case-date]')) el.textContent = date;
  for (const el of $$('[data-case-sep]')) el.hidden = false;
}

/* Entrances: each section's parts rise in once, staggered by their --d. */
function reveals() {
  const items = $$('.rv');
  if (!items.length || !('IntersectionObserver' in window) || reduce.matches) return;
  root.classList.add('rv-ready');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  for (const el of items) io.observe(el);
}

/* The live checker: the game's own engine, run on whatever is in the box. */
function checker() {
  const input = $<HTMLTextAreaElement>('#sc-input');
  const out = $('#sc-result');
  const signs = $('#sc-signs');
  const live = $('#sc-live');
  const data = $('#sc-examples');
  if (!input || !out) return;
  const examples: string[] = data ? JSON.parse(data.textContent || '[]') : [];
  const empty = lang === 'ar' ? 'اكتب رسالة أو الصقها لتفحصها.' : 'Type or paste a message to check it.';
  let timer = 0;
  let last = '';
  const fit = () => {
    if (CSS.supports('field-sizing', 'content')) return;
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
  };
  const run = () => {
    const text = input.value;
    if (text === last) return;
    last = text;
    const view = render(text, lang, empty);
    out.innerHTML = view.html;
    if (signs) signs.innerHTML = view.list;
    if (live) live.textContent = view.summary;
  };
  input.addEventListener('input', () => {
    fit();
    for (const b of $$('[data-example]')) b.setAttribute('aria-pressed', String(examples[Number(b.dataset.example)] === input.value));
    window.clearTimeout(timer);
    timer = window.setTimeout(run, 160);
  });
  for (const b of $$<HTMLButtonElement>('[data-example]')) {
    b.addEventListener('click', () => {
      const text = examples[Number(b.dataset.example)];
      if (text == null) return;
      input.value = text;
      for (const o of $$('[data-example]')) o.setAttribute('aria-pressed', String(o === b));
      fit();
      run();
    });
  }
  last = input.value;
  fit();
}

/* The time in Kuwait City, in the footer, kept to the minute. */
function clock() {
  const el = $('[data-clock]');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-KW-u-nu-latn' : 'en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kuwait' });
  const tick = () => { el.textContent = fmt.format(new Date()); };
  tick();
  window.setInterval(tick, 20000);
}

/* The swipe in the second stage plays while it is on screen and rests when it is not. It never starts for a visitor
   who asks for less motion, and its button stops or starts it at any time. */
function loops() {
  for (const v of $$<HTMLVideoElement>('video.loop-v')) {
    const btn = v.parentElement?.querySelector<HTMLButtonElement>('.loop-btn');
    if (!btn || !('IntersectionObserver' in window)) continue;
    let stopped = reduce.matches;
    let seen = false;
    const label = () => {
      const name = v.paused ? btn.dataset.play : btn.dataset.pause;
      if (name) btn.setAttribute('aria-label', name);
      btn.classList.toggle('playing', !v.paused);
    };
    const play = () => { v.play().catch(() => { /* the poster stays */ }); };
    btn.hidden = false;
    btn.addEventListener('click', () => {
      stopped = !v.paused;
      if (stopped) v.pause(); else play();
    });
    v.addEventListener('play', label);
    v.addEventListener('pause', label);
    new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen && !stopped) play(); else if (!seen) v.pause();
    }, { threshold: 0.35 }).observe(v);
    reduce.addEventListener?.('change', () => { if (reduce.matches) { stopped = true; v.pause(); } });
    label();
  }
}

/* On a phone each question opens on a tap and only the first three start open. On a wider screen every answer stays
   open, so there the questions are not controls, and a phone turned sideways opens them all. */
function questions() {
  const qs = $$<HTMLDetailsElement>('details.qa');
  if (!qs.length) return;
  const phone = window.matchMedia('(max-width: 700px)');
  const apply = () => qs.forEach((d, i) => {
    d.open = phone.matches ? i < 3 : true;
    const s = $('summary', d);
    if (s) s.tabIndex = phone.matches ? 0 : -1;
  });
  for (const d of qs) $('summary', d)?.addEventListener('click', (e) => { if (!phone.matches) e.preventDefault(); });
  apply();
  phone.addEventListener?.('change', apply);
}

/* Remember an explicit language choice so the English home page stops suggesting Arabic. */
function languageChoice() {
  for (const a of $$<HTMLAnchorElement>('[data-lang-switch]')) {
    a.addEventListener('click', () => { try { localStorage.setItem('site.lang', a.dataset.langSwitch || ''); } catch { /* private mode */ } });
  }
}

stampToday();
reveals();
checker();
loops();
questions();
clock();
languageChoice();
