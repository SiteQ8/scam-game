#!/usr/bin/env python3
"""Download ElevenLabs generations listed in a run-status JSON file.
usage: audio_fetch.py status.json outdir name=session1,session2 [name=...]
Each file is saved as <name>-<i>.mp3 in the order of the sessions given."""
import json, sys, os, urllib.request
status, outdir, *pairs = sys.argv[1:]
d = json.load(open(status))
os.makedirs(outdir, exist_ok=True)
by_session = {}
for g in d.get('generations', []):
    url = g.get('content_url') or ''
    for part in url.split('/'):
        if part in by_session or len(part) != 20:
            continue
    # the session id is the path segment after content_generation
    if 'content_generation/' in url:
        sess = url.split('content_generation/')[1].split('/')[0]
        by_session.setdefault(sess, []).append((g['id'], url, g.get('status')))
for pair in pairs:
    name, sessions = pair.split('=')
    for i, s in enumerate(sessions.split(',')):
        items = by_session.get(s, [])
        if not items:
            print('missing', name, s); continue
        gid, url, st = items[0]
        path = os.path.join(outdir, f'{name}-{i}.mp3')
        urllib.request.urlretrieve(url, path)
        print('saved', path, os.path.getsize(path))
