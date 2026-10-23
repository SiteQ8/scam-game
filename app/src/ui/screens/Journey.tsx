import { useState } from 'preact/hooks';
import { progress, settings } from '../../state/store';
import { back, push } from '../../state/nav';
import { lang, t, count } from '../../i18n/i18n';
import { S } from '../../i18n/strings';
import { CHAPTERS, chapterDeck, byRegion } from '../../engine/deck';
import { isCore } from '../../engine/packs';
import { CARDS } from '../../content/cards';
import { Icon } from '../components/Icon';
import { Pearls, TopBar } from '../components/common';
import { sfx } from '../../platform/audio';

export function Journey() {
  const L = lang.value;
  const p = progress.value;
  const pool = byRegion(CARDS, settings.value.region).filter(isCore);
  const chapters = CHAPTERS.map((c) => ({ ...c, size: chapterDeck(c.id, pool).length })).filter((c) => c.size >= 4);
  const [open, setOpen] = useState<string | null>(null);
  const unlocked = (i: number) => i === 0 || (p.journey[chapters[i - 1].id]?.stars || 0) > 0;
  const firstOpen = chapters.findIndex((c, i) => unlocked(i) && !(p.journey[c.id]?.stars));
  const sel = chapters.find((c) => c.id === open);
  return (
    <div class="screen">
      <TopBar title={t('journey')} onBack={back} />
      <div class="scroll"><div class="wrap">
        {(() => {
          const passed = CHAPTERS.filter((c) => (p.journey[c.id]?.stars || 0) > 0).length;
          const ready = passed === CHAPTERS.length;
          return (
            <button class={`cert-banner ${ready ? 'ready' : ''}`} onClick={() => { void sfx('tap'); push({ name: 'certificate' }); }}>
              <span class="glyph"><Icon name="file-badge" /></span>
              <span class="txt"><b>{ready ? t('certReady') : t('certificate')}</b><span class="num">{ready ? t('certGet') : t('certProgress', { x: passed, y: CHAPTERS.length })}</span></span>
              <Icon name="chevron-right" class="flip-rtl" />
            </button>
          );
        })()}
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
                {isUnlocked && <Pearls n={st} />}
              </button>
            );
          })}
        </div>
      </div></div>
      {sel && (
        <div class="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}>
          <div class="modal chapter-sheet" role="dialog" aria-modal="true" aria-labelledby="chapter-h">
            <h3 id="chapter-h">{S[`ch_${sel.id}` as keyof typeof S][L]}</h3>
            <span class="sheet-meta">{t('chapter', { n: chapters.indexOf(sel) + 1 })} · {count(sel.size, 'card')}</span>
            <p class="lead">{S[`ch_${sel.id}_sub` as keyof typeof S][L]}</p>
            <p class="rule">{t('passRule')}</p>
            {(p.journey[sel.id]?.stars || 0) > 0 && <div class="sheet-pearls"><Pearls n={p.journey[sel.id].stars} /></div>}
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
