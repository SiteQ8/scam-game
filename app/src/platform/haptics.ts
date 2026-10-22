import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { settings } from '../state/store';

const native = Capacitor.isNativePlatform();

export function impact(style: 'light' | 'medium' | 'heavy' = 'medium') {
  if (!settings.value.haptics) return;
  if (native) {
    Haptics.impact({ style: style === 'light' ? ImpactStyle.Light : style === 'heavy' ? ImpactStyle.Heavy : ImpactStyle.Medium }).catch(() => {});
  } else if ('vibrate' in navigator) {
    navigator.vibrate(style === 'heavy' ? 24 : style === 'medium' ? 14 : 8);
  }
}

export function notify(kind: 'success' | 'error' | 'warning') {
  if (!settings.value.haptics) return;
  if (native) {
    Haptics.notification({ type: kind === 'success' ? NotificationType.Success : kind === 'error' ? NotificationType.Error : NotificationType.Warning }).catch(() => {});
  } else if ('vibrate' in navigator) {
    navigator.vibrate(kind === 'error' ? [18, 60, 18] : 12);
  }
}

export function selection() {
  if (!settings.value.haptics || !native) return;
  Haptics.selectionChanged().catch(() => {});
}
