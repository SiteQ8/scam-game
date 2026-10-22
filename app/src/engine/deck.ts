import type { Card, Category } from '../content/types';
import type { RegionPref } from '../state/store';
import { hashString, mulberry32, shuffle } from './random';

export function byRegion(all: readonly Card[], pref: RegionPref): Card[] {
  if (pref === 'global') return all.filter((c) => c.region === 'global');
  if (pref === 'gcc') return all.filter((c) => c.region === 'gcc' || c.region === 'global');
  return all.slice();
}

export interface Chapter { id: string; filter: (c: Card) => boolean }

const CHAPTER_OF: Record<Category, string> = {
  delivery: 'delivery', shopping: 'delivery', marketplace: 'delivery', subscriptions: 'delivery', rental: 'delivery',
  banking: 'banks', accounts: 'banks', 'tech-support': 'banks',
  government: 'official', utilities: 'official', telecom: 'official', education: 'official', travel: 'official',
  jobs: 'offers', investment: 'offers', prize: 'offers', business: 'offers',
  romance: 'social', family: 'social', charity: 'social',
};

const hasVoice = (c: Card) => c.channel === 'call' || (c.channel === 'chat' && (c.en.card as { messages: { voice?: boolean }[] }).messages.some((m) => m.voice));

export const CHAPTERS: Chapter[] = [
  { id: 'basics', filter: (c) => c.difficulty <= 2 && !hasVoice(c) },
  { id: 'delivery', filter: (c) => CHAPTER_OF[c.category] === 'delivery' && !hasVoice(c) },
  { id: 'banks', filter: (c) => CHAPTER_OF[c.category] === 'banks' && !hasVoice(c) },
  { id: 'official', filter: (c) => CHAPTER_OF[c.category] === 'official' && !hasVoice(c) },
  { id: 'calls', filter: (c) => hasVoice(c) },
  { id: 'offers', filter: (c) => CHAPTER_OF[c.category] === 'offers' && !hasVoice(c) },
  { id: 'social', filter: (c) => (CHAPTER_OF[c.category] === 'social' || c.channel === 'social') && !hasVoice(c) },
  { id: 'expert', filter: (c) => c.difficulty >= 4 },
];

export const CHAPTER_SIZE = 10;
export const PASS_RATIO = 0.7;

/** A chapter's cards: stable for a given content set, balanced, easier first. */
export function chapterDeck(id: string, pool: readonly Card[]): Card[] {
  const ch = CHAPTERS.find((c) => c.id === id);
  if (!ch) return [];
  const list = pool.filter(ch.filter).sort((a, b) => a.id.localeCompare(b.id));
  const rng = mulberry32(hashString(`chapter:${id}`));
  const scams = shuffle(list.filter((c) => c.verdict === 'scam'), rng);
  const legit = shuffle(list.filter((c) => c.verdict === 'legit'), rng);
  const wantLegit = Math.min(legit.length, Math.max(3, Math.round(CHAPTER_SIZE * 0.4)));
  const picked = [...legit.slice(0, wantLegit), ...scams.slice(0, CHAPTER_SIZE - wantLegit)];
  if (picked.length < CHAPTER_SIZE) picked.push(...legit.slice(wantLegit, wantLegit + CHAPTER_SIZE - picked.length));
  return picked.sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id));
}

export function starsFor(right: number, total: number): number {
  if (!total) return 0;
  const r = right / total;
  if (r >= 1) return 3;
  if (r >= 0.85) return 2;
  if (r >= PASS_RATIO) return 1;
  return 0;
}

export function randomDeck(pool: readonly Card[], n: number, seed = Date.now()): Card[] {
  const out: Card[] = [];
  const rng = mulberry32(seed >>> 0);
  while (out.length < n && pool.length) out.push(...shuffle(pool, rng));
  return out.slice(0, n);
}

/** Cards for Flag Hunt: scams with at least two warning signs to find. */
export function huntPool(pool: readonly Card[]): Card[] {
  return pool.filter((c) => c.verdict === 'scam' && c.en.signals.filter((s) => s.kind === 'red').length >= 2 && c.channel !== 'call');
}
