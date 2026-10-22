// Persistent key/value storage: native Preferences inside the apps, localStorage on the web.
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const native = Capacitor.isNativePlatform();

export async function load(key: string): Promise<string | null> {
  try {
    if (native) return (await Preferences.get({ key })).value;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function save(key: string, value: string): Promise<void> {
  try {
    if (native) await Preferences.set({ key, value });
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage can be unavailable (private mode); the game still runs in memory */
  }
}

export async function remove(key: string): Promise<void> {
  try {
    if (native) await Preferences.remove({ key });
    else window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
