# Store listing notes

Listing copy for the App Store and Google Play in English and Arabic, one field per file, with the App Review notes and the questionnaire answers. The screenshots, feature graphic and trailer in `screenshots/`, `graphics/` and `trailer/` were made separately and are not covered here.

## Files

* `app-store/en-US/` and `app-store/ar-SA/`: `name`, `subtitle`, `promotional_text`, `description`, `keywords`, `release_notes`, `support_url`, `marketing_url` and `privacy_url`, each a `.txt` file.
* `google-play/en-US/` and `google-play/ar/`: `title`, `short_description`, `full_description` and `changelogs/default.txt`.
* `app-store/review-notes.txt`: for App Review Information, Notes, in App Store Connect.
* `answers.md`: every questionnaire in App Store Connect and Play Console, with the answer to pick and why.
* `SECRETS.md`: the repository secrets that sign the files attached to each GitHub release and upload them to Google Play internal testing and TestFlight, how to make each one, and in which order.

## Name and address

The game is **Scam Detective** in English and **محقق الاحتيال** in Arabic. Its pages are at `siteq8.github.io/scam-game` until a subdomain on 3li.info is chosen. `npm run brand` writes both from `brand.json` into these files, the apps and the documents; `npm test` then checks every limit below.

## Measured lengths

Measured by a script in Unicode characters.

| Field | Limit | English | Arabic |
|---|---|---|---|
| App Store name | 30 | 14 | 13 |
| App Store subtitle | 30 | 19 | 19 |
| App Store promotional text | 170 | 134 | 141 |
| App Store description | 4000 | 3229 | 3099 |
| App Store keywords | 100 | 97 | 96 |
| App Store release notes | 4000 | 188 | 200 |
| Google Play title | 30 | 14 | 13 |
| Google Play short description | 80 | 79 | 72 |
| Google Play full description | 4000 | 3169 | 3002 |
| Google Play release notes | 500 | 289 | 200 |
| App Review notes (Apple counts bytes) | 4000 bytes | 2883 bytes | |

The same script also checked: no dash characters (U+2012 to U+2015, U+2212) and no hyphen used as a dash; an Arabic period only at the end of a sentence (each Arabic sentence sits on its own line); Arabic punctuation; none of يتم, تتم, قام بـ, بشكل or فقط; no exclamation marks, hype words, emoji or requests for ratings; no other store's or platform's name in either listing; no price word in the Play short description; keywords with no space after a comma, no term under three characters, and no word from the subtitle or a category name.

## Decisions for the author

1. **Address.** Choose the subdomain on 3li.info, set `domain` in `brand.json`, then run `npm run brand` and `npm run build:site`. Keywords no longer repeat any word of the name or subtitle, and a test keeps it that way.
2. **Categories.** Recommended: App Store Games with the subcategories Trivia and Casual, and Education as the secondary category; Google Play Game, Trivia. `answers.md` gives the alternatives.
3. **Play target audience.** Recommended: 13 and over. Adding 9 to 12 is possible because the app already meets the technical Families rules, but the romance card and the calls that threaten arrest need a content decision first (see `answers.md`).
4. **ElevenLabs rights.** Confirm that the plan used for the voices, music and sound effects allows publishing them in an app; the content rights answer assumes it does.
5. **INTERNET permission.** The Android manifest still declares `android.permission.INTERNET` (a Capacitor default), so Play lists network access among the app's permissions although the app never connects. The Data safety answers are the same either way; removing it would make the two agree, after testing that the bundled game still loads without it.
6. **Copyright and EU trader status.** App Store Connect asks for a copyright line (suggested: 2026 Ali AlEnezi) and, for EU storefronts, a Digital Services Act trader declaration; a trader's address, phone and email are shown on the EU product page.

## Good to know

* App Store Connect hides What's New for an app's first version, so `app-store/*/release_notes.txt` is not entered at launch; keep it for the first update. Google Play does take release notes for the first release.
* App Store Connect has accepted 100 characters of keywords in every language since 2013, but Apple's help page still says 100 bytes. The Arabic keywords are 96 characters and 176 bytes; if they are ever refused, drop terms from the end.
* Google advises against price words such as "free" in the short description, so the Play text never says it; the App Store description does.
* Both descriptions state 112 cards (66 scams, 46 genuine). Update them in both stores and both languages if the deck changes.
