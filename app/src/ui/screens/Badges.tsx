import { useState } from 'preact/hooks';
import { progress } from '../../state/store';
import { back } from '../../state/nav';
import { lang, t, fmtNum, rankFor } from '../../i18n/i18n';
import { ACHIEVEMENTS, type Achievement, type BadgeGroup } from '../../engine/achievements';
import { levelFor } from '../../engine/levels';
import { CARDS } from '../../content/cards';
import { TopBar } from '../components/common';
import { Medal, LevelPearl } from '../components/Medal';
import { sfx } from '../../platform/audio';

const GROUPS: BadgeGroup[] = ['skill', 'daily', 'journey', 'modes'];

export function Badges() {
  const L = lang.value;
  const p = progress.value;
  const lv = levelFor(p.xp);
  const rank = rankFor(p.xp);
  const earned = ACHIEVEMENTS.filter((a) => p.achievements[a.id]).length;
  const [open, setOpen] = useState<Achievement | null>(null);
  const date = (ms: number) => new Intl.DateTimeFormat(L === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(ms));

  return (
    <div class="screen">
      <TopBar title={t('badges')} onBack={back} />
      <div class="scroll"><div class="wrap">
        <div class="level-card">
          <LevelPearl n={lv.n} pct={lv.pct} animate size="lg" />
          <div class="txt">
            <b>{rank.name}</b>
            <span class="label">{t('levelN', { n: lv.n })}</span>
            <span class="num">{lv.next ? t('xpToLevel', { n: lv.next - p.xp, level: lv.n + 1 }) : `${fmtNum(p.xp)} ${t('xp')}`}</span>
          </div>
        </div>
        <p class="badge-count num">{t('badgesEarned', { x: earned, y: ACHIEVEMENTS.length })}</p>
        {GROUPS.map((g) => (
          <div class="group">
            <h2>{t(`bg_${g}` as 'bg_skill')}</h2>
            <div class="medal-grid">
              {ACHIEVEMENTS.filter((a) => a.group === g).map((a) => {
                const on = Boolean(p.achievements[a.id]);
                const pr = a.progress?.(p, CARDS);
                return (
                  <button class={`medal-cell ${on ? 'on' : 'off'}`} onClick={() => { void sfx('tap'); setOpen(a); }} aria-label={`${a[L].title}. ${on ? t('earnedOn', { date: date(p.achievements[a.id]) }) : t('notYet')}`}>
                    <Medal a={a} on={on} ratio={pr && pr[1] > 0 ? pr[0] / pr[1] : undefined} />
                    <b>{a[L].title}</b>
                    {!on && pr && pr[1] > 1 && <span class="num">{fmtNum(pr[0])}/{fmtNum(pr[1])}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div></div>
      {open && (
        <div class="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}>
          <div class="modal badge-sheet" role="dialog" aria-modal="true" aria-labelledby="badge-h">
            {(() => {
              const on = Boolean(p.achievements[open.id]);
              const pr = open.progress?.(p, CARDS);
              return (
                <>
                  <Medal a={open} on={on} ratio={pr && pr[1] > 0 ? pr[0] / pr[1] : undefined} size="lg" />
                  <h3 id="badge-h">{open[L].title}</h3>
                  <span class="label">{t(open.tier === 'gold' ? 'tierGold' : open.tier === 'silver' ? 'tierSilver' : 'tierBronze')}</span>
                  <p>{open[L].body}</p>
                  {on ? (
                    <p class="when">{t('earnedOn', { date: date(p.achievements[open.id]) })}</p>
                  ) : (
                    <>
                      {pr && pr[1] > 1 && <div class="bar"><i style={{ transform: `scaleX(${pr[0] / pr[1]})` }} /></div>}
                      <p class="when num">{pr && pr[1] > 1 ? `${fmtNum(pr[0])}/${fmtNum(pr[1])}` : t('notYet')}</p>
                    </>
                  )}
                  <button class="btn btn-secondary" onClick={() => setOpen(null)} autoFocus>{t('close')}</button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
