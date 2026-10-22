#!/usr/bin/env python3
"""Upload an Android App Bundle to a Google Play track with the Play Developer API.
usage: play-upload.py <bundle.aab> <track> <store-dir>
Needs PLAY_SERVICE_ACCOUNT (the service account JSON) in the environment.
Release notes come from <store-dir>/<lang>/changelogs/default.txt when present.
While the app has never been sent for review, Play only accepts draft releases, so the script falls back to a draft."""
import json, os, sys, glob
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request

aab, track, store = sys.argv[1:4]
brand = json.load(open('brand.json'))
package = brand['appId']
creds = service_account.Credentials.from_service_account_info(json.loads(os.environ['PLAY_SERVICE_ACCOUNT']), scopes=['https://www.googleapis.com/auth/androidpublisher'])
creds.refresh(Request())
H = {'Authorization': f'Bearer {creds.token}'}
API = f'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{package}'
edit = requests.post(f'{API}/edits', headers=H).json()['id']
with open(aab, 'rb') as f:
    up = requests.post(f'https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/{package}/edits/{edit}/bundles?uploadType=media', headers={**H, 'Content-Type': 'application/octet-stream'}, data=f)
up.raise_for_status()
code = up.json()['versionCode']
notes = []
for path in glob.glob(os.path.join(store, '*', 'changelogs', 'default.txt')):
    lang = path.split(os.sep)[-3]
    notes.append({'language': lang, 'text': open(path, encoding='utf8').read().strip()[:500]})
def put(status):
    body = {'track': track, 'releases': [{'versionCodes': [str(code)], 'status': status, 'releaseNotes': notes}]}
    return requests.put(f'{API}/edits/{edit}/tracks/{track}', headers=H, json=body)
r = put('completed')
if r.status_code >= 400 and 'draft' in r.text.lower():
    r = put('draft')
r.raise_for_status()
c = requests.post(f'{API}/edits/{edit}:commit', headers=H)
c.raise_for_status()
print(f'uploaded version code {code} to {track}')
