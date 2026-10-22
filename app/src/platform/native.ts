import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { handleBack } from '../state/nav';
import { setMusic } from './audio';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform();

export async function initNative() {
  if (!isNative) return;
  App.addListener('backButton', () => {
    if (!handleBack()) App.exitApp();
  });
  App.addListener('appStateChange', ({ isActive }) => { if (!isActive) setMusic(false); });
  try { await StatusBar.setOverlaysWebView({ overlay: true }); } catch { /* iOS ignores */ }
  await SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {});
}

export async function setStatusBar(dark: boolean) {
  if (!isNative) return;
  try { await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }); } catch { /* ignore */ }
}

export async function appVersion(): Promise<string> {
  if (!isNative) return __APP_VERSION__;
  try { const info = await App.getInfo(); return `${info.version} (${info.build})`; } catch { return __APP_VERSION__; }
}
