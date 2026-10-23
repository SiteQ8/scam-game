import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { bidi } from '../cards/marker';
import type { LangBlock } from '../../content/types';
import { CARDS } from '../../content/cards';
import { settings, updateProgress, progress } from '../../state/store';
import { back, reset, replace, setBackInterceptor } from '../../state/nav';
import { lang, t } from '../../i18n/i18n';
import { byRegion, huntPool, randomDeck } from '../../engine/deck';
import { newlyUnlocked } from '../../engine/achievements';
import { CardView } from '../cards/CardView';
import { SignalList } from '../components/Debrief';
import { Icon } from '../components/Icon';
import { Confirm, Strand, toast } from '../components/common';
import { sfx } from '../../platform/audio';
import { impact, notify } from '../../platform/haptics';

const ROUND = 5;
const SECONDS = 25;

export function Hunt() {
  const L = lang.value;
  const deck = useMemo(() => randomDeck(huntPool(byRegion(CARDS, settings.value.region)), ROUND), []);
  const [i, setI] = useState(0);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [misses, setMisses] = useState(0);
  const [time, setTime] = useState(SECONDS);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [totals, setTotals] = useState({ found: 0, all: 0 });
  const [done, setDone] = useState(false);
  const [quit, setQuit] = useState(false);
  const missRef = useRef<HTMLDivElement>(null);
  const card = deck[i];
  const block = card ? (card[L] as LangBlock) : null;
  const reds = block ? block.signals.map((s, k) => (s.kind === 'red' ? k : -1)).filter((k) => k >= 0) : [];

  useEffect(() => {
    setBackInterceptor(() => { if (done) return false; setQuit(true); return true; });
    return () => setBackInterceptor(null);
  }, [done]);

  useEffect(() => {
    if (revealed || done || !card) return;
    const tm = setInterval(() => setTime((s) => s - 1), 1000);
    return () => clearInterval(tm);
  }, [i, revealed, done]);
  useEffect(() => { if (time <= 0 && !revealed) finishCard(found); }, [time]);

  function finishCard(f: Set<number>) {
    const got = reds.filter((k) => f.has(k)).length;
    setRevealed(true);
    setResults((r) => [...r, got === reds.length]);
    setTotals((tt) => ({ found: tt.found + got, all: tt.all + reds.length }));
    if (got === reds.length) { void sfx('correct'); notify('success'); } else { void sfx('reveal'); }
  }

  function onTap(index: number | null, e: MouseEvent) {
    if (revealed || !block) return;
    if (index === null) {
      setMisses((m) => m + 1);
      impact('light');
      void sfx('wrong');
      const el = missRef.current;
      if (el) { el.style.left = `${e.clientX}px`; el.style.top = `${e.clientY}px`; el.classList.remove('miss-x'); void el.offsetWidth; el.classList.add('miss-x'); }
      return;
    }
    const s = block.signals[index];
    if (s.kind === 'trap') { toast(t('trapFound'), 'eye'); impact('light'); return; }
    if (found.has(index)) return;
    const next = new Set(found);
    next.add(index);
    setFound(next);
    impact('medium');
    void sfx('reveal');
    if (reds.every((k) => next.has(k))) setTimeout(() => finishCard(next), 450);
  }

  function nextCard() {
    if (i + 1 >= deck.length) {
      const perfect = results.length === deck.length && results.every(Boolean);
      updateProgress((p) => { p.huntsPlayed += 1; if (perfect) p.huntPerfect += 1; });
      const fresh = newlyUnlocked(progress.value, CARDS);
      if (fresh.length) { updateProgress((p) => { fresh.forEach((a) => { p.achievements[a.id] = Date.now(); }); }); toast(`${t('achievementUnlocked')}: ${fresh[0][L].title}`, 'award'); }
      setDone(true);
      return;
    }
    setI(i + 1);
    setFound(new Set());
    setTime(SECONDS);
    setRevealed(false);
  }

  if (!card || !block) return <div class="screen"><div class="topbar"><button class="icon-btn" onClick={back}><Icon name="x" /></button></div></div>;

  if (done) {
    return (
      <div class="screen">
        <div class="topbar"><span class="spacer" /><h1>{t('hunt')}</h1><button class="icon-btn" onClick={() => reset()} aria-label={t('home')}><Icon name="house" /></button></div>
        <div class="scroll"><div class="wrap">
          <div class="results-hero"><span class="lbl">{t('found', { x: totals.found, y: totals.all })}</span><div class="big num">{totals.found}/{totals.all}</div></div>
          <div class="results-hero" style={{ paddingTop: 0 }}><Strand total={results.length} results={results} size="lg" /></div>
          <div style={{ display: 'grid', gap: '10px', marginTop: '18px' }}>
            <button class="btn btn-primary" onClick={() => replace({ name: 'hunt' })}>{t('playAgain')}</button>
            <button class="btn btn-secondary" onClick={() => reset()}>{t('home')}</button>
          </div>
        </div></div>
      </div>
    );
  }

  return (
    <div class="screen">
      <div class="play-top">
        <button class="icon-btn" onClick={() => setQuit(true)} aria-label={t('close')}><Icon name="x" /></button>
        <div class={`timer ${time <= 8 ? 'low' : ''}`} role="timer"><div class="bar"><i style={{ transform: `scaleX(${Math.max(0, time) / SECONDS})` }} /></div><span class="t num">{Math.max(0, time)}</span></div>
        <div class="score num">{found.size}/{reds.length}<small>{t('huntGoal')}</small></div>
      </div>
      <div class="hunt-strand"><Strand total={deck.length} results={results} current={i} /></div>
      <div class="scroll" style={{ paddingTop: '6px' }}><div class="wrap">
        <div class="context" style={{ margin: '0 0 10px' }}><Icon name="crosshair" /><span>{i === 0 && !revealed ? t('huntRule') : block.context ? bidi(block.context) : t('huntGoal')}</span></div>
        <CardView card={card} lang={L} mode={revealed ? 'debrief' : 'hunt'} huntFound={found} marksOn={revealed} onHuntTap={onTap} />
        {revealed && <div style={{ marginTop: '16px' }}><SignalList card={card} lang={L} active={null} onSignal={() => {}} /></div>}
      </div></div>
      <div class="bottom-bar">
        {revealed
          ? <button class="btn btn-primary" onClick={nextCard}>{i + 1 >= deck.length ? t('seeResults') : t('next')}<Icon name="arrow-right" class="flip-rtl" /></button>
          : <button class="btn btn-secondary" onClick={() => finishCard(found)}><Icon name="eye" />{t('reveal')}</button>}
      </div>
      <div ref={missRef} class="miss-host" style={{ position: 'fixed', pointerEvents: 'none' }}><Icon name="x" /></div>
      {quit && <Confirm title={t('quitTitle')} body={t('quitBody')} confirm={t('leave')} cancel={t('keepPlaying')} danger onConfirm={() => { setQuit(false); back(); }} onCancel={() => setQuit(false)} />}
      <span class="sr-only">{misses}</span>
    </div>
  );
}
