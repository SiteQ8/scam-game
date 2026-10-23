import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { bidi } from '../cards/marker';
import type { Card, Verdict, LangBlock } from '../../content/types';
import { CARDS } from '../../content/cards';
import { settings, progress, updateProgress } from '../../state/store';
import { back, reset, replace, setBackInterceptor, type Route } from '../../state/nav';
import { lang, t, fmtNum, count, rankFor, duration } from '../../i18n/i18n';
import { CATEGORY_NAMES, CHANNEL_NAMES, S } from '../../i18n/strings';
import { byRegion, chapterDeck, randomDeck, starsFor, CHAPTERS } from '../../engine/deck';
import { dailyDeck, dayIndex, caseNumber, shareGrid, msToNextDay, type Edition } from '../../engine/daily';
import { pointsFor, recordJudgement, type Judgement } from '../../engine/scoring';
import { PACKS, packDeck, isCore } from '../../engine/packs';
import { newlyUnlocked, type Achievement } from '../../engine/achievements';
import { levelFor } from '../../engine/levels';
import { Medal, LevelPearl } from '../components/Medal';
import { CardView } from '../cards/CardView';
import { SwipeCard, type SwipeApi } from '../components/SwipeCard';
import { Debrief, SignalList } from '../components/Debrief';
import { Icon } from '../components/Icon';
import { Confirm, Pearls, Strand, announce, toast } from '../components/common';
import { sfx, stopVoice, setMusic } from '../../platform/audio';
import { impact, notify } from '../../platform/haptics';
import { shareText } from '../../platform/share';
import type { IconName } from '../icons.generated';

type PlayRoute = Extract<Route, { name: 'play' }>;
type Phase = 'pass' | 'judge' | 'decided' | 'debrief' | 'results';
const RUSH_SECONDS = 60;

export const CHANNEL_GLYPH: Record<string, IconName> = { sms: 'message-square', notification: 'bell', chat: 'message-circle', email: 'mail', call: 'phone', web: 'globe', qr: 'qr-code', social: 'users', market: 'shopping-bag' };

function stripKey(r: PlayRoute): PlayRoute { const { k: _k, ...rest } = r as PlayRoute & { k?: number }; return rest as PlayRoute; }

/** The game's web address: its own domain once chosen, the repository's GitHub Pages address until then. */
export function siteUrl() {
  if (__BRAND__.domain) return `https://${__BRAND__.domain}`;
  const [owner, repo] = (__BRAND__.repo || '').split('/');
  return owner && repo ? `https://${owner.toLowerCase()}.github.io/${repo}` : '';
}

export function Play({ route }: { route: PlayRoute }) {
  const L = lang.value;
  const mode = route.mode;
  const day = dayIndex();
  const edition: Edition = settings.value.region === 'global' ? 'global' : 'gcc';
  const players = route.party?.players || [];

  const deck = useMemo<Card[]>(() => {
    const pool = byRegion(CARDS, settings.value.region);
    if (mode === 'daily') return dailyDeck(day, edition, CARDS.filter(isCore));
    if (mode === 'chapter') return chapterDeck(route.chapter || 'basics', pool.filter(isCore));
    if (mode === 'pack') return route.pack ? packDeck(route.pack, CARDS) : [];
    if (mode === 'party') return randomDeck(pool, Math.max(1, players.length) * (route.party?.cardsEach || 5));
    if (mode === 'practice') return (route.ids || []).map((id) => CARDS.find((c) => c.id === id)).filter((c): c is Card => !!c);
    return randomDeck(pool, 400);
  }, []);

  const saved = mode === 'daily' ? progress.value.daily[String(day)] : undefined;
  const resumeAt = saved && !saved.done ? saved.results.length : 0;

  const [idx, setIdx] = useState(resumeAt);
  const [results, setResults] = useState<boolean[]>(saved && !saved.done ? saved.results : []);
  const [judged, setJudged] = useState<Judgement[]>([]);
  const [phase, setPhase] = useState<Phase>(mode === 'party' && players.length > 1 ? 'pass' : 'judge');
  const [said, setSaid] = useState<Verdict | null>(null);
  const [points, setPoints] = useState(0);
  const [score, setScore] = useState(saved && !saved.done ? saved.score : 0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [marksOn, setMarksOn] = useState(false);
  const [peek, setPeek] = useState(false);
  const [timeLeft, setTimeLeft] = useState(RUSH_SECONDS);
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null);
  const [partyScores, setPartyScores] = useState<number[]>(players.map(() => 0));
  const [quit, setQuit] = useState(false);
  const [unlocked, setUnlocked] = useState<Achievement[]>([]);
  const [rankUp, setRankUp] = useState<string | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [streakNow, setStreakNow] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const api = useRef<SwipeApi | null>(null);
  const cardScroll = useRef<HTMLDivElement | null>(null);
  const startXp = useRef(progress.value.xp);
  const stageRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const showHint = useRef(progress.value.judged < 4 && mode !== 'rush');

  const card = deck[Math.min(idx, deck.length - 1)];
  const block = card ? (card[L] as LangBlock) : null;
  const total = mode === 'rush' ? 0 : deck.length;
  const player = players.length ? idx % players.length : 0;

  useEffect(() => { setMusic(false); return () => stopVoice(); }, []);

  // Short cards sit in the middle of the stage; while the debrief is open the card moves to the top.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const el = stage.querySelector('.msg') as HTMLElement | null;
      if (!el) return;
      setOffset(phase === 'debrief' ? 0 : Math.max(0, (stage.clientHeight - el.offsetHeight) / 2 - 8));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    const el = stage.querySelector('.msg');
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, [idx, phase]);

  // Hardware back and Escape ask before leaving a round in progress.
  useEffect(() => {
    setBackInterceptor(() => { if (phase === 'results') return false; setQuit(true); return true; });
    return () => setBackInterceptor(null);
  }, [phase]);

  // Rush clock
  useEffect(() => {
    if (mode !== 'rush' || phase === 'results') return;
    const tm = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(tm);
  }, [phase === 'results']);
  useEffect(() => {
    if (mode !== 'rush' || phase === 'results') return;
    if (timeLeft <= 5 && timeLeft > 0) void sfx('tick');
    if (timeLeft <= 0) { void sfx('timeup'); notify('warning'); finish(); }
  }, [timeLeft]);

  // Keyboard
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (quit) return;
      if (phase === 'judge' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); api.current?.decide(e.key === 'ArrowLeft' ? 'scam' : 'legit'); }
      else if (phase === 'debrief' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); void next(); }
      else if (phase === 'pass' && e.key === 'Enter') setPhase('judge');
      else if (e.key === 'Escape' && phase !== 'results') setQuit(true);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  function onDecide(v: Verdict) {
    if (!card) return;
    const correct = v === card.verdict;
    const run = correct ? streak + 1 : 0;
    const pts = pointsFor(card, correct, streak);
    setSaid(v);
    setPhase('decided');
    impact('heavy');
    void sfx('stamp');
    setPoints(pts);
    setScore((s) => s + (mode === 'rush' ? (correct ? 1 : 0) : pts));
    setStreak(run);
    setBestStreak((b) => Math.max(b, run));
    const nextResults = [...results, correct];
    setResults(nextResults);
    const j: Judgement = { card, said: v, correct, points: pts };
    setJudged((list) => [...list, j]);
    recordJudgement(j, run);
    if (mode === 'party') setPartyScores((ps) => ps.map((p, i) => (i === player ? p + (correct ? 1 : 0) : p)));
    if (mode === 'daily') {
      updateProgress((p) => { p.daily[String(day)] = { results: nextResults, score: score + pts, done: false, edition }; });
    }
    if (mode === 'rush' && !correct) setTimeLeft((s) => Math.max(0, s - 3));
    setTimeout(() => {
      if (correct) { void sfx('correct'); notify('success'); } else { void sfx('wrong'); notify('error'); }
      announce(`${correct ? t('correct') : t('wrong')}. ${card.verdict === 'scam' ? t('itWasScam') : t('itWasLegit')}`);
      if (mode === 'rush') {
        setFlash(correct ? 'ok' : 'no');
        setTimeout(() => { setFlash(null); void next(); }, 360);
      } else {
        setPeek(false);
        setPhase('debrief');
        setTimeout(() => setMarksOn(true), 160);
      }
    }, 380);
  }

  async function next() {
    if (!card) return;
    stopVoice();
    void sfx('whoosh');
    await api.current?.exit(card.verdict === 'scam' ? 'left' : 'right');
    if (mode !== 'rush' && idx + 1 >= deck.length) { finish(); return; }
    setIdx((i) => i + 1);
    setSaid(null);
    setMarksOn(false);
    setActive(null);
    setPoints(0);
    setPhase(mode === 'party' && players.length > 1 ? 'pass' : 'judge');
  }

  function finish() {
    stopVoice();
    const right = results.filter(Boolean).length;
    const before = progress.value;
    let best = false;
    updateProgress((p) => {
      if (mode === 'daily') {
        p.daily[String(day)] = { results, score, done: true, edition };
        const st = p.dailyStreak;
        if (st.lastDay !== day) {
          st.current = st.lastDay === day - 1 ? st.current + 1 : 1;
          st.lastDay = day;
          st.best = Math.max(st.best, st.current);
        }
      }
      if (mode === 'chapter' && route.chapter) {
        const stars = starsFor(right, deck.length);
        const prev = p.journey[route.chapter] || { stars: 0, best: 0 };
        p.journey[route.chapter] = { stars: Math.max(prev.stars, stars), best: Math.max(prev.best, right) };
      }
      if (mode === 'pack' && route.pack) {
        const stars = starsFor(right, deck.length);
        const prev = p.packs[route.pack] || { stars: 0, best: 0 };
        p.packs[route.pack] = { stars: Math.max(prev.stars, stars), best: Math.max(prev.best, right) };
      }
      if (mode === 'rush') { best = right > p.rushBest; p.rushBest = Math.max(p.rushBest, right); }
      if (mode === 'party') p.partyGames += 1;
      if (settings.value.family && mode !== 'tutorial') p.familyRounds = (p.familyRounds || 0) + 1;
    });
    const fresh = newlyUnlocked(progress.value, CARDS);
    if (fresh.length) updateProgress((p) => { fresh.forEach((a) => { p.achievements[a.id] = Date.now(); }); });
    setUnlocked(fresh);
    const r0 = rankFor(startXp.current).idx;
    const r1 = rankFor(progress.value.xp);
    if (r1.idx > r0) setRankUp(r1.name);
    const l0 = levelFor(startXp.current).n;
    const l1 = levelFor(progress.value.xp).n;
    if (l1 > l0) setLevelUp(l1);
    if (mode === 'daily') setStreakNow(progress.value.dailyStreak.current);
    setNewBest(best && before.rushBest > 0);
    if (fresh.length || r1.idx > r0 || l1 > l0) { void sfx('levelup'); notify('success'); }
    setPhase('results');
  }

  function onSignal(i: number) {
    setActive(null);
    requestAnimationFrame(() => setActive(i));
    setPeek(true);
    const el = cardScroll.current?.querySelector(`[data-i="${i}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'center', behavior: settings.value.reduceMotion ? 'auto' : 'smooth' });
  }

  if (phase === 'results') {
    return (
      <Results
        mode={mode} deck={deck} results={results} judged={judged} score={score} bestStreak={bestStreak}
        day={day} edition={edition} chapter={route.chapter} players={players} partyScores={partyScores}
        unlocked={unlocked} rankUp={rankUp} levelUp={levelUp} streak={streakNow} newBest={newBest} route={route}
      />
    );
  }

  if (phase === 'pass') {
    return (
      <div class="screen">
        <div class="topbar"><button class="icon-btn" onClick={() => setQuit(true)} aria-label={t('close')}><Icon name="x" /></button><h1>{t('party')}</h1><span class="spacer" /></div>
        <Scoreline players={players} scores={partyScores} current={player} />
        <div class="pass">
          <span class="lbl">{t('passTo')}</span>
          <h2>{players[player]}</h2>
          <button class="btn btn-primary" style={{ maxWidth: '320px' }} onClick={() => { void sfx('tap'); setPhase('judge'); }}>{t('ready')}</button>
        </div>
        {quit && <Confirm title={t('quitTitle')} body={t('quitBody')} confirm={t('leave')} cancel={t('keepPlaying')} danger onConfirm={() => { setQuit(false); back(); }} onCancel={() => setQuit(false)} />}
      </div>
    );
  }

  if (!card || !block) return null;
  const debriefing = phase === 'debrief';
  const lowTime = timeLeft <= 10;
  return (
    <div class="screen">
      <div class="play-top">
        <button class="icon-btn" onClick={() => setQuit(true)} aria-label={t('close')}><Icon name="x" /></button>
        {mode === 'rush' ? (
          <div class={`timer ${lowTime ? 'low' : ''}`} role="timer" aria-label={`${t('timeLeft')} ${count(Math.max(0, timeLeft), 'second')}`}>
            <div class="bar"><i style={{ transform: `scaleX(${Math.max(0, timeLeft) / RUSH_SECONDS})` }} /></div>
            <span class="t num">{Math.max(0, timeLeft)}</span>
          </div>
        ) : (
          <>
            <Strand total={total} results={results} current={idx} />
            <span class="sr-only">{t('progress', { i: idx + 1, n: total })}</span>
          </>
        )}
        {mode === 'rush'
          ? <div class="score num" aria-live="off">{fmtNum(score)}<small>{t('rightCalls')}</small></div>
          : <span class="balance" aria-hidden="true" />}
      </div>
      {mode === 'party' && <Scoreline players={players} scores={partyScores} current={player} />}
      <div class="play-body">
        <div class="context">{block.context ? <><Icon name="info" /><span>{bidi(block.context)}</span></> : null}</div>
        <div class="stage" ref={stageRef}>
          <SwipeCard key={card.id + idx} locked={phase !== 'judge'} said={said} truth={phase === 'debrief' ? card.verdict : null} lang={L} reduceMotion={settings.value.reduceMotion} parked={phase === 'debrief'} offset={offset} onDecide={onDecide} apiRef={api}>
            <CardView card={card} lang={L} mode={debriefing ? 'debrief' : 'play'} active={active} marksOn={marksOn} scrollRef={cardScroll} />
            {flash && <div class={`flash ${flash}`} />}
          </SwipeCard>
          {showHint.current && phase === 'judge' && (
            <div class="swipe-hint" aria-hidden="true"><span class="l"><Icon name="arrow-left" /></span><span>{t('swipeHint')}</span><span class="r"><Icon name="arrow-right" /></span></div>
          )}
        </div>
        {mode !== 'rush' && said && (
          <Debrief card={card} lang={L} said={said} points={points} open={debriefing} active={active} onSignal={onSignal} peek={peek} setPeek={setPeek} />
        )}
      </div>
      {debriefing ? (
        <div class="bottom-bar">
          <button class="btn btn-primary" onClick={() => void next()} autoFocus>
            {idx + 1 >= deck.length && mode !== 'rush' ? t('seeResults') : t('next')}
            <Icon name="arrow-right" class="flip-rtl" />
          </button>
        </div>
      ) : (
        <div class="verdicts">
          <button class="verdict-btn scam" disabled={phase !== 'judge'} onClick={() => api.current?.decide('scam')}><span class="vd"><Icon name="x" /></span>{t('scam')}</button>
          <button class="verdict-btn legit" disabled={phase !== 'judge'} onClick={() => api.current?.decide('legit')}><span class="vd"><Icon name="check" /></span>{t('legit')}</button>
        </div>
      )}
      {quit && <Confirm title={t('quitTitle')} body={t('quitBody')} confirm={t('leave')} cancel={t('keepPlaying')} danger onConfirm={() => { setQuit(false); stopVoice(); back(); }} onCancel={() => setQuit(false)} />}
    </div>
  );
}

function Scoreline({ players, scores, current }: { players: string[]; scores: number[]; current: number }) {
  return (
    <div class="scoreline" aria-label={t('players')}>
      {players.map((p, i) => <span class={`chip ${i === current ? 'me' : ''}`}><Icon name="user" />{p} <b class="num">{scores[i]}</b></span>)}
    </div>
  );
}

// ---------- Results ----------
interface ResultsProps {
  mode: PlayRoute['mode']; deck: Card[]; results: boolean[]; judged: Judgement[]; score: number; bestStreak: number;
  day: number; edition: Edition; chapter?: string; players: string[]; partyScores: number[];
  unlocked: Achievement[]; rankUp: string | null; levelUp: number | null; streak: number; newBest: boolean; route: PlayRoute;
}

function Results(p: ResultsProps) {
  const L = lang.value;
  const right = p.results.filter(Boolean).length;
  const n = p.results.length;
  const [review, setReview] = useState<Card | null>(null);
  const [copied, setCopied] = useState(false);
  const missed = p.judged.filter((j) => !j.correct);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const tm = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(tm); }, []);

  async function share() {
    const name = L === 'ar' ? (__BRAND__.nameAr || __BRAND__.nameEn) : __BRAND__.nameEn;
    const head = `${name} ${t('dailyNumber', { n: caseNumber(p.day) })} ${right}/${n}`;
    const res = await shareText(`${head}\n${shareGrid(p.results)}`, siteUrl() || undefined);
    if (res === 'copied') { setCopied(true); toast(t('copied'), 'copy'); }
  }

  // The top bar says what happened; the cloth names the case and lays out its finished strand.
  let title = t('roundDone');
  let head = p.mode === 'practice' ? t('practice') : t('roundDone');
  let sub = '';
  const chapterIdx = p.chapter ? CHAPTERS.findIndex((c) => c.id === p.chapter) : -1;
  const stars = p.mode === 'chapter' || p.mode === 'pack' ? starsFor(right, n) : 0;
  const packIdx = p.route.pack ? PACKS.findIndex((x) => x.id === p.route.pack) : -1;
  if (p.mode === 'daily') { title = t('caseClosed'); head = t('dailyNumber', { n: caseNumber(p.day) }); sub = p.edition === 'gcc' ? t('dailyEditionGcc') : t('dailyEditionGlobal'); }
  if (p.mode === 'rush') { title = t('timeUp'); head = t('rush'); }
  if (p.mode === 'chapter' && p.chapter) { title = stars ? t('chapterPassed') : t('chapter', { n: chapterIdx + 1 }); head = S[`ch_${p.chapter}` as keyof typeof S][L]; sub = stars ? '' : t('chapterFailed'); }
  if (p.mode === 'pack' && p.route.pack) { title = stars ? t('packPassed') : t('roundDone'); head = S[`pack_${p.route.pack}` as keyof typeof S][L]; sub = stars ? '' : t('packFailed'); }
  const tally = p.mode === 'rush' ? t('rightOf', { x: right, y: n }) : `${t('rightOf', { x: right, y: n })} · ${count(p.score, 'point')}`;

  const ranking = p.players.map((name, i) => ({ name, score: p.partyScores[i] })).sort((a, b) => b.score - a.score);
  const tie = ranking.length > 1 && ranking[0].score === ranking[1].score;

  return (
    <div class="screen results">
      <div class="topbar"><span class="spacer" /><h1>{title}</h1><button class="icon-btn" onClick={() => reset()} aria-label={t('home')}><Icon name="house" /></button></div>
      <div class="scroll"><div class="wrap">
        {p.mode === 'party' ? (
          <>
            <div class="results-hero"><span class="lbl">{tie ? t('tie') : t('winner')}</span><div class="big" style={{ fontSize: 'clamp(2.4rem, 12vw, 3.4rem)' }}>{tie ? ranking.filter((r) => r.score === ranking[0].score).map((r) => r.name).join(L === 'ar' ? ' و ' : ' & ') : ranking[0]?.name}</div></div>
            <div class="podium">
              {ranking.map((r, i) => <div class={`row-p ${i === 0 ? 'first' : ''}`}><span class="pos num">{i + 1}</span><span class="nm">{r.name}</span><span class="pt num">{r.score}</span></div>)}
            </div>
          </>
        ) : (
          <section class="cloth result-cloth" aria-labelledby="res-h">
            <h2 id="res-h" class="num">{head}</h2>
            {sub && <p class="sub">{sub}</p>}
            {p.mode === 'rush'
              ? <p class="haul"><b class="num">{fmtNum(right)}</b><span>{t('rightCalls')}</span></p>
              : n > 0 && n <= 16 && <Strand total={n} results={p.results} size="lg" graduated label={t('rightOf', { x: right, y: n })} />}
            {(p.mode === 'chapter' || p.mode === 'pack') && <Pearls n={stars} />}
            <p class="tally num">{tally}</p>
            {p.mode === 'daily' && (
              <>
                <button class="btn btn-primary" onClick={share}><Icon name="share-2" />{t('shareResult')}</button>
                <div class="case-meta"><span class="num">{copied ? t('copied') : t('nextIn', { t: duration(msToNextDay(new Date(now))) })}</span></div>
              </>
            )}
          </section>
        )}
        {p.newBest && <div class="celebrate"><Icon name="trophy" /><div><b>{t('newBest')}</b><span class="num">{right}</span></div></div>}
        {p.streak >= 2 && <div class="celebrate streak"><i class="bead ok" /><div><b>{t('streakDays', { days: count(p.streak, 'day') })}</b><span>{t('streakDone')}</span></div></div>}
        {p.levelUp && <div class="celebrate"><LevelPearl n={p.levelUp} size="sm" animate /><div><b>{t('levelUp')}</b><span>{t('levelN', { n: p.levelUp })}</span></div></div>}
        {p.rankUp && <div class="celebrate"><Icon name="award" /><div><b>{t('newRank')}</b><span>{p.rankUp}</span></div></div>}
        {p.unlocked.map((a) => <div class="celebrate badge-won"><Medal a={a} on size="sm" /><div><b>{t('achievementUnlocked')}: {a[L].title}</b><span>{a[L].body}</span></div></div>)}

        {p.mode !== 'party' && p.judged.length > 0 && (
          <>
            <h2 class="section-title">{missed.length ? t('reviewMissed') : t('reviewAll')}</h2>
            {!missed.length && <p class="lead-text">{t('allRight')}</p>}
            <div class="review">
              {(missed.length ? missed : p.judged).slice(0, 30).map((j) => {
                const b = j.card[L] as LangBlock;
                return (
                  <button class="review-item" onClick={() => setReview(j.card)}>
                    <span class="glyph"><Icon name={CHANNEL_GLYPH[j.card.channel]} /></span>
                    <span class="txt"><b>{CATEGORY_NAMES[j.card.category][L]}</b><span>{CHANNEL_NAMES[j.card.channel][L]}{b.context ? ` · ${b.context}` : ''}</span></span>
                    <span class={`v ${j.card.verdict}`}>{t(j.card.verdict)}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div style={{ display: 'grid', gap: '10px', marginTop: '22px' }}>
          {p.mode === 'chapter' && stars > 0 && CHAPTERS.every((c) => (progress.value.journey[c.id]?.stars || 0) > 0) && !progress.value.certificate && (
            <button class="btn btn-primary" onClick={() => replace({ name: 'certificate' })}><Icon name="file-badge" />{t('certGet')}</button>
          )}
          {p.mode === 'chapter' && stars > 0 && chapterIdx >= 0 && chapterIdx < CHAPTERS.length - 1 && (
            <button class="btn btn-primary" onClick={() => replace({ name: 'play', mode: 'chapter', chapter: CHAPTERS[chapterIdx + 1].id })}>{t('nextChapter')}</button>
          )}
          {p.mode === 'chapter' && <button class={`btn ${stars ? 'btn-secondary' : 'btn-primary'}`} onClick={() => replace(stripKey(p.route))}>{stars ? t('replayChapter') : t('tryAgain')}</button>}
          {p.mode === 'pack' && stars > 0 && packIdx >= 0 && packIdx < PACKS.length - 1 && (
            <button class="btn btn-primary" onClick={() => replace({ name: 'play', mode: 'pack', pack: PACKS[packIdx + 1].id })}>{t('nextPack')}</button>
          )}
          {p.mode === 'pack' && <button class={`btn ${stars ? 'btn-secondary' : 'btn-primary'}`} onClick={() => replace(stripKey(p.route))}>{stars ? t('replayChapter') : t('tryAgain')}</button>}
          {(p.mode === 'rush' || p.mode === 'party') && <button class="btn btn-primary" onClick={() => replace(stripKey(p.route))}>{t('playAgain')}</button>}
          <button class="btn btn-secondary" onClick={() => reset()}>{t('home')}</button>
        </div>
      </div></div>
      {review && (
        <div class="review-overlay" role="dialog" aria-modal="true">
          <div class="topbar"><button class="icon-btn" onClick={() => setReview(null)} aria-label={t('close')}><Icon name="x" /></button><h1>{t(review.verdict === 'scam' ? 'itWasScam' : 'itWasLegit')}</h1><span class="spacer" /></div>
          <div class="scroll"><div class="wrap">
            {(review[L] as LangBlock).context && <div class="context" style={{ margin: '0 0 10px' }}><Icon name="info" /><span>{(review[L] as LangBlock).context}</span></div>}
            <CardView card={review} lang={L} mode="debrief" marksOn />
            <SignalList card={review} lang={L} active={null} onSignal={() => {}} />
          </div></div>
        </div>
      )}
    </div>
  );
}
