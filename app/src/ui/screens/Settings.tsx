import { useState } from 'preact/hooks';
import { settings, updateSettings, eraseAll, type Settings as S_ } from '../../state/store';
import { back, push, reset } from '../../state/nav';
import { t } from '../../i18n/i18n';
import { Icon } from '../components/Icon';
import { Confirm, Segmented, Toggle, TopBar, toast } from '../components/common';
import { setMusic } from '../../platform/audio';
import { shareText } from '../../platform/share';
import { siteUrl } from './Play';

export function Settings() {
  const s = settings.value;
  const [erase, setErase] = useState(false);
  const set = (patch: Partial<S_>) => updateSettings(patch);
  const name = __BRAND__.nameEn;
  return (
    <div class="screen">
      <TopBar title={t('settings')} onBack={back} />
      <div class="scroll"><div class="wrap">
        <div class="group" style={{ marginTop: '4px' }}>
          <h2>{t('general')}</h2>
          <div class="panel">
            <div class="row stack"><span class="lbl">{t('language')}</span>
              <Segmented value={s.lang} label={t('language')} onChange={(v) => set({ lang: v })} options={[{ value: 'system', label: t('langSystem') }, { value: 'ar', label: 'العربية' }, { value: 'en', label: 'English' }]} />
            </div>
            <div class="row stack"><span class="lbl">{t('examples')}</span>
              <Segmented value={s.region} label={t('examples')} onChange={(v) => set({ region: v })} options={[{ value: 'gcc', label: t('regionGcc') }, { value: 'global', label: t('regionGlobal') }, { value: 'both', label: t('regionBoth') }]} />
            </div>
            <div class="row stack"><span class="lbl">{t('appearance')}</span>
              <Segmented value={s.theme} label={t('appearance')} onChange={(v) => set({ theme: v })} options={[{ value: 'dark', label: t('themeDark') }, { value: 'light', label: t('themeLight') }, { value: 'system', label: t('themeSystem') }]} />
            </div>
          </div>
        </div>
        <div class="group">
          <h2>{t('soundAndFeel')}</h2>
          <div class="panel">
            <div class="row"><Icon name="volume-2" class="lead" /><span class="lbl">{t('sound')}</span><Toggle checked={s.sfx} label={t('sound')} onChange={(v) => set({ sfx: v })} /></div>
            <div class="row"><Icon name="music" class="lead" /><span class="lbl">{t('music')}</span><Toggle checked={s.music} label={t('music')} onChange={(v) => { set({ music: v }); setMusic(v); }} /></div>
            <div class="row"><Icon name="phone" class="lead" /><span class="lbl">{t('autoplay')}</span><Toggle checked={s.autoplay} label={t('autoplay')} onChange={(v) => set({ autoplay: v })} /></div>
            <div class="row"><Icon name="vibrate" class="lead" /><span class="lbl">{t('haptics')}</span><Toggle checked={s.haptics} label={t('haptics')} onChange={(v) => set({ haptics: v })} /></div>
            <div class="row"><Icon name="eye" class="lead" /><span class="lbl">{t('reduceMotion')}</span><Toggle checked={s.reduceMotion} label={t('reduceMotion')} onChange={(v) => set({ reduceMotion: v })} /></div>
            <div class="row stack"><span class="lbl">{t('textSize')}</span>
              <Segmented value={s.textScale} label={t('textSize')} onChange={(v) => set({ textScale: v })} options={[{ value: 1 as const, label: t('sizeS') }, { value: 1.12 as const, label: t('sizeM') }, { value: 1.25 as const, label: t('sizeL') }]} />
            </div>
          </div>
        </div>
        <div class="group">
          <h2>{t('more')}</h2>
          <div class="panel">
            <button class="row link-row" onClick={() => push({ name: 'onboarding' })}><Icon name="book-open" class="lead" /><span class="lbl">{t('howToPlay')}</span><Icon name="chevron-right" class="flip-rtl" /></button>
            <button class="row link-row" onClick={async () => { const r = await shareText(`${name}\n${t('tagline')}`, siteUrl() || undefined); if (r === 'copied') toast(t('copied'), 'copy'); }}><Icon name="share-2" class="lead" /><span class="lbl">{t('shareApp')}</span><Icon name="chevron-right" class="flip-rtl" /></button>
            <a class="row link-row" href="mailto:site@hotmail.com"><Icon name="mail" class="lead" /><span class="lbl">{t('feedback')}</span><Icon name="chevron-right" class="flip-rtl" /></a>
            <button class="row link-row" onClick={() => push({ name: 'about' })}><Icon name="info" class="lead" /><span class="lbl">{t('about')}</span><Icon name="chevron-right" class="flip-rtl" /></button>
          </div>
        </div>
        <div class="group">
          <div class="panel"><button class="row link-row" onClick={() => setErase(true)} style={{ color: 'var(--scam-text)' }}><Icon name="rotate-ccw" class="lead" /><span class="lbl">{t('reset')}</span></button></div>
        </div>
      </div></div>
      {erase && <Confirm title={t('reset')} body={t('resetConfirm')} confirm={t('erase')} cancel={t('cancel')} danger onConfirm={async () => { setErase(false); await eraseAll(); reset(); }} onCancel={() => setErase(false)} />}
    </div>
  );
}
