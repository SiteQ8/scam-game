# Contributing

Thank you for helping people spot scams. The most useful contribution is a new card: a real trick, retold with fictional details, that teaches something the game does not teach yet. Fixes to cards, wording, code and the website are welcome too.

## Suggest a card by email

Send the message that fooled you or someone you know to [site@hotmail.com](mailto:site@hotmail.com?subject=A%20message%20that%20fooled%20someone). Before you send it:

* Remove real names, phone numbers, links, account and card numbers, codes, and anything else that identifies a person.
* Do not forward a live scam link. Describe it instead, for example "an address that looks like the courier's site with an extra word".
* Say which channel it came through (text, app notification, chat, email, call, web page, QR code, social post or marketplace chat), in which country, and what made it convincing.
* A screenshot helps once every personal detail is covered.

If it teaches something new, it may become a card. You do not need to write the card yourself.

## Suggest a card by pull request

1. [Fork the repository](https://github.com/SiteQ8/scam-game/fork) and create a branch.
2. Add the card to a file in `content/cards/`. Each file holds a JSON array; add to a file of the same channel or start a new one, such as `sms-3.json`.
3. Run the checks below until they all pass.
4. Open a pull request that says what the card teaches and where the trick is seen.

### The card format in short

[content/SCHEMA.md](content/SCHEMA.md) is the full contract, with every field of every channel. In short:

* `id`: unique, lowercase kebab-case, starting with the channel, such as `sms-` or `call-`.
* `channel`: `sms`, `notification`, `chat`, `email`, `call`, `web`, `qr`, `social` or `market`.
* `verdict`: `scam` or `legit`.
* `category`, `region` (`gcc` or `global`), `difficulty` (from 1, obvious, to 5, convincing even to careful people) and optional `tags`, from the lists in the schema.
* `ar` and `en`: one block per language, each with an optional `context` line, the `card` fields of its channel, two to four `signals` and a `lesson`.
* Each signal has a `kind` (`red` for a warning sign, `green` for a sign of a genuine message, `trap` for a detail that looks reassuring but proves nothing), a `mark` copied exactly from that language's card text, and a `why` that explains the mark.

A genuine card from the game:

```json
{
  "id": "sms-bank-otp-own-purchase",
  "channel": "sms",
  "verdict": "legit",
  "category": "banking",
  "region": "gcc",
  "difficulty": 2,
  "tags": ["otp", "expected", "no-link", "official-channel"],
  "ar": {
    "context": "أنت تدفع الآن ثمن طلب بقيمة 18.500 د.ك من متجر إلكتروني.",
    "card": {
      "sender": "Bank",
      "time": "21:03",
      "body": "رمز التحقق لعملية الشراء بقيمة 18.500 د.ك هو 482915، لا تشارك هذا الرمز مع أي شخص حتى موظفي البنك"
    },
    "signals": [
      { "kind": "green", "mark": "18.500 د.ك", "why": "المبلغ يطابق عملية الشراء التي بدأتها بنفسك قبل لحظات، أي أن الرسالة متوقعة ولها سبب واضح." },
      { "kind": "green", "mark": "لا تشارك هذا الرمز مع أي شخص", "why": "التحذير من مشاركة الرمز سمة الرسائل الحقيقية، لأن البنك لا يحتاج إلى أن تعطيه الرمز أبداً." },
      { "kind": "trap", "mark": "Bank", "why": "اسم المرسل وحده ليس دليلاً لأن المحتالين يستطيعون انتحال أسماء المرسلين، لذا اعتمد على أن العملية بدأتها أنت." }
    ],
    "lesson": "لا تُدخل رمز التحقق إلا في الصفحة التي بدأت منها العملية بنفسك، ولا تقرأه لأي شخص يتصل بك مهما كانت صفته."
  },
  "en": {
    "context": "You are paying for an online order of 18.500 KWD right now.",
    "card": {
      "sender": "Bank",
      "time": "21:03",
      "body": "Your verification code for the 18.500 KWD purchase is 482915. Do not share this code with anyone, including bank staff."
    },
    "signals": [
      { "kind": "green", "mark": "18.500 KWD", "why": "The amount matches the purchase you started a moment ago, so the message is expected." },
      { "kind": "green", "mark": "Do not share this code with anyone", "why": "Real banks warn you never to share the code, because they never need it from you." },
      { "kind": "trap", "mark": "Bank", "why": "A sender name alone proves nothing, since scammers can spoof sender names. What makes this safe is that you started the payment." }
    ],
    "lesson": "Only type a code into the page where you started the action yourself, and never read it out to anyone who calls you."
  }
}
```

## Rules every card must pass

The validator enforces most of these, and review covers the rest.

### Both languages

* Every card has a complete Arabic block and a complete English block for the same scenario. The Arabic is written for Arabic readers, never translated line by line from the English.
* Each `mark` is an exact substring of that language's card text. Marks in one card do not repeat and do not contain one another.
* No dashes of any kind in either language: no em dash, no en dash, and no hyphen used as a dash. Use commas, colons or full stops. Hyphens inside words and web addresses are fine.

### Signals and balance

* A scam card has at least two `red` signals and no `green`. A legit card has at least two `green` signals and no `red`. A `trap` is allowed on both.
* Legit cards are genuinely legit: expected, no request for secrets, an official channel, and nothing to tap or only a safe action. Players should learn what real messages look like, not learn to distrust everything.
* A `context` line, when present, sets the scene in under 90 characters and never gives the verdict away.

### Fictional details

* People: common first names only, such as Sara, Ahmad, Noura, Fahad, John or Emma. No real public figures.
* Phone numbers: Gulf numbers are always masked, like `+965 6••• ••42`. Foreign numbers use the reserved fiction ranges `+44 7700 900xxx` and `+1 202 555 01xx`, or are masked.
* Addresses: scam addresses are realistic look-alikes built from generic words, such as `parcel-fee-kw.com`. Legit cards avoid links; when one is truly needed, it is a government domain ending in `.gov.kw` or `.gov` with a generic subdomain, or `example.com`.
* Before you use an invented address, check that it is not a real, registered site.
* Amounts and details are believable for the region.

### No real brands

* No real organisation, bank, app, platform or brand name anywhere, in either language. Use generic labels instead: Bank, Courier, Post, Customs, Traffic Department, Ministry, Telecom, Electricity and Water, Wallet, Store, Messages, chat app, social app.

### Arabic

* A period ends a sentence and never sits in the middle of one. `why` and `lesson` are each one sentence ending with a period. Inside card text, use a comma or a new line instead of a period; periods appear only in amounts such as `0.350`, in currency abbreviations such as `د.ك`, and in web and email addresses.
* Join clauses with the connective that fits the meaning: `و` to add, `ف` for what follows at once, `ثمّ` for what follows after a gap, `أو` for a choice, `لأنّ` or `لـ` for a cause, `لذا` or `لذلك` for a result, `أي` to explain, `لكن` or `غير أن` to qualify, `بينما` or `في المقابل` to contrast, `بل` to correct, `بالإضافة إلى` or `علاوة على ذلك` to add a point, `هكذا` to conclude, `ختاماً` to close.
* Write natural Modern Standard Arabic, verb first where that is natural, readable without harakat. Avoid calques: no `يتم`, no `قام بـ`, no `بشكل` followed by an adjective, and instead of "do X `فقط`" write `لا ... إلا`. After a negation, join the next negated item with `ولا`, as in `لا حساب ولا إعلانات`.
* Arabic call lines are written in natural Kuwaiti or Gulf dialect, as people really speak, and chats may be too. Explanations and lessons stay in Modern Standard Arabic.
* Use the terms Gulf regulators use: الاحتيال، التصيد الاحتيالي، رمز التحقق، الرابط، البيانات المصرفية، البطاقة المصرفية، الرقم السري، تطبيق البنك الرسمي، الجهة الرسمية.
* `why` and `lesson` contain no Latin letters (write رمز التحقق, not OTP), except inside a quoted web or email address.
* When you name the Gulf in full, write «الخليج العربي» in Arabic and "Arabian Gulf" in English.

### English

* Plain, natural English. `why` and `lesson` are one or two short sentences.

### Calls and voice notes

* A call has two to six lines, and the caller's lines come to 20 to 60 words. The voice's gender, age and tone come from the values in the schema.
* The maintainer records the voices, so a pull request does not need audio. Until a recording exists, the game shows the call or voice note as a transcript.

## Run the checks

```bash
npm ci
npm run content
npm test
npm run check
npm run build:site
```

* `npm run content` validates every card, prints a summary ending in `OK`, and rebuilds `app/src/content/cards.json`. Commit that file with your card.
* `npm test` runs the Vitest suites: the checker engine, the content, the daily case, and the language rules for interface strings and website copy. The checker runs on every card, so each new scam must raise at least a warning and no new genuine card may look like a strong scam. If a new scam slips past it, extend the rules in `app/src/engine/checker.ts` or explain in the pull request why the card should stay as it is.
* `npm run check` type checks the code with TypeScript.
* `npm run build:site` rebuilds `docs/`, which holds the website and the browser game. CI fails when `docs/` does not match the build, so commit it when your change affects the game or the site.
* To check a folder of draft cards without adding them to the game, run `node scripts/validate-content.mjs path/to/folder`.

## Commits and pull requests

* Keep each pull request to one topic: one card or a few on the same trick, one fix, or one code change.
* Write commit messages in plain English, in the imperative, saying what changed, such as "Add a card about a fake customs fee".
* In the pull request, say what the card teaches and where the trick is seen (country and channel), without personal data.
* Include the files the build regenerates: `app/src/content/cards.json` and, when affected, `docs/`.
* Never put real personal data, real phone numbers or live scam links in commits, issues or pull requests, screenshots included.
* For code, follow the existing style: TypeScript in strict mode and Preact function components. Keep every interface string in both languages in `app/src/i18n/strings.ts`, and never add network requests, analytics or tracking: the app must work with no connection at all.
* All CI checks must pass before review.
* By contributing, you agree that your work is released under the [MIT License](LICENSE).

<div dir="rtl" lang="ar">

## ملخص بالعربية

أسهل طريقة للمساهمة أن ترسل الرسالة التي خدعتك أو خدعت شخصاً تعرفه إلى [site@hotmail.com](mailto:site@hotmail.com) بعد أن تحذف منها الأسماء والأرقام والروابط وكل ما يدل على صاحبها، مع ذكر القناة التي وصلت عبرها والبلد وما جعلها مقنعة.

وإن أردت أن تكتب البطاقة بنفسك فأضفها إلى ملف في المجلد `content/cards` وفق المواصفات في [content/SCHEMA.md](content/SCHEMA.md)، ثمّ افتح طلب دمج يشرح ما تعلّمه البطاقة وأين تنتشر حيلتها.

يجب أن تكتمل البطاقة بالعربية والإنجليزية، وأن تكون أسماؤها وأرقامها وروابطها وهمية، وألا تذكر أي جهة أو علامة تجارية حقيقية، وأن يُكتب نصها العربي بلغة طبيعية لا تترجم الإنجليزية حرفياً.

وفي العربية لا توضع النقطة إلا في نهاية الجملة، وتُربط الجمل بأداة الربط التي تناسب معناها، ولا تُستخدم الشرطات في أي من اللغتين، ويُكتب اسم الخليج كاملاً «الخليج العربي».

قبل أن تفتح طلب الدمج شغّل `npm run content` و `npm test` و `npm run check` و `npm run build:site`، ثمّ أضف الملفات التي يعيد البناء توليدها، لأنّ التكامل المستمر يرفض أي تغيير لا يجتاز هذه الفحوص.

وبمساهمتك توافق على نشر عملك برخصة MIT.

</div>
