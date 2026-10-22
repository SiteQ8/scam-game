# Card content contract

Every card is one realistic message, call, page or poster that the player judges by swiping: **left = scam, right = legit**. After the swipe the game shows the card again with its signals highlighted and explained. Content is bilingual: each card carries a full Arabic block (`ar`) and a full English block (`en`) describing the same scenario.

Files live in `content/cards/*.json`. Each file is a JSON **array** of card objects. Several files per writer are fine (for example `sms-1.json`, `sms-2.json`). Validate with:

```
node scripts/validate-content.mjs
```

The validator must print `OK` with zero errors before a file is considered done.

## Card object

```json
{
  "id": "sms-parcel-fee-gcc",
  "channel": "sms",
  "verdict": "scam",
  "category": "delivery",
  "region": "gcc",
  "difficulty": 2,
  "tags": ["payment", "lookalike-domain", "urgency"],
  "ar": { "card": { }, "signals": [ ], "lesson": "" },
  "en": { "card": { }, "signals": [ ], "lesson": "" }
}
```

| Field | Values |
|---|---|
| `id` | unique, lowercase kebab-case, must start with the channel name and a hyphen (`sms-`, `chat-`, `email-`, `call-`, `web-`, `notification-`, `qr-`, `social-`, `market-`) |
| `channel` | `sms`, `notification`, `chat`, `email`, `call`, `web`, `qr`, `social`, `market` |
| `verdict` | `scam` or `legit` |
| `category` | `delivery`, `banking`, `accounts`, `government`, `telecom`, `utilities`, `shopping`, `marketplace`, `jobs`, `investment`, `romance`, `family`, `tech-support`, `prize`, `charity`, `travel`, `rental`, `education`, `subscriptions`, `business` |
| `region` | `gcc` (Kuwait and the Gulf: KWD and other Gulf currencies, Gulf context) or `global` (no country specific bodies, USD/EUR/GBP) |
| `difficulty` | integer 1 to 5 (1 obvious, 3 needs a careful look, 5 convincing even to careful people) |
| `tags` | optional, any of: `urgency`, `threat`, `payment`, `small-fee`, `lookalike-domain`, `shortened-link`, `otp`, `credentials`, `impersonation`, `unknown-number`, `new-number`, `voice-clone`, `too-good`, `gift-cards`, `crypto`, `remote-access`, `app-install`, `qr`, `attachment`, `off-platform`, `advance-fee`, `emotional`, `secrecy`, `official-channel`, `no-link`, `expected`, `verify-independently` |

## Language block (`ar` and `en`)

```json
{
  "context": "Optional scene setter shown above the card.",
  "card": { "...channel fields..." },
  "signals": [
    { "kind": "red", "mark": "exact text from the card", "why": "One sentence explaining this sign." }
  ],
  "lesson": "One sentence with the habit to keep."
}
```

* `signals`: 2 to 4 items.
  * `kind`: `red` (a warning sign), `green` (a sign of a genuine message), `trap` (looks reassuring but proves nothing, such as a padlock, a verified badge, a local number, a real sounding name, a correct logo).
  * A **scam** card has at least 2 `red` and no `green`. A **legit** card has at least 2 `green` and no `red`. `trap` is allowed on both.
  * `mark`: an **exact substring** of one of that language's card text fields (copy it character for character). It is what gets highlighted and what the player taps in Flag Hunt mode, so keep it short (a word to a short phrase, a domain, a sender name, an amount). Marks in one card must not repeat and must not contain one another.
  * `why`: explains that specific mark.
* `lesson`: what to do next time, practical and specific to the scenario.
* `context` (optional but expected on most legit cards and on any card whose verdict depends on what the player was doing): one short sentence that sets the scene, such as "You are paying for an online order of 18.500 KWD right now." or "You have not ordered anything this week." It is shown above the card. Keep it under 90 characters and never give the verdict away.

## Channel fields (`card`)

| Channel | Fields |
|---|---|
| `sms` | `sender` (sender ID or masked number), `time` (`HH:MM`), `body` |
| `notification` | `app` (generic app label such as `Bank`, `Messages`, `Wallet`, `Store`, `Mail`), `title`, `body`, `time` (`now`, `2m`, or `HH:MM`) |
| `chat` | `contact` (name or masked number), `saved` (true if the contact is saved in the phone), `messages`: 1 to 5 of `{ "from": "them" or "me", "text", "time" }`. A message can be a voice note: add `"voice": true` and `"duration": "0:12"`; its `text` is the exact transcript of what the voice says |
| `email` | `fromName`, `fromAddress`, `subject`, `body`, optional `button` `{ "label", "url" }`, optional `attachment` (file name) |
| `call` | `caller` (masked number, name, or `Unknown`), `saved` (boolean), `voice` `{ "gender": "male" or "female", "age": "young", "adult" or "older", "tone": "calm", "urgent", "friendly" or "official" }`, `lines`: 2 to 6 of `{ "who": "caller" or "you", "text" }`. The caller's lines together are 20 to 60 words. Arabic call lines are written in natural Kuwaiti/Gulf dialect as people really speak; English lines are natural spoken English |
| `web` | `url` (what the address bar shows, without `https://`), `secure` (boolean, padlock shown), `title` (page title), `heading`, `text`, `fields` (0 to 4 input labels shown on the page), `button` |
| `qr` | `place` (where the code is, such as a sticker on a parking meter), `title` (poster headline), `text` (poster small print), `opens` (the address the code opens) |
| `social` | `displayName`, `handle`, `verified` (boolean), `followers` (such as `2,140`), `kind` (`dm`, `post` or `comment`), `text` |
| `market` | `item` (listing title), `price`, `messages` (1 to 5, same shape as chat) |

## Writing rules (enforced by the validator where possible)

### Arabic
* Correct, natural Arabic written for its context, never a literal translation of the English. Read it as an Arabic speaker would.
* **Periods only at the end of a sentence.** `why` and `lesson` are each exactly one sentence ending with `.` and have no other period inside. Join clauses with connectives chosen by function: و (addition), ف (immediate sequence), ثمّ (sequence after a gap), أو (choice), لأنّ / لـ (cause), لذا / لذلك (result), أي (explanation), لكن / غير أن (qualification), بينما / في المقابل (contrast), بل (correction), علاوة على ذلك (addition), هكذا (conclusion).
* Inside card text (message bodies, pages, posters) do not put a period in the middle of the text either; use commas or a new line. Periods are allowed only inside amounts (0.350), currency abbreviations (د.ك، ر.س، د.إ، ر.ق، د.ب، ر.ع), web addresses and email addresses.
* No dashes of any kind: no em dash, no en dash, and no hyphen used as punctuation between words. Hyphens inside web addresses are fine.
* Terminology as Gulf regulators write it: الاحتيال، التصيد الاحتيالي، رمز التحقق، الرابط، البيانات المصرفية، البطاقة المصرفية، الرقم السري، تطبيق البنك الرسمي، الجهة الرسمية.
* Plain wording that reads without harakat.
* `why` and `lesson` in Arabic contain no Latin letters (write رمز التحقق, not OTP), except inside a quoted web or email address.

### English
* Natural, plain English. `why` and `lesson` are one or two short sentences.
* No em dash or en dash, and no hyphen used as a dash.

### Realism without harm
* **No real organisation, bank, app, platform or brand name anywhere**, in either language. Never any real bank, courier, telecom, store, wallet, social network or messaging app. Use generic labels: Bank, Delivery, Courier, Post, Customs, Traffic Department, Ministry, Telecom, Electricity and Water, Wallet, Store, Messages, chat app, social app.
* **Web addresses are fictional.** Scam addresses are realistic lookalikes made of generic words (`parcel-fee-kw.com`, `kw-fines-pay.net`, `secure-verify-account.info`, `gov-kw.services`), never containing a real brand. A scam may misuse "gov" in the wrong place (`kw.gov-pay.net`): that is a lesson in itself.
* **Legit cards avoid links** wherever real institutions would (banks and couriers increasingly send no links). If a legit card truly needs an address, it must be a government only domain ending in `.gov.kw` (gcc) or `.gov` (global) with a generic subdomain.
* **Phone numbers are never real.** Gulf numbers are always masked like `+965 6••• ••42` or `+966 5••• •••18`. Foreign scam numbers use reserved fiction ranges: UK `+44 7700 900xxx` (for example `+44 7700 900417`), US `+1 202 555 01xx` (for example `+1 202 555 0143`), or masked like `+62 8•• •••• 31`. Never write 8 or more consecutive unmasked digits except inside those reserved ranges, card endings like `•••• 4417`, or codes and reference numbers clearly labelled as such.
* People: common first names only (Sara, Ahmad, Noura, Fahad, Maryam, Yousef, John, Emma, Daniel). No real public figures.
* Amounts and details must be believable for the region.
* Balance: legit cards must be genuinely legit (expected, no request for secrets, official channel, nothing to click or a safe action), so players also learn what real messages look like and do not become paranoid.
