#!/usr/bin/env python3
"""Pick the better of each item's takes before post-processing.
usage: voice_pick.py plan.json rawdir
A call take must show a clear pause (1 s or more) at each [long pause]; among good takes the one
whose speaking rate is closest to the language median wins. The pick is copied to <rawdir>/<name>.mp3."""
import json, os, re, shutil, statistics, subprocess, sys
plan = json.load(open(sys.argv[1])); raw = sys.argv[2]
def probe(f):
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout or 0)
    det = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', f, '-af', 'silencedetect=n=-38dB:d=0.45', '-f', 'null', '-'], capture_output=True, text=True).stderr
    s = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', det)]
    e = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', det)]
    return d, sorted([b - a for a, b in zip(s, e) if a > 0.3 and b < d - 0.2], reverse=True)
rows = []
for x in plan:
    name = f"{x['id']}.{x['lang']}" + (f".{x['idx']}" if x['kind'] == 'voice' else '')
    chars = len(re.sub(r'\[[^\]]+\]', '', x['text']).strip())
    for k in range(4):
        f = os.path.join(raw, f'{name}.t{k}.mp3')
        if os.path.exists(f):
            d, g = probe(f)
            rows.append({'name': name, 'lang': x['lang'], 'kind': x['kind'], 'n': len(x.get('lines', [])), 'take': f, 'dur': d, 'rate': chars / d if d else 0, 'gaps': g})
median = {l: statistics.median([r['rate'] for r in rows if r['lang'] == l]) for l in ('ar', 'en')}
best = {}
for r in rows:
    ok = r['kind'] != 'call' or (len(r['gaps']) >= r['n'] - 1 and all(g >= 1.0 for g in r['gaps'][: r['n'] - 1]))
    score = (0 if ok else 100) + abs(r['rate'] - median[r['lang']])
    if r['name'] not in best or score < best[r['name']][0]: best[r['name']] = (score, r)
missing = []
for x in plan:
    name = f"{x['id']}.{x['lang']}" + (f".{x['idx']}" if x['kind'] == 'voice' else '')
    if name not in best: missing.append(name); continue
    score, r = best[name]
    shutil.copyfile(r['take'], os.path.join(raw, f'{name}.mp3'))
    flag = '' if score < 100 else '  <- no clean pause, check'
    print(f"{name:44s} {os.path.basename(r['take'])[-6:-4]} {r['dur']:5.1f}s {r['rate']:4.1f} c/s{flag}")
print('medians', {k: round(v, 1) for k, v in median.items()}, 'missing', missing)
