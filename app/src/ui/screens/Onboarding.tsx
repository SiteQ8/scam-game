import { useRef, useState } from 'preact/hooks';
import type { Verdict } from '../../content/types';
import { CARDS } from '../../content/cards';
import { settings, updateSettings, langFromLink } from '../../state/store';
import { reset, back, stack } from '../../state/nav';
import { lang, t } from '../../i18n/i18n';
import { CardView } from '../cards/CardView';
import { SwipeCard, type SwipeApi } from '../components/SwipeCard';
import { Icon } from '../components/Icon';
import { Mark, Toggle } from '../components/common';
import { sfx, unlockAudio } from '../../platform/audio';
import { impact, notify } from '../../platform/haptics';

const DEMO = 'sms-parcel-redelivery-fee';

export function Onboarding() {
  const L = lang.value;
  const firstRun = !settings.value.onboarded;
  const first = firstRun && !langFromLink ? 0 : 1;
  const [step, setStep] = useState(first);
  const [said, setSaid] = useState<Verdict | null>(null);
  const api = useRef<SwipeApi | null>(null);
  const demo = CARDS.find((c) => c.id === DEMO) || CARDS[0];
  const steps = 5;

  const done = () => {
    updateSettings({ onboarded: true });
    if (stack.value.length > 1) back(); else reset();
  };
  const nextStep = () => { unlockAudio(); void sfx('tap'); if (step >= steps - 1) done(); else setStep(step + 1); };

  return (
    <div class="screen">
      <div class="topbar">
        {step > first ? <button class="icon-btn" onClick={() => setStep(step - 1)} aria-label={t('back')}><Icon name="arrow-left" class="flip-rtl" /></button> : <span class="spacer" />}
        <h1 />
        <button class="btn btn-ghost" style={{ width: 'auto', padding: '0 14px' }} onClick={done}>{t('skip')}</button>
      </div>
      <div class="onb">
        {step === 0 && (
          <>
            <div class="art"><Mark class="hero-mark" /></div>
            <h2>{t('chooseLanguage')}</h2>
            <div class="lang-pick" role="radiogroup" aria-label={t('language')}>
              {(['ar', 'en'] as const).map((l) => (
                <button role="radio" aria-checked={L === l ? 'true' : 'false'} lang={l} onClick={() => { updateSettings({ lang: l }); void sfx('tap'); }}>{l === 'ar' ? 'العربية' : 'English'}</button>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <div class="art"><Mark class="hero-mark" /></div>
            <h2>{t('ob1Title')}</h2>
            <p>{t('ob1Body')}</p>
          </>
        )}
        {step === 2 && (
          <>
            <div class="art" style={{ alignItems: 'stretch' }}>
              <div class="stage" style={{ margin: 0, width: '100%' }}>
                <SwipeCard key="demo" locked={!!said} said={said} truth={said ? demo.verdict : null} lang={L} reduceMotion={settings.value.reduceMotion} apiRef={api}
                  onDecide={(v) => { setSaid(v); impact('heavy'); void sfx('stamp'); setTimeout(() => { if (v === demo.verdict) { void sfx('correct'); notify('success'); } else { void sfx('wrong'); notify('error'); } }, 380); }}>
                  <CardView card={demo} lang={L} mode="play" />
                </SwipeCard>
              </div>
            </div>
            <h2>{said ? t('tutorialDone') : t('ob2Title')}</h2>
            <p>{said ? (said === demo.verdict ? `${t('correct')}. ${t('itWasScam')}` : `${t('wrong')}. ${t('itWasScam')}`) : t('ob2Body')}</p>
          </>
        )}
        {step === 3 && (
          <>
            <div class="art" style={{ alignItems: 'flex-start', overflow: 'auto' }}>
              <CardView card={demo} lang={L} mode="debrief" marksOn />
            </div>
            <h2>{t('ob3Title')}</h2>
            <p>{t('ob3Body')}</p>
          </>
        )}
        {step === 4 && (
          <>
            <div class="art"><div class="hero-glyph"><Icon name="shield-check" class="hero-icon" /></div></div>
            <h2>{t('ob4Title')}</h2>
            <p>{t('ob4Body')}</p>
            <div class="panel onb-family">
              <div class="row"><Icon name="accessibility" class="lead" /><span class="lbl">{t('familyMode')}<small>{t('familyModeSub')}</small></span><Toggle checked={settings.value.family} label={t('familyMode')} onChange={(v) => updateSettings({ family: v })} /></div>
            </div>
          </>
        )}
        <div class="dots" aria-hidden="true">{Array.from({ length: steps - first }, (_, i) => <i class={`bead ${i + first <= step ? 'ok' : 'seat'}`} />)}</div>
        {step === 2 && !said ? (
          <div class="verdicts" style={{ padding: 0 }}>
            <button class="verdict-btn scam" onClick={() => api.current?.decide('scam')}><span class="vd"><Icon name="x" /></span>{t('scam')}</button>
            <button class="verdict-btn legit" onClick={() => api.current?.decide('legit')}><span class="vd"><Icon name="check" /></span>{t('legit')}</button>
          </div>
        ) : (
          <button class="btn btn-primary" onClick={nextStep}>{step >= steps - 1 ? t('letsGo') : t('continue')}<Icon name="arrow-right" class="flip-rtl" /></button>
        )}
      </div>
    </div>
  );
}
