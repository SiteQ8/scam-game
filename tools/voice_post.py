#!/usr/bin/env python3
"""Post-process downloaded voice takes: phone-line colour for calls, loudness, and line timings.
usage: voice_post.py plan.json rawdir
Each raw take is <rawdir>/<id>.<lang>[.<idx>].mp3; outputs go to app/public/<file>,
and call timings to app/public/audio/calls/<id>.<lang>.json"""
import json, os, re, subprocess, sys
plan = json.load(open(sys.argv[1])); raw = sys.argv[2]
PUB = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'app/public')
def run(args): return subprocess.run(args, capture_output=True, text=True)
for item in plan:
    base = f"{item['id']}.{item['lang']}" + (f".{item['idx']}" if item['kind'] == 'voice' else '')
    src = os.path.join(raw, base + '.mp3')
    if not os.path.exists(src):
        print('missing', base); continue
    out = os.path.join(PUB, item['file']); os.makedirs(os.path.dirname(out), exist_ok=True)
    if item['phone']:
        chain = 'highpass=f=280,lowpass=f=3500,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,aresample=16000,aresample=44100,loudnorm=I=-17:TP=-1.5:LRA=9'
    else:
        chain = 'highpass=f=90,acompressor=threshold=-22dB:ratio=2.5:attack=5:release=120,loudnorm=I=-17:TP=-1.5:LRA=9'
    r = run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', chain, '-ac', '1', '-ar', '44100', '-b:a', '64k', out])
    if r.returncode: print('ffmpeg failed', base, r.stderr[-300:]); continue
    dur = float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).stdout.strip() or 0)
    if item['kind'] == 'call':
        # Split at the pauses between caller lines.
        # Pauses are measured on the clean take: the phone filter and loudness pass lift the quiet gaps.
        det = run(['ffmpeg', '-hide_banner', '-nostats', '-i', src, '-af', 'silencedetect=n=-38dB:d=0.45', '-f', 'null', '-']).stderr
        starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', det)]
        ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', det)]
        gaps = [(s, e) for s, e in zip(starts, ends) if s > 0.3 and e < dur - 0.2]
        n = len(item['lines'])
        gaps = sorted(sorted(gaps, key=lambda g: g[1] - g[0], reverse=True)[: n - 1])
        bounds = [0.0] + [g[0] for g in gaps] + [dur]
        nexts = [g[1] for g in gaps]
        timing = []
        for k, line in enumerate(item['lines']):
            start = 0.0 if k == 0 else nexts[k - 1] if k - 1 < len(nexts) else bounds[k]
            end = bounds[k + 1] if k + 1 < len(bounds) else dur
            timing.append({'line': line, 'start': round(start, 2), 'end': round(end, 2)})
        ok = len(gaps) == n - 1
        json.dump(timing, open(out.replace('.mp3', '.json'), 'w'))
        print(f"{base}: {dur:.1f}s, {n} lines, pauses found {len(gaps)}{'' if ok else ' (estimated)'}")
    else:
        json.dump({'duration': round(dur, 1)}, open(out.replace('.mp3', '.json'), 'w'))
        print(f'{base}: {dur:.1f}s')
