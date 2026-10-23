import { signal, effect, computed } from '@preact/signals';
import { load, save, remove } from './storage';
import type { Category } from '../content/types';

export type LangPref = 'system' | 'ar' | 'en';
export type RegionPref = 'gcc' | 'global' | 'both';
export type ThemePref = 'system' | 'dark' | 'light';

export interface Settings {
  lang: LangPref;
  region: RegionPref;
  theme: ThemePref;
  sfx: boolean;
  music: boolean;
  autoplay: boolean;
  haptics: boolean;
  reduceMotion: boolean;
  textScale: 1 | 1.12 | 1.25;
  /** Family and seniors mode: larger text and buttons, no timed modes, calmer motion. */
  family: boolean;
  onboarded: boolean;
}

export interface DailyRecord { results: boolean[]; score: number; done: boolean; edition: 'gcc' | 'global' }
export interface CardRecord { right: number; wrong: number }

export interface Progress {
  xp: number;
  judged: number;
  right: number;
  scamsCaught: number;
  legitTrusted: number;
  bestRun: number;
  daily: Record<string, DailyRecord>;
  dailyStreak: { current: number; best: number; lastDay: number };
  journey: Record<string, { stars: number; best: number }>;
  packs: Record<string, { stars: number; best: number }>;
  rushBest: number;
  huntPerfect: number;
  huntsPlayed: number;
  partyGames: number;
  checkerUses: number;
  familyRounds: number;
  cards: Record<string, CardRecord>;
  categories: Partial<Record<Category, CardRecord>>;
  achievements: Record<string, number>;
}

const KEY = 'game.state.v1';

export const defaultSettings = (): Settings => ({
  lang: 'system',
  region: 'both',
  theme: 'dark',
  sfx: true,
  music: false,
  autoplay: true,
  haptics: true,
  reduceMotion: false,
  textScale: 1,
  family: false,
  onboarded: false,
});

export const defaultProgress = (): Progress => ({
  xp: 0,
  judged: 0,
  right: 0,
  scamsCaught: 0,
  legitTrusted: 0,
  bestRun: 0,
  daily: {},
  dailyStreak: { current: 0, best: 0, lastDay: -1 },
  journey: {},
  packs: {},
  rushBest: 0,
  huntPerfect: 0,
  huntsPlayed: 0,
  partyGames: 0,
  checkerUses: 0,
  familyRounds: 0,
  cards: {},
  categories: {},
  achievements: {},
});

export const settings = signal<Settings>(defaultSettings());
export const progress = signal<Progress>(defaultProgress());
export const ready = signal(false);

export function updateSettings(patch: Partial<Settings>) {
  settings.value = { ...settings.value, ...patch };
}

export function updateProgress(fn: (p: Progress) => void) {
  const next: Progress = structuredClone(progress.value);
  fn(next);
  progress.value = next;
}

/** True when the web version was opened with ?lang=ar or ?lang=en and had no saved state yet. */
export let langFromLink = false;

export async function hydrate() {
  const raw = await load(KEY);
  if (!raw) {
    // The website links to the game in the page's language; a first visit starts in that language.
    const q = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('lang') : null;
    if (q === 'ar' || q === 'en') { settings.value = { ...settings.value, lang: q }; langFromLink = true; }
  }
  if (raw) {
    try {
      const data = JSON.parse(raw);
      settings.value = { ...defaultSettings(), ...(data.settings || {}) };
      progress.value = { ...defaultProgress(), ...(data.progress || {}) };
    } catch {
      /* corrupted state: start fresh */
    }
  }
  ready.value = true;
}

let timer: ReturnType<typeof setTimeout> | undefined;
effect(() => {
  const payload = JSON.stringify({ settings: settings.value, progress: progress.value });
  if (!ready.value) return;
  clearTimeout(timer);
  timer = setTimeout(() => save(KEY, payload), 250);
});

export async function eraseAll() {
  await remove(KEY);
  const keepLang = settings.value.lang;
  settings.value = { ...defaultSettings(), lang: keepLang, onboarded: true };
  progress.value = defaultProgress();
}

export const accuracy = computed(() => (progress.value.judged ? Math.round((progress.value.right / progress.value.judged) * 100) : 0));
