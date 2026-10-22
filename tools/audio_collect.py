#!/usr/bin/env python3
"""Download every finished take listed in ElevenLabs run-status files.
usage: audio_collect.py sessions.txt outdir status1.json [status2.json ...]
sessions.txt has lines name=session1,session2; takes are saved as <outdir>/<name>.t<k>.mp3.
Prints failed or missing takes with the reason."""
import json, os, sys, urllib.request
sessions_file, outdir, *status_files = sys.argv[1:]
os.makedirs(outdir, exist_ok=True)
by_session, failed_prompts = {}, []
for f in status_files:
    d = json.load(open(f))
    for g in d.get('generations', []):
        url = g.get('content_url') or ''
        if g.get('status') == 'completed' and 'content_generation/' in url:
            by_session[url.split('content_generation/')[1].split('/')[0]] = (url, g.get('duration_secs'))
        elif g.get('status') == 'failed':
            failed_prompts.append(((g.get('prompt') or '')[:50], g.get('error_message')))
got = miss = 0
for line in open(sessions_file):
    line = line.strip()
    if not line or '=' not in line: continue
    name, sess = line.split('=')
    for k, s in enumerate(sess.split(',')):
        path = os.path.join(outdir, f'{name}.t{k}.mp3')
        if s not in by_session:
            miss += 1; print('missing', name, k); continue
        if not os.path.exists(path):
            urllib.request.urlretrieve(by_session[s][0], path)
        got += 1
print(f'downloaded {got}, missing {miss}')
for p, e in failed_prompts: print('failed:', p, '|', e)
