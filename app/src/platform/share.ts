import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

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

/**
 * Shares a picture drawn on the device. On a phone it goes through the system share sheet (which also
 * offers saving it); in a browser it uses the Web Share API with the file, or downloads it.
 */
export async function shareImage(canvas: HTMLCanvasElement, fileName: string, text: string): Promise<'shared' | 'saved' | 'failed'> {
  try {
    if (Capacitor.isNativePlatform()) {
      const data = canvas.toDataURL('image/png').split(',')[1];
      const file = await Filesystem.writeFile({ path: fileName, data, directory: Directory.Cache });
      await Share.share({ title: text, text, files: [file.uri] });
      return 'shared';
    }
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('no image'))), 'image/png'));
    const file = new File([blob], fileName, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text });
      return 'shared';
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return 'saved';
  } catch {
    return 'failed';
  }
}
