import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

/** Opens the system share sheet; falls back to copying the text. Returns 'copied' when it copied. */
export async function shareText(text: string, url?: string): Promise<'shared' | 'copied' | 'failed'> {
  const full = url ? `${text}\n${url}` : text;
  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({ text: full });
      return 'shared';
    }
    if (navigator.share) {
      await navigator.share({ text: full });
      return 'shared';
    }
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return 'failed';
  }
  try {
    await navigator.clipboard.writeText(full);
    return 'copied';
  } catch {
    return 'failed';
  }
}
