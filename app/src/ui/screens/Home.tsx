import { useEffect, useState } from 'preact/hooks';
import { progress, settings } from '../../state/store';
import { push } from '../../state/nav';
import { lang, t, fmtNum, rankFor, duration, count } from '../../i18n/i18n';
import { dayIndex, caseNumber, msToNextDay, shareGrid, DAILY_SIZE } from '../../engine/daily';
import { CHAPTERS } from '../../engine/deck';
import { Icon } from '../components/Icon';
import { Mark, Pips, toast } from '../components/common';
import { shareText } from '../../platform/share';
import { setMusic, sfx } from '../../platform/audio';
import { siteUrl } from './Play';

export function Home() {
  const L = lang.value;
  const p = progress.value;
  const day = dayIndex();
  const rec = p.daily[String(day)];
  const edition = settings.value.region === 'global' ? 'global' : 'gcc';
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const tm = setInterval(() => setNow(Date.now()), 30000); setMusic(true); return () => clearInterval(tm); }, []);
  const rank = rankFor(p.xp);
  const toNext = rank.next ? rank.next.xp - p.xp : 0;
  const pct = rank.next ? Math.min(1, (p.xp - rank.floor) / (rank.next.xp - rank.floor)) : 1;
  const passed = CHAPTERS.filter((c) => (p.journey[c.id]?.stars || 0) > 0).length;
  const name = L === 'ar' ? (__BRAND__.nameAr || __BRAND__.nameEn) : __BRAND__.nameEn;
  const right = rec ? rec.results.filter(Boolean).length : 0;
  const streak = p.dailyStreak.lastDay >= day - 1 ? p.dailyStreak.current : 0;

  async function shareDaily() {
    if (!rec) return;
    const head = `${name} ${t('dailyNumber', { n: caseNumber(day) })} ${right}/${rec.results.length}`;
    const r = await shareText(`${head}\n${shareGrid(rec.results)}`, siteUrl() || undefined);
    if (r === 'copied') toast(t('copied'), 'copy');
  }
  const go = (r: Parameters<typeof push>[0]) => { void sfx('tap'); push(r); };

  return (
    <div class="screen">
      <div class="home-head">
        <div class="wordmark"><Mark />{name && <b>{name}</b>}</div>
        {streak > 0 && <span class="chip flame" aria-label={`${t('dailyStreak')}: ${count(streak, 'day')}`}><Icon name="flame" /><span class="num">{streak}</span></span>}
        <button class="icon-btn" onClick={() => go({ name: 'settings' })} aria-label={t('settings')}><Icon name="settings" /></button>
      </div>
      <div class="scroll"><div class="home-wrap">
        <section class="case-file" aria-labelledby="case-h">
          <div class="case-top">
            <span class="label">{t('dailyTitle')} · {edition === 'gcc' ? t('dailyEditionGcc') : t('dailyEditionGlobal')}</span>
          </div>
          {rec?.done && <span class="stamp-mini">{t('closedStamp')}</span>}
          <h2 id="case-h" class="num">{t('dailyNumber', { n: caseNumber(day) })}</h2>
          <p>{rec?.done ? `${right}/${rec.results.length} · ${count(rec.score, 'point')}` : t('dailyBlurb')}</p>
          <Pips total={DAILY_SIZE} results={rec ? rec.results : []} current={rec && !rec.done ? rec.results.length : -1} />
          {rec?.done ? (
            <div class="btn-row">
              <button class="btn btn-primary" onClick={shareDaily}><Icon name="share-2" />{t('shareResult')}</button>
            </div>
          ) : (
            <button class="btn btn-primary" onClick={() => go({ name: 'play', mode: 'daily' })}>
              {rec && rec.results.length ? t('dailyResume') : t('dailyCta')}
              <Icon name="arrow-right" class="flip-rtl" />
            </button>
          )}
          <div class="case-meta">
            <span>{rec?.done ? t('dailyDone') : count(DAILY_SIZE, 'card')}</span>
            <span class="num">{t('nextIn', { t: duration(msToNextDay(new Date(now))) })}</span>
          </div>
        </section>

        <button class="rank-strip" style={{ width: '100%', textAlign: 'start' }} onClick={() => go({ name: 'stats' })} aria-label={t('stats')}>
          <span class="badge"><Icon name="award" /></span>
          <span class="rank-name"><b>{rank.name}</b><span class="num">{rank.next ? t('toNextRank', { n: toNext, rank: rank.next.name }) : `${fmtNum(p.xp)} ${t('xp')}`}</span></span>
          <span class="bar"><i style={{ transform: `scaleX(${pct})` }} /></span>
        </button>

        <h2 class="section-title">{t('modes')}</h2>
        <div class="mode-list">
          <button class="mode" onClick={() => go({ name: 'journey' })}>
            <span class="glyph g-journey"><Icon name="route" /></span>
            <span class="txt"><b>{t('journey')}</b><span>{t('journeySub')}</span>
              <span class="journey-dots" aria-hidden="true">{CHAPTERS.map((c) => <i class={(p.journey[c.id]?.stars || 0) > 0 ? 'on' : ''} />)}</span>
            </span>
            <span class="meta"><b class="num">{passed}/{CHAPTERS.length}</b></span>
          </button>
          <button class="mode" onClick={() => go({ name: 'play', mode: 'rush' })}>
            <span class="glyph g-rush"><Icon name="timer" /></span>
            <span class="txt"><b>{t('rush')}</b><span>{t('rushSub')}</span></span>
            {p.rushBest > 0 && <span class="meta">{t('best')}<b class="num">{p.rushBest}</b></span>}
          </button>
          <button class="mode" onClick={() => go({ name: 'partySetup' })}>
            <span class="glyph g-party"><Icon name="users" /></span>
            <span class="txt"><b>{t('party')}</b><span>{t('partySub')}</span></span>
          </button>
          <button class="mode" onClick={() => go({ name: 'hunt' })}>
            <span class="glyph g-hunt"><Icon name="crosshair" /></span>
            <span class="txt"><b>{t('hunt')}</b><span>{t('huntSub')}</span></span>
          </button>
          <button class="mode tool" onClick={() => go({ name: 'checker' })}>
            <span class="glyph g-check"><Icon name="scan-search" /></span>
            <span class="txt"><b>{t('checker')}</b><span>{t('checkerSub')}</span></span>
          </button>
        </div>
        <div class="home-foot">
          <button class="btn btn-ghost" style={{ width: 'auto' }} onClick={() => go({ name: 'stats' })}><Icon name="chart-column" />{t('stats')}</button>
          <button class="btn btn-ghost" style={{ width: 'auto' }} onClick={() => go({ name: 'about' })}><Icon name="info" />{t('about')}</button>
        </div>
      </div></div>
    </div>
  );
}
