import type { CapacitorConfig } from '@capacitor/cli';
import brand from './brand.json';

const config: CapacitorConfig = {
  appId: brand.appId,
  appName: brand.nameEn || 'Game',
  webDir: 'dist',
  backgroundColor: '#0D1D22',
  ios: {
    contentInset: 'never',
    backgroundColor: '#0D1D22',
    scrollEnabled: false,
    allowsLinkPreview: false,
  },
  android: {
    backgroundColor: '#0D1D22',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: '#0D1D22',
      showSpinner: false,
    },
  },
};

export default config;
