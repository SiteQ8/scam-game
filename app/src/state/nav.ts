import { signal } from '@preact/signals';
import type { PackId } from '../content/types';

export type Route =
  | { name: 'home' }
  | { name: 'play'; mode: 'daily' | 'chapter' | 'pack' | 'rush' | 'party' | 'tutorial' | 'practice'; chapter?: string; pack?: PackId; party?: PartySetup; ids?: string[] }
  | { name: 'journey' }
  | { name: 'partySetup' }
  | { name: 'hunt' }
  | { name: 'checker' }
  | { name: 'stats' }
  | { name: 'badges' }
  | { name: 'certificate' }
  | { name: 'settings' }
  | { name: 'about' }
  | { name: 'onboarding' };

export interface PartySetup { players: string[]; cardsEach: number }

export type Entry = Route & { k: number };
let seq = 0;
const entry = (r: Route): Entry => ({ ...r, k: ++seq });

export const stack = signal<Entry[]>([entry({ name: 'home' })]);
export const direction = signal<'forward' | 'back' | 'none'>('none');

export function push(r: Route) { direction.value = 'forward'; stack.value = [...stack.value, entry(r)]; }
export function back(): boolean {
  if (stack.value.length <= 1) return false;
  direction.value = 'back';
  stack.value = stack.value.slice(0, -1);
  return true;
}
/** Swaps the top screen for a fresh one (a new key always remounts it). */
export function replace(r: Route) { direction.value = 'forward'; stack.value = [...stack.value.slice(0, -1), entry(r)]; }
export function reset(r: Route = { name: 'home' }) { direction.value = 'back'; stack.value = [entry(r)]; }
export const current = () => stack.value[stack.value.length - 1];

// Screens can register a handler for the hardware back button (for example to confirm leaving a round).
let interceptor: (() => boolean) | null = null;
export function setBackInterceptor(fn: (() => boolean) | null) { interceptor = fn; }
export function handleBack(): boolean {
  if (interceptor && interceptor()) return true;
  return back();
}
