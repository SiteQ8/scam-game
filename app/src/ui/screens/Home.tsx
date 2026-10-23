import { useEffect, useState } from 'preact/hooks';
import { progress, settings } from '../../state/store';
import { push } from '../../state/nav';
import { lang, t, fmtNum, rankFor, duration, count, strandTally } from '../../i18n/i18n';
import { dayIndex, caseNumber, msToNextDay, shareGrid, dateOfDay, DAILY_SIZE } from '../../engine/daily';
import { levelFor, lastWeek } from '../../engine/levels';
import { LevelPearl } from '../components/Medal';
import { tipFor } from '../../content/tips';
import { TIP_TOPICS } from '../../i18n/strings';
import { CHAPTERS } from '../../engine/deck';
import { PACKS, packDeck } from '../../engine/packs';
import { CARDS } from '../../content/cards';
import { S } from '../../i18n/strings';
import type { PackId } from '../../content/types';
import { Icon } from '../components/Icon';
import { Mark, Pearls, Strand, toast } from '../components/common';
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
  const [openPack, setOpenPack] = useState<PackId | null>(null);
  const packs = PACKS.map((pk) => ({ ...pk, size: packDeck(pk.id, CARDS).length })).filter((pk) => pk.size > 0);
  const sel = packs.find((pk) => pk.id === openPack);
  const packText = (id: PackId, sub = false) => S[`pack_${id}${sub ? '_sub' : ''}` as keyof typeof S][L];
  useEffect(() => { const tm = setInterval(() => setNow(Date.now()), 30000); setMusic(true); return () => clearInterval(tm); }, []);
  const rank = rankFor(p.xp);
  const lv = levelFor(p.xp);
  const week = lastWeek(day, (d) => Boolean(p.daily[String(d)]?.done));
  const weekday = new Intl.DateTimeFormat(L === 'ar' ? 'ar' : 'en-GB', { weekday: 'narrow' });
  const tip = tipFor(day);
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
        {streak > 0 && <span class="chip streak" aria-label={`${t('dailyStreak')}: ${count(streak, 'day')}`}><i class="bead ok" /><span class="num">{streak}</span></span>}
        <button class="icon-btn" onClick={() => go({ name: 'settings' })} aria-label={t('settings')}><Icon name="settings" /></button>
      </div>
      <div class="scroll"><div class="home-wrap">
        <section class="cloth case" aria-labelledby="case-h">
          {rec?.done && <span class="seal">{t('closedStamp')}</span>}
          <h2 id="case-h" class="num">{t('dailyNumber', { n: caseNumber(day) })}</h2>
          <p class="sub num">
            {rec?.done ? strandTally(right, rec.results.length) : rec && rec.results.length ? t('dailyProgress', { x: rec.results.length, n: DAILY_SIZE }) : t('dailyBlurb')}
          </p>
          <Strand total={DAILY_SIZE} results={rec ? rec.results : []} current={rec?.done ? -1 : rec ? rec.results.length : 0} graduated draped />
          {rec?.done ? (
            <button class="btn btn-primary" onClick={shareDaily}><Icon name="share-2" />{t('shareResult')}</button>
          ) : (
            <button class="btn btn-primary" onClick={() => go({ name: 'play', mode: 'daily' })}>
              {rec && rec.results.length ? t('dailyResume') : t('dailyCta')}
              <Icon name="arrow-right" class="flip-rtl" />
            </button>
          )}
          <div class="case-meta">
            <span>{rec?.done ? t('dailyDone') : edition === 'gcc' ? t('dailyEditionGcc') : t('dailyEditionGlobal')}</span>
            <span class="num">{t('nextIn', { t: duration(msToNextDay(new Date(now))) })}</span>
          </div>
        </section>

        <div class="home-tiles">
          <button class="tile" onClick={() => go({ name: 'badges' })} aria-label={`${t('levelN', { n: lv.n })}, ${rank.name}. ${t('badges')}`}>
            <span class="lv">
              <LevelPearl n={lv.n} />
              <span><b>{rank.name}</b><span class="s">{t('levelN', { n: lv.n })}</span></span>
            </span>
            <span class="s num">{lv.next ? t('xpToLevel', { n: lv.next - p.xp, level: lv.n + 1 }) : `${fmtNum(p.xp)} ${t('xp')}`}</span>
          </button>
          <section class="tile" aria-label={t('dailyStreak')}>
            <span>
              <b>{streak > 0 ? t('streakDays', { days: count(streak, 'day') }) : t('dailyStreak')}</b>
              <span class="s">{streak > 0 ? (rec?.done ? t('streakDone') : t('streakKeep')) : t('streakStart')}</span>
            </span>
            <span class="week" aria-hidden="true">
              {week.map((w) => <span class={`d ${w.day === day ? 'today' : ''}`}><i class={`bead ${w.done ? 'ok' : 'seat'}`} />{weekday.format(dateOfDay(w.day))}</span>)}
            </span>
          </section>
        </div>

        {packs.length > 0 && (
          <>
            <h2 class="section-title">{t('packs')}</h2>
            <div class="pack-grid">
              {packs.map((pk) => {
                const st = p.packs[pk.id]?.stars || 0;
                return (
                  <button class="pack-tile" onClick={() => { void sfx('tap'); setOpenPack(pk.id); }}>
                    <span class="glyph"><Icon name={pk.icon} /></span>
                    <b>{packText(pk.id)}</b>
                    {st ? <Pearls n={st} /> : <span class="meta">{count(pk.size, 'card')}</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <section class="tip-card" aria-labelledby="tip-h">
          <div class="tip-head">
            <span class="bulb"><Icon name="lightbulb" /></span>
            <h2 id="tip-h">{t('tipOfDay')}</h2>
            <span class="topic">{TIP_TOPICS[tip.topic]?.[L]}</span>
          </div>
          <p>{tip[L]}</p>
          <div class="tip-actions">
            <button class="btn btn-ghost" style={{ width: 'auto' }} onClick={async () => { const r = await shareText(tip[L], siteUrl() || undefined); if (r === 'copied') toast(t('copied'), 'copy'); }}><Icon name="share-2" />{t('share')}</button>
            <button class="btn btn-ghost" style={{ width: 'auto' }} onClick={() => go({ name: 'tips' })}>{t('allTips')}<Icon name="chevron-right" class="flip-rtl" /></button>
          </div>
        </section>

        <h2 class="section-title">{t('modes')}</h2>
        <div class="mode-list">
          <button class="mode" onClick={() => go({ name: 'journey' })}>
            <span class="glyph g-journey"><Icon name="route" /></span>
            <span class="txt"><b>{t('journey')}</b><span>{t('journeySub')}</span>
              <span class="journey-dots" aria-hidden="true">{CHAPTERS.map((c) => <i class={`bead ${(p.journey[c.id]?.stars || 0) > 0 ? 'ok' : 'seat'}`} />)}</span>
            </span>
            <span class="meta"><b class="num">{passed}/{CHAPTERS.length}</b></span>
          </button>
          {!settings.value.family && <button class="mode" onClick={() => go({ name: 'play', mode: 'rush' })}>
            <span class="glyph g-rush"><Icon name="timer" /></span>
            <span class="txt"><b>{t('rush')}</b><span>{t('rushSub')}</span></span>
            {p.rushBest > 0 && <span class="meta">{t('best')}<b class="num">{p.rushBest}</b></span>}
          </button>}
          <button class="mode" onClick={() => go({ name: 'partySetup' })}>
            <span class="glyph g-party"><Icon name="users" /></span>
            <span class="txt"><b>{t('party')}</b><span>{t('partySub')}</span></span>
          </button>
          {!settings.value.family && <button class="mode" onClick={() => go({ name: 'hunt' })}>
            <span class="glyph g-hunt"><Icon name="crosshair" /></span>
            <span class="txt"><b>{t('hunt')}</b><span>{t('huntSub')}</span></span>
          </button>}
          <button class="mode tool" onClick={() => go({ name: 'checker' })}>
            <span class="glyph g-check"><Icon name="scan-search" /></span>
            <span class="txt"><b>{t('checker')}</b><span>{t('checkerSub')}</span></span>
          </button>
        </div>
        <div class="home-foot">
          <button class="btn btn-ghost" style={{ width: 'auto' }} onClick={() => go({ name: 'stats' })}><Icon name="chart-column" />{t('stats')}</button>
          <button class="btn btn-ghost" style={{ width: 'auto' }} onClick={() => go({ name: 'badges' })}><Icon name="medal" />{t('badges')}</button>
          <button class="btn btn-ghost" style={{ width: 'auto' }} onClick={() => go({ name: 'about' })}><Icon name="info" />{t('about')}</button>
        </div>
      </div></div>
      {sel && (
        <div class="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setOpenPack(null); }}>
          <div class="modal chapter-sheet pack-sheet" role="dialog" aria-modal="true" aria-labelledby="pack-h">
            <span class="glyph"><Icon name={sel.icon} /></span>
            <h3 id="pack-h">{packText(sel.id)}</h3>
            <span class="sheet-meta">{count(sel.size, 'card')}</span>
            <p class="lead">{packText(sel.id, true)}</p>
            <p class="rule">{t('packRule')}</p>
            {(p.packs[sel.id]?.stars || 0) > 0 && <div class="sheet-pearls"><Pearls n={p.packs[sel.id].stars} /></div>}
            <div class="btn-row">
              <button class="btn btn-secondary" onClick={() => setOpenPack(null)}>{t('cancel')}</button>
              <button class="btn btn-primary" onClick={() => { setOpenPack(null); go({ name: 'play', mode: 'pack', pack: sel.id }); }}>{(p.packs[sel.id]?.stars || 0) > 0 ? t('replayChapter') : t('start')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
