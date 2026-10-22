// Sound effects through Web Audio (decoded once, low latency), music and voice through <audio>.
import { settings } from '../state/store';

export type Sfx = 'stamp' | 'correct' | 'wrong' | 'tap' | 'tick' | 'timeup' | 'levelup' | 'whoosh' | 'reveal' | 'ring';
const FILES: Record<Sfx, string> = {
  stamp: 'audio/sfx/stamp.mp3',
  correct: 'audio/sfx/correct.mp3',
  wrong: 'audio/sfx/wrong.mp3',
  tap: 'audio/sfx/tap.mp3',
  tick: 'audio/sfx/tick.mp3',
  timeup: 'audio/sfx/timeup.mp3',
  levelup: 'audio/sfx/levelup.mp3',
  whoosh: 'audio/sfx/whoosh.mp3',
  reveal: 'audio/sfx/reveal.mp3',
  ring: 'audio/sfx/ring.mp3',
};

let ctx: AudioContext | null = null;
const buffers = new Map<Sfx, AudioBuffer | null>();

export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
}

async function buffer(name: Sfx): Promise<AudioBuffer | null> {
  if (!ctx) return null;
  if (buffers.has(name)) return buffers.get(name)!;
  buffers.set(name, null);
  try {
    const res = await fetch(FILES[name]);
    if (!res.ok) throw new Error('missing');
    const buf = await ctx.decodeAudioData(await res.arrayBuffer());
    buffers.set(name, buf);
    return buf;
  } catch {
    return null;
  }
}

export function preloadSfx() {
  (Object.keys(FILES) as Sfx[]).forEach((n) => { void buffer(n); });
}

const GAIN: Partial<Record<Sfx, number>> = { tick: 0.35, tap: 0.4, whoosh: 0.5, ring: 0.6 };

export async function sfx(name: Sfx) {
  if (!settings.value.sfx) return;
  unlockAudio();
  if (!ctx) return;
  const buf = await buffer(name);
  const gain = ctx.createGain();
  gain.gain.value = GAIN[name] ?? 0.8;
  gain.connect(ctx.destination);
  if (buf) {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(gain);
    src.start();
    return;
  }
  synth(name, gain);
}

// Fallback tones, used only until the produced sound files are present.
function synth(name: Sfx, out: GainNode) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const tone = (freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.3) => {
    const o = ctx!.createOscillator();
    const g = ctx!.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t + start);
    g.gain.setValueAtTime(0.0001, t + start);
    g.gain.exponentialRampToValueAtTime(vol, t + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + start + dur);
    o.connect(g).connect(out);
    o.start(t + start);
    o.stop(t + start + dur + 0.02);
  };
  switch (name) {
    case 'stamp': tone(90, 0, 0.18, 'triangle', 0.6); tone(60, 0.01, 0.22, 'sine', 0.5); break;
    case 'correct': tone(660, 0, 0.12); tone(990, 0.09, 0.18); break;
    case 'wrong': tone(180, 0, 0.22, 'square', 0.12); tone(140, 0.12, 0.25, 'square', 0.1); break;
    case 'tap': tone(1200, 0, 0.04, 'sine', 0.12); break;
    case 'tick': tone(1600, 0, 0.03, 'square', 0.05); break;
    case 'timeup': tone(440, 0, 0.2); tone(330, 0.18, 0.3); break;
    case 'levelup': tone(523, 0, 0.12); tone(659, 0.1, 0.12); tone(784, 0.2, 0.25); break;
    case 'whoosh': tone(300, 0, 0.15, 'sawtooth', 0.04); break;
    case 'reveal': tone(880, 0, 0.1, 'triangle', 0.15); break;
    case 'ring': tone(800, 0, 0.3, 'sine', 0.2); tone(1000, 0.05, 0.3, 'sine', 0.15); break;
  }
}

// Music
let music: HTMLAudioElement | null = null;
export function setMusic(on: boolean, volume = 0.22) {
  if (!on || !settings.value.music) {
    music?.pause();
    return;
  }
  if (!music) {
    music = new Audio('audio/music/theme.mp3');
    music.loop = true;
    music.preload = 'auto';
  }
  music.volume = volume;
  music.play().catch(() => {});
}
export function duckMusic(duck: boolean) {
  if (music) music.volume = duck ? 0.04 : 0.22;
}

// Voice clips for calls and voice notes
export interface VoiceHandle { audio: HTMLAudioElement; stop: () => void }
let current: VoiceHandle | null = null;

export function playVoice(src: string, onEnd?: () => void): VoiceHandle {
  stopVoice();
  unlockAudio();
  const audio = new Audio(src);
  audio.preload = 'auto';
  const handle: VoiceHandle = {
    audio,
    stop: () => { audio.pause(); audio.currentTime = 0; duckMusic(false); },
  };
  audio.addEventListener('ended', () => { duckMusic(false); onEnd?.(); });
  duckMusic(true);
  audio.play().catch(() => onEnd?.());
  current = handle;
  return handle;
}

export function stopVoice() {
  current?.stop();
  current = null;
}
