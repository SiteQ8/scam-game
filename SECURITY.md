# Security policy

## Report a vulnerability

Please report security issues privately by email to [site@hotmail.com](mailto:site@hotmail.com?subject=Security%20report), not in a public issue or pull request. Include:

* what you found and why it matters,
* the steps to reproduce it,
* the platform (iPhone, Android or the web) and the version shown under About in the settings, or the commit you tested.

You will get a reply by email. Please allow time for a fix before you disclose the issue, and say whether you would like to be credited.

## Scope

In scope:

* The app on iPhone and Android, and its [browser version](https://siteq8.github.io/scam-game/play/).
* The [website](https://siteq8.github.io/scam-game/), built from `site/` into `docs/`.
* The build: the scripts in `scripts/`, the workflows in `.github/workflows/`, and the dependencies that ship with the app and the site.

Please also report privately a fictional name, number or address on a card that turns out to belong to a real person or a live site, so the card can be changed.

Out of scope:

* The scams on the cards themselves. They are fictional training examples by design; content mistakes can go in a normal issue.
* Problems in GitHub Pages, the App Store or Google Play themselves. Report those to the provider.

## How the app handles data

* There is no server and no account. The app stores nothing off the device and sends nothing anywhere.
* Settings and progress stay on the device: in native preferences storage in the iPhone and Android apps, and in the browser's local storage in the web version. Erase my progress in the settings, or deleting the app, removes them.
* The message checker runs on the device. The text you paste is discarded when you leave the screen and is never saved or sent.
* The built app carries a Content Security Policy that allows only the files bundled with it (`default-src 'self'`, `connect-src 'self'`, `form-action 'none'`), so the app itself makes no requests to other servers. The apps ask for no access to contacts, location, camera, microphone, photos or notifications.
* The website sets no cookies and loads no scripts or fonts from other sites.

## Supported versions

Fixes go into the `main` branch and the next release of each app. Please test against the latest release or the current `main`.

<div dir="rtl" lang="ar">

## بالعربية

إن وجدت ثغرة أمنية في التطبيق أو الموقع أو أدوات البناء فأرسلها بسرية إلى [site@hotmail.com](mailto:site@hotmail.com) بدل أن تنشرها في بلاغ عام، واذكر الخطوات التي تُظهرها والمنصة ورقم الإصدار الظاهر في «عن اللعبة» ضمن الإعدادات.

لا يملك التطبيق خادماً ولا يطلب حساباً ولا يحفظ شيئاً خارج جهازك، فتبقى إعداداتك وتقدمك على الجهاز وحده، والرسالة التي تلصقها في أداة الفحص تُفحص على جهازك ولا تُحفظ ولا تُرسل إلى أي مكان.

</div>
