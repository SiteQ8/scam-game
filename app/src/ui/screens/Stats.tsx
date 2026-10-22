import { progress, accuracy } from '../../state/store';
import { back, push } from '../../state/nav';
import { lang, t, fmtNum, rankFor } from '../../i18n/i18n';
import { CATEGORY_NAMES } from '../../i18n/strings';
import { ACHIEVEMENTS } from '../../engine/achievements';
import { Icon } from '../components/Icon';
import { TopBar } from '../components/common';

export function Stats() {
  const L = lang.value;
  const p = progress.value;
  const rank = rankFor(p.xp);
  const pct = rank.next ? Math.min(1, (p.xp - rank.floor) / (rank.next.xp - rank.floor)) : 1;
  const cats = Object.entries(p.categories)
    .map(([k, v]) => ({ k, n: v!.right + v!.wrong, acc: Math.round((v!.right / Math.max(1, v!.right + v!.wrong)) * 100) }))
    .filter((c) => c.n > 0)
    .sort((a, b) => a.acc - b.acc || b.n - a.n);
  const weakest = cats.find((c) => c.n >= 3 && c.acc < 100);
  const missed = Object.entries(p.cards).filter(([, r]) => r.wrong > r.right).sort((a, b) => b[1].wrong - a[1].wrong).slice(0, 10).map(([id]) => id);
  return (
    <div class="screen">
      <TopBar title={t('stats')} onBack={back} />
      <div class="scroll"><div class="wrap">
        <div class="rank-strip" style={{ marginTop: '6px' }}>
          <span class="badge"><Icon name="award" /></span>
          <span class="rank-name"><b>{rank.name}</b><span class="num">{fmtNum(p.xp)} {t('xp')}</span></span>
          <span class="bar"><i style={{ transform: `scaleX(${pct})` }} /></span>
        </div>
        {p.judged === 0 && <p style={{ color: 'var(--text-2)', margin: '16px 2px' }}>{t('noStatsYet')}</p>}
        <div class="big-stats">
          <div class="stat"><b class="num">{fmtNum(p.judged)}</b><span>{t('cardsJudged')}</span></div>
          <div class="stat"><b class="num">{accuracy.value}%</b><span>{t('accuracy')}</span></div>
          <div class="stat"><b class="num">{fmtNum(p.scamsCaught)}</b><span>{t('scamsCaught')}</span></div>
          <div class="stat"><b class="num">{fmtNum(p.legitTrusted)}</b><span>{t('legitTrusted')}</span></div>
          <div class="stat"><b class="num">{p.dailyStreak.best}</b><span>{t('dailyStreak')} · {t('longestDaily')}</span></div>
          <div class="stat"><b class="num">{p.rushBest}</b><span>{t('rush')}</span></div>
        </div>
        {weakest && (
          <div class="celebrate" style={{ background: 'color-mix(in srgb, var(--scam) 12%, transparent)' }}>
            <Icon name="target" />
            <div><b>{t('weakest')}</b><span>{CATEGORY_NAMES[weakest.k][L]} · <span class="num">{weakest.acc}%</span></span></div>
          </div>
        )}
        {missed.length > 0 && (
          <button class="mode" style={{ marginTop: '12px' }} onClick={() => push({ name: 'play', mode: 'practice', ids: missed })}>
            <span class="glyph g-hunt"><Icon name="target" /></span>
            <span class="txt"><b>{t('practice')}</b><span>{t('practiceSub')}</span></span>
            <span class="meta"><b class="num">{missed.length}</b></span>
          </button>
        )}
        {cats.length > 0 && (
          <div class="group">
            <h2>{t('byCategory')}</h2>
            <div class="panel">
              {cats.map((c) => (
                <div class={`cat-row ${c.acc < 60 ? 'low' : ''}`}>
                  <span class="n">{CATEGORY_NAMES[c.k][L]}</span>
                  <span class="bar"><i style={{ transform: `scaleX(${c.acc / 100})` }} /></span>
                  <span class="p num">{c.acc}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div class="group">
          <h2>{t('achievements')}</h2>
          <div class="ach-grid">
            {ACHIEVEMENTS.map((a) => (
              <div class={`ach ${p.achievements[a.id] ? '' : 'locked'}`}>
                <Icon name={p.achievements[a.id] ? a.icon : 'lock'} />
                <b>{a[L].title}</b>
                <span>{a[L].body}</span>
              </div>
            ))}
          </div>
        </div>
      </div></div>
    </div>
  );
}
