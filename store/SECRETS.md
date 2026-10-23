# Repository secrets for releases

Every GitHub release of this repository gets two files: `scam-game-<tag>.aab` for Android and `scam-game-<tag>.ipa` for iPhone, both signed for the stores. The same run uploads the bundle to the internal testing track on Google Play and the iPhone app to App Store Connect, where it appears in TestFlight. For that the workflows need the secrets below.

Add each one in the repository settings under **Secrets and variables**, **Actions**, **New repository secret** (https://github.com/SiteQ8/scam-game/settings/secrets/actions). The name has to match exactly, and the value is pasted as it is. Where a value is a file in base64, `base64 -i <file> | pbcopy` puts it on the clipboard on a Mac, and `base64 -w0 <file>` prints it on one line on Linux.

A missing secret never fails a release. The release is published first. Then each platform checks its secrets, skips what it cannot do and leaves a notice on the run's summary page naming the secrets it missed. Only a real problem turns a run red: a build, signing or upload that fails with its secrets in place, or a release tag that does not match the version in `package.json`.

## All secrets

| Secret | Platform | Needed for | What it holds |
|---|---|---|---|
| `ANDROID_KEYSTORE_BASE64` | Android | Signed release file | The upload keystore, base64 encoded |
| `ANDROID_KEYSTORE_PASSWORD` | Android | Signed release file | The password of the keystore |
| `ANDROID_KEY_ALIAS` | Android | Signed release file | The name of the upload key inside the keystore |
| `ANDROID_KEY_PASSWORD` | Android | Signed release file | The password of the upload key |
| `PLAY_SERVICE_ACCOUNT` | Android | Store upload | The JSON key of a Google Cloud service account that has access to the app in Play Console |
| `IOS_CERT_P12` | iPhone | Signed release file | The team's Apple Distribution certificate with its private key, as a .p12 file, base64 encoded |
| `IOS_CERT_PASSWORD` | iPhone | Signed release file | The password of that .p12 file |
| `IOS_PROFILE` | iPhone | Signed release file | The App Store Connect provisioning profile for `com.eworldq8.scamgame`, base64 encoded |
| `ASC_KEY_ID` | iPhone | Store upload | The key ID of an App Store Connect API key |
| `ASC_ISSUER_ID` | iPhone | Store upload | The issuer ID shown with that key |
| `ASC_KEY_P8` | iPhone | Store upload | The text of that key's .p8 file |

A store upload needs the signed file, so the upload secrets of a platform do nothing until its signing secrets are in place. `IOS_TEAM_ID`, which older notes list, is no longer read: the workflow takes the team from the provisioning profile.

## In this order

1. **Bundle id.** Make sure `brand.json` on main has `"appId": "com.eworldq8.scamgame"`, with `npm run brand` run after the change, before the release that should reach the stores. The workflows read the bundle id and package name from there. Google Play never lets an app's package name change, and an App Store Connect app keeps its bundle id for good, so everything below uses `com.eworldq8.scamgame`.
2. **Android signing.** Make the upload key and add its four secrets.
3. **Build once.** Run the release again (see **Running a release again** below), so it gets the signed .aab.
4. **First Play upload by hand.** Upload that .aab in Play Console once. Google accepts uploads through its API only for an app that already has a bundle, and this first upload also sets up Play App Signing with your upload key.
5. **Play upload.** Make the service account, give it access to the app and add `PLAY_SERVICE_ACCOUNT`.
6. **iPhone signing.** Export the team's Apple Distribution certificate, make the App Store Connect profile for `com.eworldq8.scamgame` with that certificate, and add their three secrets.
7. **App Store Connect upload.** Make or reuse an API key of the team and add its three secrets.
8. **Run the release again.** From then on, every release note merged into main publishes a release, attaches both files and sends them to both stores.

Android and iPhone do not depend on each other, so either one can go first.

## Android

### Upload key: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`

Google Play signs the app that reaches phones with its own app signing key (Play App Signing). Your key is the upload key: it signs each bundle sent to Play, and Play checks it on every upload. Make it once with keytool, which comes with Java and with Android Studio:

```bash
keytool -genkeypair -v -keystore scam-game-upload.jks -storetype PKCS12 \
  -alias scam-game-upload -keyalg RSA -keysize 4096 -validity 10000 \
  -dname "CN=Ali AlEnezi, C=KW"
```

keytool asks for a password twice: that is the keystore password. A PKCS12 keystore gives the key the same password, so keytool asks for no second one. The key is valid for 10000 days, about 27 years.

* `ANDROID_KEYSTORE_BASE64`: the keystore file in base64. On a Mac, `base64 -i scam-game-upload.jks | pbcopy` puts it on the clipboard. On Linux, `base64 -w0 scam-game-upload.jks` prints it on one line.
* `ANDROID_KEYSTORE_PASSWORD`: the password you gave keytool.
* `ANDROID_KEY_ALIAS`: `scam-game-upload`, the value after `-alias`. GitHub hides every secret value wherever it shows in the logs, so a plain word such as upload would vanish from every log line; an alias like this one keeps the logs readable.
* `ANDROID_KEY_PASSWORD`: the same password once more, since the key shares the keystore password. Only an older JKS keystore with a separate key password needs a different value here.

Needed for the signed release file: with these four secrets, every release carries `scam-game-<tag>.aab`, signed with the upload key.

Keep the .jks file and its password in a password manager and never in the repository (`.gitignore` already leaves out `*.jks` and `*.keystore`). If the upload key is ever lost, the account owner can ask for an upload key reset on the app signing page of Play Console, because the key that phones see stays with Google.

### First upload by hand

1. With the four signing secrets in place, run the release again and download its .aab, for example `scam-game-v1.1.0.aab`, from the release page.
2. In Play Console, open the app with the package name `com.eworldq8.scamgame`, then **Test and release**, **Testing**, **Internal testing**, and **Create new release**.
3. Keep Play App Signing with the key that Google generates. Play then registers the key of this first bundle as the upload key, so every later bundle must be signed with the same key.
4. Upload the .aab, save the release and roll it out to internal testing. Add your testers' email addresses on the **Testers** tab.

### `PLAY_SERVICE_ACCOUNT`

The workflow signs in to the Google Play Developer API as a Google Cloud service account.

1. In the Google Cloud console (https://console.cloud.google.com), pick a project or create one. No link between that project and Play Console is needed.
2. Open **APIs & Services**, **Library**, find **Google Play Android Developer API** and choose **Enable**.
3. Open **IAM & Admin**, **Service Accounts**, **Create service account**. Give it any name; it needs no role in Google Cloud.
4. Open the new account, then **Keys**, **Add key**, **Create new key**, **JSON**. The browser downloads a .json file.
5. In Play Console, open **Users and permissions** and choose **Invite new users**. Enter the service account's email address, which is the `client_email` value in the .json file and ends in `iam.gserviceaccount.com`.
6. On the **App permissions** tab choose **Add app**, pick the app, and tick **View app information (read-only)** and **Release apps to testing tracks**. Choose **Apply**, then **Invite user**. A service account needs no invitation email, though Play can take a while before the API sees the new access.

The secret is the whole content of the .json file, braces included. On a Mac, `pbcopy < key.json` copies it; on Linux, `cat key.json` prints it.

Needed for the store upload only: with this secret, each release also uploads its bundle to the internal testing track, with the release notes from `store/google-play/<language>/changelogs/default.txt`. While the app has never been sent for review, Play accepts only draft releases from the API, so the workflow saves the release as a draft and you roll it out in Play Console. Once Play no longer lists the app as a draft, the workflow's uploads go straight to the internal testers.

## iPhone

The Apple Distribution certificate and the App Store Connect API key belong to the Apple Developer team, so the ones that another app of the same team already uses work here too. The provisioning profile belongs to one bundle id, so this app needs its own.

### Certificate: `IOS_CERT_P12`, `IOS_CERT_PASSWORD`

1. On the Mac that holds the team's certificate, open Keychain Access, choose **My Certificates** and find **Apple Distribution: (name) (team ID)**. Its private key shows under it when you open the arrow; without the key the certificate cannot sign.
2. Select the certificate, choose **File**, **Export Items**, pick **Personal Information Exchange (.p12)**, save it and set a password. macOS may ask for your login password to allow the export.
3. `IOS_CERT_P12`: `base64 -i Certificates.p12 | pbcopy` copies the file in base64, with the name you saved it under.
4. `IOS_CERT_PASSWORD`: the password you set on export. GitHub stores no empty secret, so the export needs a password.

If no Mac has the private key any more, make a new certificate: in Keychain Access choose **Certificate Assistant**, **Request a Certificate From a Certificate Authority**, and save the request to disk. In Certificates, Identifiers & Profiles (https://developer.apple.com/account/resources/certificates/list) choose **+**, **Apple Distribution**, upload the request and download the certificate. Open it so it joins the keychain next to its key, then export it as above. Apple limits how many distribution certificates a team can hold, so reuse the existing one when you can. A certificate lasts a year.

Needed for the signed release file, together with the profile.

### Provisioning profile: `IOS_PROFILE`

1. In Certificates, Identifiers & Profiles, check that **Identifiers** lists the App ID `com.eworldq8.scamgame`. Creating the app in App Store Connect needed it, so it should be there; if it is not, add it with **+**, **App IDs**, **App** and the explicit bundle id `com.eworldq8.scamgame`.
2. Open **Profiles**, choose **+**, and under **Distribution** pick **App Store Connect**.
3. Choose the App ID `com.eworldq8.scamgame`, then the same Apple Distribution certificate that is in `IOS_CERT_P12`. A profile made for another certificate cannot sign with this one.
4. Name the profile, generate it and download the .mobileprovision file.
5. `IOS_PROFILE`: `base64 -i profile.mobileprovision | pbcopy`, with the name of the downloaded file.

Needed for the signed release file: with the certificate and the profile, every release carries `scam-game-<tag>.ipa`. The workflow checks that the profile is an App Store profile for the bundle id in `brand.json` and stops with a message if it is not. A profile lasts a year, and ends early when its certificate expires or is revoked; then make a new one the same way and replace the secret.

### App Store Connect API key: `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8`

1. In App Store Connect, open **Users and Access**, **Integrations**, **App Store Connect API**, **Team Keys**. The first time, the Account Holder has to request access there.
2. Generate a key, give it a name and choose the **App Manager** access.
3. `ASC_ISSUER_ID`: the Issuer ID shown above the list of keys.
4. `ASC_KEY_ID`: the Key ID in the key's row.
5. `ASC_KEY_P8`: choose **Download** in the key's row. Apple offers the `AuthKey_<key ID>.p8` file only once, so keep it safe. The secret is the text of the file as it is, not base64, including the BEGIN PRIVATE KEY and END PRIVATE KEY lines: on a Mac, `pbcopy < AuthKey_ABC123DEFG.p8` copies it, with your key ID in the name.

A team key that another app of the team already uses works as well. Needed for the store upload only: with these secrets, each release uploads its .ipa to the App Store Connect app with the bundle id `com.eworldq8.scamgame` (Apple ID 6826254487), which the workflow finds through the same key. After Apple has processed the build, usually within half an hour, it appears under **TestFlight** for the internal testers of the team. The app's Info.plist declares that it uses no non-exempt encryption, so TestFlight asks no export compliance question.

## Running a release again

After adding secrets, open the repository's **Actions** tab, choose the **release** workflow and **Run workflow**, enter the tag, for example `v1.1.0`, and start it. The run builds that release's tagged commit again, replaces the files attached to it and uploads to each store what the store does not have yet. A build number that a store already has is skipped with a notice.

## Version and build numbers

The version comes from `version` in `package.json`, and a release tag must match it (`v1.1.0` for `1.1.0`), or the build stops with a message. That version is the Android versionName and the iPhone version. The build number, which is the Android versionCode and the iPhone build, is major × 10000 + minor × 100 + patch: 1.1.0 builds 10100 and 1.2.0 builds 10200. Minor and patch stay between 0 and 99 so that the numbers always rise. Each store takes a build number only once, so to send a corrected build, raise the patch version and publish a new release.

## What each run does without secrets

* Without the Android signing secrets: no .aab is made, attached or uploaded, and a notice lists the missing ones.
* With them but without `PLAY_SERVICE_ACCOUNT`: the .aab is attached to the release, and a notice says the Play upload was skipped.
* The iPhone works the same way, with the certificate and profile secrets for the .ipa and the three API key secrets for the upload.
* The release itself is published either way, and the run stays green.

## Good to know

* Personal developer accounts on Google Play created after 13 November 2023 must run a closed test with at least 12 testers, opted in for 14 days in a row, before they can apply for production. Internal testing, where the workflow uploads, has no such rule.
* Pushing a tag such as `android-v1.1.0` or `ios-v1.1.0` still builds, signs and uploads one platform on its own, with the same secrets and the same build numbers.
