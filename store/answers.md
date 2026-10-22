# Store questionnaires and declarations

The answer to pick for each question in App Store Connect and Play Console, with one line of reasoning. `siteq8.github.io/scam-game` is the site host, filled in later by the same script as the name tokens.

## Apple: App Privacy

* **Do you or your third-party partners collect data from this app?** No, we do not collect data from this app. Apple counts data as collected only when it leaves the device, and the app makes no network requests, so the product page shows "Data Not Collected".
* **Privacy Policy URL:** https://siteq8.github.io/scam-game/privacy/ (Arabic localization: https://siteq8.github.io/scam-game/ar/privacy/). Apple requires it even when nothing is collected.
* **Privacy Choices URL:** leave empty. There is nothing to opt out of.
* The bundled privacy manifest (`ios/App/App/PrivacyInfo.xcprivacy`) already agrees: no tracking, no collected data types, and the UserDefaults reason CA92.1 for progress kept on the device.

## Apple: Age rating

App Information, Age Ratings, Set Up Age Ratings. Frequency questions take None, Infrequent or Frequent; the others take Yes or No.

In-App Controls (select none)
* **Parental Controls:** No. The app has no parental control features.
* **Age Assurance:** No. The app never asks for or checks anyone's age.

Capabilities (select none)
* **Unrestricted Web Access:** No. There is no browser inside the app; the source code row in About opens Safari.
* **User-Generated Content:** No. Text pasted into the checker and player names in Play together stay on the phone and nobody else sees them.
* **Social Media:** No. There are no profiles, feeds or followers; the social posts in the cards are scripted examples.
* **Messaging and Chat:** No. The chat cards are scripted examples and nothing is sent to anyone.
* **Advertising:** No. There are no ads.

Mature Themes
* **Profanity or Crude Humor:** None.
* **Horror/Fear Themes:** None. A few scam calls threaten a fine or an arrest in words, which is the trick being taught; there are no frightening images or sounds.
* **Alcohol, Tobacco, or Drug Use or References:** None.

Medical or Wellness
* **Medical or Treatment Information:** None. One genuine card confirms a dental appointment and gives no medical information.
* **Health or Wellness Topics:** No.

Sexuality or Nudity
* **Mature or Suggestive Themes:** None. The one romance scam card is about a stranger asking for money, with nothing suggestive.
* **Sexual Content or Nudity:** None.
* **Graphic Sexual Content and Nudity:** None.

Violence
* **Cartoon or Fantasy Violence:** None.
* **Realistic Violence:** None. Two scam scripts mention a car accident in words, and nothing is shown.
* **Prolonged Graphic or Sadistic Realistic Violence:** None.
* **Guns or Other Weapons:** None.

Chance-Based Activities
* **Gambling:** No.
* **Simulated Gambling:** None.
* **Contests:** None. Fake prize draws appear inside cards as scams to spot; the game itself runs no contest and gives no prizes.
* **Loot Boxes:** No.

Age Categories and Override
* **Not Applicable.** Do not tick Made for Kids: the Kids category needs a parental gate before any link that leaves the app, and the feedback email and source code rows have none.
* **Age Suitability URL:** leave empty.

**Resulting rating: 4+.**

## Apple: Export compliance

* `ios/App/App/Info.plist` already declares **ITSAppUsesNonExemptEncryption** as **false** (NO), so App Store Connect does not ask the encryption questions for builds that carry it.
* If the question appears anyway, **Does your app use encryption?** No. The app opens no network connections and calls no encryption APIs; Mail and Safari handle the only links that leave the app.
* No documentation upload, CCATS or French encryption declaration is needed.

## Apple: Content rights

* **Does your app contain, show, or access third-party content?** Yes. The fonts (Alexandria and IBM Plex Sans Arabic, SIL Open Font License), the Lucide icons (ISC licence, and MIT for the icons Lucide takes from Feather) and the voices, music and sound effects generated with ElevenLabs come from third parties.
* **Do you have all necessary rights to that content?** Yes. The font and icon licences allow bundling, and the credits are in About and in THIRD_PARTY_NOTICES.md. Confirm that the ElevenLabs plan used for the audio allows publishing it in an app.

## Categories

App Store: one primary and one secondary category, and a game takes up to two game subcategories.
* **Primary: Games**, with the subcategories **Trivia** and **Casual**. Each card is a question with one right answer, played in short swipe sessions.
* **Secondary: Education.** Every card teaches a sign to look for, and Apple indexes the secondary category in search.
* Alternative: **Family** in place of Casual if party play should lead.

Google Play: one category only, plus up to five tags.
* **App or game: Game. Category: Trivia.** Same reasoning as on the App Store.
* **Tags:** up to five from the list Play Console offers, picking the ones about quizzes and learning. The accessibility tag **Hearing assistance** fits too, since every call and voice message has a written transcript.
* Alternative: **Educational** as the category if teaching should lead. On Play that category is mostly learning games for children, so expect a younger crowd.
* **Store settings contact details:** email site@hotmail.com, website https://siteq8.github.io/scam-game/. The phone number is optional and shown publicly, so leave it empty unless it should appear on the listing.

## Google Play: Data safety

* **Does your app collect or share any of the required user data types?** No. Google counts data as collected only when it leaves the device; the app makes no network requests, the checker works on the device, and progress stays on the device.
* Sharing a result opens the system share sheet only when the player taps Share, and it carries the score grid and nothing personal; Google exempts transfers that the user starts and expects.
* The INTERNET permission in the Android manifest (a Capacitor default) does not change these answers, because nothing is sent.
* The questions about encryption in transit and deletion requests appear only after Yes, so they are skipped. The listing will show "No data collected" and "No data shared with third parties".
* **Privacy policy URL:** https://siteq8.github.io/scam-game/privacy/

## Google Play: Content rating (IARC)

* **Email:** site@hotmail.com. **Category:** Game.
* **Violence of any kind:** No.
* **Fear, content that could frighten children:** No. The threats in a few scam scripts are words in a message or a call.
* **Sexuality or nudity:** No.
* **Language, profanity or crude humor:** No.
* **Controlled substances (drugs, alcohol, tobacco):** No.
* **Gambling, real or simulated, and paid random items:** No.
* **Discrimination, hate symbols or Nazi symbols:** No.
* **Users can interact or exchange content:** No. Play together passes one phone around; nothing goes from one device to another.
* **Shares the user's location with others:** No.
* **Purchases of digital goods:** No.
* **Web browser or search engine:** No.
* Expected result: the lowest rating in every system (for example ESRB Everyone and PEGI 3). IARC sets the final values and emails the certificate.

## Google Play: Target audience and content

The options are one or more age groups: 5 and under, 6 to 8, 9 to 12, 13 to 15, 16 to 17, and 18 and over. Any group under 13 brings the app under the Families policy.

**Recommendation: 13 to 15, 16 to 17, and 18 and over.** The cards are built around bank codes, parcel fees, job and investment offers and romance scams, which teenagers and adults meet every day. Families and classrooms can still play together, because the target audience does not stop anyone from installing. If Play asks whether the store listing could unintentionally appeal to children, answer **No**: the art is a dark desk with paper cards, a highlighter and a stamp, with no cartoon characters.

What adding 9 to 12 (or younger) would require, and where the app stands today:
* **Content suitable for children:** mostly met. There is no violence, gambling, drugs or sexual content. The judgement call is the romance scam card and the calls that threaten arrest, since the Families policy rules out dating and sexual advice in content for children.
* **Accurate Play Console answers:** met.
* **Data practices** (disclose what is collected from children, no advertising ID, no device identifiers, no location, no phone number): met, because nothing is collected or sent.
* **Only SDKs approved for children:** met. The app uses only Capacitor's own plugins (App, Haptics, Preferences, Share, Splash Screen, Status Bar).
* **Ads only from Families Self-Certified Ads SDKs, and a neutral age screen:** not needed, since there are no ads.
* **Adult approval for social features:** not needed, since there are none.
* **Not merely a webview of a website:** met. The game is bundled inside the app.
* **Privacy policy:** met. It already has a Children section.
* **COPPA, GDPR and similar laws:** met, since nothing is collected.
* **Cost:** review can take longer (Google mentions up to 7 days or more), the listing and screenshots must suit children, and any future SDK, analytics or ads would have to meet the Families rules.
* **Benefit:** an app for several age groups that include children can be considered for Teacher Approved.

So the technical side already meets the Families policy; only the content question above needs a decision before adding 9 to 12.

## Google Play: Ads

* **Does your app contain ads?** No, my app does not contain ads.

## App access

* **Google Play:** All functionality in my app is available without any access restrictions. There is no login.
* **App Store:** leave **Sign-in required** unticked. Paste `app-store/review-notes.txt` into Notes, with Ali AlEnezi, site@hotmail.com and +96551153554 as the review contact.

## Other declarations on the Play Console App content page

* **Advertising ID:** No. The merged Android manifest declares only INTERNET, VIBRATE and an internal AndroidX permission, with no AD_ID.
* **Government apps:** No.
* **Financial features:** My app doesn't provide any financial features.
* **Health apps:** My app does not have any health features.
* **News apps:** No.

## Default language of each listing

* **App Store:** primary language **English (U.S.)**, with **Arabic** added as a localization (the `ar-SA` folder). The primary language is the fallback for every storefront and device language without its own listing, which suits a worldwide audience, while devices set to Arabic get the full Arabic listing.
* **Google Play:** default language **English (United States), en-US**, with **Arabic, ar** added as a translation. Play shows the Arabic listing to people whose device language is Arabic and the English one everywhere else.
