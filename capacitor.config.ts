import type { CapacitorConfig } from '@capacitor/cli';
import brand from './brand.json';

const config: CapacitorConfig = {
  appId: brand.appId,
  appName: brand.nameEn || 'Game',
  webDir: 'dist',
  backgroundColor: '#0C111B',
  ios: {
    contentInset: 'never',
    backgroundColor: '#0C111B',
    scrollEnabled: false,
    allowsLinkPreview: false,
  },
  android: {
    backgroundColor: '#0C111B',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: '#0C111B',
      showSpinner: false,
    },
  },
};

export default config;
