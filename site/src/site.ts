// Website behaviour: today's case number, the two stages, entrances, the live checker and the embedded game.
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

/* A stage shows one screen at a time and crossfades to the next. */
function show(stage: HTMLElement, img: HTMLImageElement | undefined) {
  if (!img || img.classList.contains('on')) return;
  const go = () => { for (const i of $$<HTMLImageElement>('img', stage)) i.classList.toggle('on', i === img); };
  if (img.complete) go();
  else { img.loading = 'eager'; img.addEventListener('load', go, { once: true }); }
}

function heroStage() {
  const stage = $('[data-stage="hero"]');
  if (!stage) return;
  const imgs = $$<HTMLImageElement>('img', stage);
  if (imgs.length < 2) return;
  let i = 0;
  let timer = 0;
  const tick = () => {
    if (document.hidden || reduce.matches) return;
    i = (i + 1) % imgs.length;
    show(stage, imgs[i]);
  };
  const start = () => { window.clearInterval(timer); if (!reduce.matches) timer = window.setInterval(tick, 5600); };
  // Fetch the other screens once the first one is on screen.
  window.setTimeout(() => imgs.forEach((im) => { im.loading = 'eager'; }), 1200);
  document.addEventListener('visibilitychange', start);
  reduce.addEventListener?.('change', start);
  start();
}

function tourStage() {
  const stage = $('[data-stage="tour"]');
  if (!stage || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const id = (e.target as HTMLElement).dataset.shot;
      show(stage, $<HTMLImageElement>(`img[data-for="${id}"]`, stage) || undefined);
    }
  }, { rootMargin: '-45% 0px -45% 0px' });
  for (const el of $$('[data-shot]')) io.observe(el);
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

/* The closing section holds the real game; it loads only on wide screens, when it is about to be seen. */
function embeddedGame() {
  const frame = $<HTMLIFrameElement>('.app-frame iframe');
  if (!frame || !('IntersectionObserver' in window)) return;
  const wide = window.matchMedia('(min-width: 960px)');
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  if (saveData) return;
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting) || !wide.matches || frame.src) return;
    frame.addEventListener('load', () => { frame.classList.add('loaded'); frame.tabIndex = 0; }, { once: true });
    frame.src = frame.dataset.src || '';
    io.disconnect();
  }, { rootMargin: '600px 0px' });
  io.observe(frame);
}

/* Remember an explicit language choice so the English home page stops suggesting Arabic. */
function languageChoice() {
  for (const a of $$<HTMLAnchorElement>('[data-lang-switch]')) {
    a.addEventListener('click', () => { try { localStorage.setItem('site.lang', a.dataset.langSwitch || ''); } catch { /* private mode */ } });
  }
}

stampToday();
heroStage();
tourStage();
reveals();
checker();
embeddedGame();
languageChoice();
