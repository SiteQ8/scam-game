#!/usr/bin/env python3
"""Trim, peak-normalise and encode the chosen sound effect takes into app/public/audio/sfx."""
import subprocess, re, os, sys, tempfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '.work/audio/raw')
OUT = os.path.join(ROOT, 'app/public/audio/sfx')
os.makedirs(OUT, exist_ok=True)
# name: (take, max seconds, target peak dB)
PICK = {
    'stamp': ('stamp-0', 0.9, -1.0), 'correct': ('correct-0', 1.4, -2.0), 'wrong': ('wrong-1', 0.9, -4.0),
    'tap': ('tap-1', 0.18, -6.0), 'tick': ('tick-0', 0.25, -6.0), 'timeup': ('timeup-0', 1.6, -2.0),
    'levelup': ('levelup-0', 1.9, -2.0), 'whoosh': ('whoosh-0', 0.5, -4.0), 'reveal': ('reveal-1', 0.8, -4.0),
    'ring': ('ring-1', 1.05, -3.0),
}
def maxvol(path):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = re.search(r'max_volume: (-?[\d.]+) dB', out)
    return float(m.group(1)) if m else 0.0
for name, (take, dur, peak) in PICK.items():
    src = f'{RAW}/{take}.mp3'
    tmp = os.path.join(tempfile.gettempdir(), f'{name}-trim.wav')
    fade = max(0.03, min(0.12, dur * 0.2))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af',
        f'silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.005,atrim=0:{dur},afade=t=out:st={dur - fade:.3f}:d={fade:.3f}',
        '-ac', '1', '-ar', '44100', tmp], check=True)
    gain = peak - maxvol(tmp)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-af', f'volume={gain:.2f}dB', '-ac', '1', '-ar', '44100', '-b:a', '96k', f'{OUT}/{name}.mp3'], check=True)
    print(f'{name}: {take} gain {gain:+.1f} dB -> {os.path.getsize(f"{OUT}/{name}.mp3")} bytes')
