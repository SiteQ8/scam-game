#!/usr/bin/env python3
"""Turns the captured screens into the website's pictures.
usage: site-images.py <capture dir> <site img dir>
The press kit's phone screens become 880 px wide WebP (two pixels per CSS pixel); the four stages of a case keep
their own size at two pixels per CSS pixel. Writes manifest.json with each stage's CSS size, so the page reserves
the right space, and where the case number sits on the stage that shows it, so the page can write in today's number.
Pictures from earlier runs that no page uses any more are removed."""
import json, os, sys
from PIL import Image

cap, out = sys.argv[1:3]
# The screens the press kit shows (pressShots in scripts/build-site.mjs).
SCREENS = ['home', 'card', 'debrief', 'call', 'packs', 'badges', 'certificate', 'family']
KEEP = {f'{s}.webp' for s in SCREENS} | {f'stage-{k}{x}.webp' for k in ('k1', 'k2', 'k3', 'k4') for x in ('', '-live')} | {'swipe-loop.webp', 'swipe-loop.webm', 'swipe-loop.mp4'}
manifest = {}
for lang in ('en', 'ar'):
    os.makedirs(os.path.join(out, lang), exist_ok=True)
    manifest[lang] = {}
    for f in os.listdir(os.path.join(out, lang)):
        base = f[:-5] if f.endswith('.json') else f
        if base not in KEEP: os.remove(os.path.join(out, lang, f))
    for name in SCREENS:
        src = os.path.join(cap, lang, f'{name}.png')
        if not os.path.exists(src):
            print('missing', lang, name); continue
        im = Image.open(src).convert('RGB')
        im = im.resize((880, round(880 * im.height / im.width)), Image.LANCZOS)
        im.save(os.path.join(out, lang, f'{name}.webp'), 'WEBP', quality=80, method=6)
    # The case in four stages: whole elements at their own size, two pixels per CSS pixel.
    manifest[lang]['stages'] = {}
    for k in ('k1', 'k2', 'k3', 'k4'):
        meta_path = os.path.join(cap, lang, f'stage-{k}.json')
        if not os.path.exists(meta_path):
            print('missing stage', lang, k); continue
        meta = json.load(open(meta_path))
        for suffix in ('', '-live'):
            src = os.path.join(cap, lang, f'stage-{k}{suffix}.png')
            if not os.path.exists(src): continue
            im = Image.open(src)
            # A stage cut out on its own keeps its clear corners; the rest are whole rectangles.
            im = im.convert('RGBA' if meta.get('cut') else 'RGB')
            im = im.resize((meta['w'] * 2, meta['h'] * 2), Image.LANCZOS)
            im.save(os.path.join(out, lang, f'stage-{k}{suffix}.webp'), 'WEBP', quality=84, method=6)
        manifest[lang]['stages'][k] = meta
json.dump(manifest, open(os.path.join(out, 'manifest.json'), 'w'), indent=1)
total = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(out) for f in fs)
print(f'site images written, {total // 1024} KB')
