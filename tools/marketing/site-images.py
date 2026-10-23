#!/usr/bin/env python3
"""Turns the captured screens into the website's pictures.
usage: site-images.py <capture dir> <site img dir>
Phone screens become 880 px wide WebP (two pixels per CSS pixel); crops become 720 px wide (360 CSS px).
Writes manifest.json with each crop's CSS size so the page reserves the right space,
and where the case number sits on each screen that shows it, so the page can write in today's number."""
import json, os, sys
from PIL import Image

cap, out = sys.argv[1:3]
SCREENS = ['onboarding', 'home', 'card', 'drag', 'debrief', 'debrief2', 'chat', 'email', 'web', 'qr', 'social', 'market', 'call',
           'journey', 'hunt', 'party', 'checker', 'stats', 'settings', 'about', 'results', 'packs', 'badges', 'tips', 'family', 'certificate']
manifest = {}
for lang in ('en', 'ar'):
    os.makedirs(os.path.join(out, lang), exist_ok=True)
    manifest[lang] = {}
    for name in SCREENS + [f'{s}-live' for s in SCREENS]:
        src = os.path.join(cap, lang, f'{name}.png')
        if name.endswith('-live') and not os.path.exists(src): continue
        if not os.path.exists(src):
            print('missing', lang, name); continue
        im = Image.open(src).convert('RGB')
        im = im.resize((880, round(880 * im.height / im.width)), Image.LANCZOS)
        im.save(os.path.join(out, lang, f'{name}.webp'), 'WEBP', quality=80, method=6)
    for n in range(1, 9):
        src = os.path.join(cap, lang, f'crop-f{n}.png')
        if not os.path.exists(src):
            print('missing crop', lang, n); continue
        im = Image.open(src).convert('RGB')
        css_w, css_h = 360, round(im.height * 360 / im.width)
        im = im.resize((720, css_h * 2), Image.LANCZOS)
        im.save(os.path.join(out, lang, f'crop-f{n}.webp'), 'WEBP', quality=82, method=6)
        manifest[lang][f'f{n}'] = {'w': css_w, 'h': css_h}
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
    manifest[lang]['live'] = {}
    for name in SCREENS:
        live = os.path.join(cap, lang, f'{name}-live.json')
        if os.path.exists(live):
            manifest[lang]['live'][name] = json.load(open(live))
json.dump(manifest, open(os.path.join(out, 'manifest.json'), 'w'), indent=1)
total = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(out) for f in fs)
print(f'site images written, {total // 1024} KB')
