#!/usr/bin/env python3
"""Upload an Android App Bundle to a Google Play track with the Play Developer API.
usage: play-upload.py <bundle.aab> <track> <store-dir>
Needs PLAY_SERVICE_ACCOUNT (the service account JSON) in the environment. With VERSION_CODE set as well,
a version code that Play already has goes on the track again instead of being uploaded twice, so a release can run again.
Release notes come from <store-dir>/<lang>/changelogs/default.txt when present.
While the app has never been sent for review, Play only accepts draft releases, so the script falls back to a draft."""
import json, os, sys, glob
import requests
from google.oauth2 import service_account
from google.auth.exceptions import RefreshError
from google.auth.transport.requests import Request

aab, track, store = sys.argv[1:4]
brand = json.load(open('brand.json'))
package = brand['appId']
try:
    info = json.loads(os.environ['PLAY_SERVICE_ACCOUNT'])
    creds = service_account.Credentials.from_service_account_info(info, scopes=['https://www.googleapis.com/auth/androidpublisher'])
    creds.refresh(Request())
except (ValueError, KeyError, RefreshError) as e:
    sys.exit(f'PLAY_SERVICE_ACCOUNT does not sign in to Google ({e}). It must be the whole JSON key file of the service account, see store/SECRETS.md.')
H = {'Authorization': f'Bearer {creds.token}'}
API = f'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{package}'

def ok(r, what, hint=''):
    """Stop with Play's own message, and a hint when there is one, if a request failed."""
    if r.status_code >= 400:
        sys.exit(f'{what} failed with HTTP {r.status_code}: {r.text}' + (f'\n{hint}' if hint else ''))
    return r

access = (f'Check that Play Console has an app with the package name {package}, that its first bundle was uploaded there by hand, '
          f'and that {info.get("client_email", "the service account")} has access to the app under Users and permissions. '
          'Play can take a while to apply new permissions. See store/SECRETS.md.')
edit = ok(requests.post(f'{API}/edits', headers=H), 'Opening an edit', access).json()['id']
code = os.environ.get('VERSION_CODE', '')
known = ok(requests.get(f'{API}/edits/{edit}/bundles', headers=H), 'Listing the bundles', access).json().get('bundles', [])
if code and any(str(b.get('versionCode')) == code for b in known):
    print(f'Play already has version code {code}, so it goes on the {track} track without a new upload')
else:
    with open(aab, 'rb') as f:
        up = ok(requests.post(f'https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/{package}/edits/{edit}/bundles?uploadType=media', headers={**H, 'Content-Type': 'application/octet-stream'}, data=f), 'Uploading the bundle')
    code = str(up.json()['versionCode'])
notes = []
for path in glob.glob(os.path.join(store, '*', 'changelogs', 'default.txt')):
    lang = path.split(os.sep)[-3]
    notes.append({'language': lang, 'text': open(path, encoding='utf8').read().strip()[:500]})
def put(status):
    body = {'track': track, 'releases': [{'versionCodes': [code], 'status': status, 'releaseNotes': notes}]}
    return requests.put(f'{API}/edits/{edit}/tracks/{track}', headers=H, json=body)
r = put('completed')
# A draft app (one never sent for review) answers "Only releases with status draft may be created on draft app."
if r.status_code >= 400 and 'draft' in r.text.lower():
    print('Play takes only draft releases until the app is first sent for review, so this release is a draft: roll it out in Play Console')
    r = put('draft')
ok(r, f'Putting version code {code} on the {track} track')
c = requests.post(f'{API}/edits/{edit}:commit', headers=H)
# After a rejection, Play wants the changes sent for review by hand and refuses to commit without this flag.
if c.status_code >= 400 and 'changesNotSentForReview' in c.text:
    print('Play asks for these changes to be sent for review by hand in Play Console')
    c = requests.post(f'{API}/edits/{edit}:commit', headers=H, params={'changesNotSentForReview': 'true'})
ok(c, 'Committing the edit')
print(f'version code {code} is on the {track} track')
