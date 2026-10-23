import { useEffect } from 'preact/hooks';
import { effect } from '@preact/signals';
import { stack, direction, type Entry } from './state/nav';
import { settings, ready } from './state/store';
import { applyDocumentLang, lang } from './i18n/i18n';
import { setStatusBar } from './platform/native';
import { ToastHost } from './ui/components/common';
import { Home } from './ui/screens/Home';
import { Play } from './ui/screens/Play';
import { Journey } from './ui/screens/Journey';
import { PartySetup } from './ui/screens/PartySetup';
import { Hunt } from './ui/screens/Hunt';
import { Checker } from './ui/screens/Checker';
import { Stats } from './ui/screens/Stats';
import { Badges } from './ui/screens/Badges';
import { Certificate } from './ui/screens/Certificate';
import { Tips } from './ui/screens/Tips';
import { Settings } from './ui/screens/Settings';
import { About } from './ui/screens/About';
import { Onboarding } from './ui/screens/Onboarding';

const media = window.matchMedia('(prefers-color-scheme: dark)');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

function applyTheme() {
  const s = settings.value;
  const dark = s.theme === 'system' ? media.matches : s.theme === 'dark';
  const el = document.documentElement;
  el.dataset.theme = dark ? 'dark' : 'light';
  // Family mode reads at least a third larger whatever the text size, and keeps motion calm.
  el.style.setProperty('--scale', String(s.family ? Math.max(1.3, s.textScale + 0.18) : s.textScale));
  el.classList.toggle('family', s.family);
  el.classList.toggle('reduce-motion', s.reduceMotion || s.family || motion.matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0c111b' : '#ece7de');
  void setStatusBar(dark);
}

effect(() => { settings.value; applyTheme(); });
effect(() => { lang.value; applyDocumentLang(); });
media.addEventListener?.('change', applyTheme);
motion.addEventListener?.('change', applyTheme);

function Screen({ r }: { r: Entry }) {
  switch (r.name) {
    case 'home': return <Home />;
    case 'play': return <Play route={r} />;
    case 'journey': return <Journey />;
    case 'partySetup': return <PartySetup />;
    case 'hunt': return <Hunt />;
    case 'checker': return <Checker />;
    case 'stats': return <Stats />;
    case 'badges': return <Badges />;
    case 'certificate': return <Certificate />;
    case 'tips': return <Tips />;
    case 'settings': return <Settings />;
    case 'about': return <About />;
    case 'onboarding': return <Onboarding />;
  }
}

export function App() {
  useEffect(() => { applyTheme(); applyDocumentLang(); }, []);
  if (!ready.value) return null;
  const top = settings.value.onboarded ? stack.value[stack.value.length - 1] : ({ name: 'onboarding', k: 0 } as Entry);
  const dir = direction.value;
  return (
    <>
      <div key={top.k} class={`screen-host`} style={{ position: 'absolute', inset: 0 }}>
        <div class={`screen-anim ${dir === 'back' ? 'enter-back' : dir === 'forward' ? 'enter-forward' : 'enter-first'}`} style={{ position: 'absolute', inset: 0 }}>
          <Screen r={top} />
        </div>
      </div>
      <ToastHost />
    </>
  );
}
