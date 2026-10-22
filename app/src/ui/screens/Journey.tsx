import { useState } from 'preact/hooks';
import { progress, settings } from '../../state/store';
import { back, push } from '../../state/nav';
import { lang, t, count } from '../../i18n/i18n';
import { S } from '../../i18n/strings';
import { CHAPTERS, chapterDeck, byRegion } from '../../engine/deck';
import { CARDS } from '../../content/cards';
import { Icon } from '../components/Icon';
import { Stars, TopBar } from '../components/common';
import { sfx } from '../../platform/audio';

export function Journey() {
  const L = lang.value;
  const p = progress.value;
  const pool = byRegion(CARDS, settings.value.region);
  const chapters = CHAPTERS.map((c) => ({ ...c, size: chapterDeck(c.id, pool).length })).filter((c) => c.size >= 4);
  const [open, setOpen] = useState<string | null>(null);
  const unlocked = (i: number) => i === 0 || (p.journey[chapters[i - 1].id]?.stars || 0) > 0;
  const firstOpen = chapters.findIndex((c, i) => unlocked(i) && !(p.journey[c.id]?.stars));
  const sel = chapters.find((c) => c.id === open);
  return (
    <div class="screen">
      <TopBar title={t('journey')} onBack={back} />
      <div class="scroll"><div class="wrap">
        <div class="route">
          {chapters.map((c, i) => {
            const st = p.journey[c.id]?.stars || 0;
            const isUnlocked = unlocked(i);
            const title = S[`ch_${c.id}` as keyof typeof S][L];
            const sub = S[`ch_${c.id}_sub` as keyof typeof S][L];
            return (
              <button class={`stop ${st ? 'done' : ''} ${i === firstOpen ? 'open' : ''} ${isUnlocked ? '' : 'locked'}`} onClick={() => { void sfx('tap'); if (isUnlocked) setOpen(c.id); }} aria-disabled={!isUnlocked}>
                <span class="node num">{isUnlocked ? (st ? <Icon name="check" /> : i + 1) : <Icon name="lock" />}</span>
                <span class="txt"><b>{title}</b><span>{isUnlocked ? sub : t('locked')}</span></span>
                {isUnlocked && <Stars n={st} />}
              </button>
            );
          })}
        </div>
      </div></div>
      {sel && (
        <div class="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}>
          <div class="modal chapter-sheet" role="dialog" aria-modal="true">
            <span class="label" style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>{t('chapter', { n: chapters.indexOf(sel) + 1 })} · {count(sel.size, 'card')}</span>
            <h3 style={{ marginTop: '4px' }}>{S[`ch_${sel.id}` as keyof typeof S][L]}</h3>
            <p class="lead">{S[`ch_${sel.id}_sub` as keyof typeof S][L]}</p>
            <p style={{ fontSize: '0.92rem' }}>{t('passRule')}</p>
            {(p.journey[sel.id]?.stars || 0) > 0 && <div style={{ margin: '0 0 16px' }}><Stars n={p.journey[sel.id].stars} /></div>}
            <div class="btn-row">
              <button class="btn btn-secondary" onClick={() => setOpen(null)}>{t('cancel')}</button>
              <button class="btn btn-primary" onClick={() => { setOpen(null); push({ name: 'play', mode: 'chapter', chapter: sel.id }); }}>{(p.journey[sel.id]?.stars || 0) > 0 ? t('replayChapter') : t('start')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
