import { render } from 'preact';
import './styles/fonts.css';
import './styles/app.css';
import { App } from './app';
import { hydrate } from './state/store';
import { initNative } from './platform/native';
import { unlockAudio, preloadSfx } from './platform/audio';

async function boot() {
  await hydrate();
  if (import.meta.env.MODE === 'capture') {
    const w = window as unknown as Record<string, unknown>;
    w.__nav = await import('./state/nav');
    w.__daily = await import('./engine/daily');
    w.__cards = (await import('./content/cards')).CARDS;
  }
  render(<App />, document.getElementById('app')!);
  void initNative();
  const unlock = () => { unlockAudio(); preloadSfx(); window.removeEventListener('pointerdown', unlock); };
  window.addEventListener('pointerdown', unlock, { passive: true });
  // Keep pinch zoom available but stop the double tap zoom from fighting fast swipes on iOS.
  document.addEventListener('gesturestart', (e) => e.preventDefault());
}

void boot();
