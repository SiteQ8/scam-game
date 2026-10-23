import { progress, accuracy } from '../../state/store';
import { back, push } from '../../state/nav';
import { lang, t, fmtNum, rankFor } from '../../i18n/i18n';
import { CATEGORY_NAMES } from '../../i18n/strings';
import { ACHIEVEMENTS } from '../../engine/achievements';
import { levelFor } from '../../engine/levels';
import { LevelPearl } from '../components/Medal';
import { Icon } from '../components/Icon';
import { Strand, TopBar } from '../components/common';

export function Stats() {
  const L = lang.value;
  const p = progress.value;
  const rank = rankFor(p.xp);
  const lv = levelFor(p.xp);
  const earned = ACHIEVEMENTS.filter((a) => p.achievements[a.id]).length;
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
        <button class="rank-strip" onClick={() => push({ name: 'badges' })} aria-label={`${t('levelN', { n: lv.n })}, ${rank.name}. ${t('badges')}`}>
          <LevelPearl n={lv.n} />
          <span class="txt"><b>{rank.name}</b><span class="num">{t('levelN', { n: lv.n })} · {fmtNum(p.xp)} {t('xp')}</span></span>
          <Icon name="chevron-right" class="flip-rtl" />
        </button>
        {p.judged === 0 && <p class="lead-text" style={{ marginTop: '16px' }}>{t('noStatsYet')}</p>}
        <div class="big-stats">
          <div class="stat"><b class="num">{fmtNum(p.judged)}</b><span>{t('cardsJudged')}</span></div>
          <div class="stat"><b class="num">{accuracy.value}%</b><span>{t('accuracy')}</span></div>
          <div class="stat"><b class="num">{fmtNum(p.scamsCaught)}</b><span>{t('scamsCaught')}</span></div>
          <div class="stat"><b class="num">{fmtNum(p.legitTrusted)}</b><span>{t('legitTrusted')}</span></div>
          <div class="stat"><b class="num">{p.dailyStreak.best}</b><span>{t('dailyStreak')} · {t('longestDaily')}</span></div>
          <div class="stat"><b class="num">{p.rushBest}</b><span>{t('rush')}</span></div>
        </div>
        {weakest && (
          <div class="celebrate weak">
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
                <div class="cat-row">
                  <span class="n">{CATEGORY_NAMES[c.k][L]}</span>
                  <Strand total={10} results={Array.from({ length: 10 }, (_, i) => i < Math.round(c.acc / 10))} />
                  <span class="p num">{c.acc}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <button class="mode" style={{ marginTop: '22px' }} onClick={() => push({ name: 'badges' })}>
          <span class="glyph g-journey"><Icon name="medal" /></span>
          <span class="txt"><b>{t('badges')}</b><span class="num">{t('badgesEarned', { x: earned, y: ACHIEVEMENTS.length })}</span></span>
          <Icon name="chevron-right" class="flip-rtl" />
        </button>
      </div></div>
    </div>
  );
}
