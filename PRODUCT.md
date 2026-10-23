# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

The game ships as one Preact web app wrapped by Capacitor for iPhone and Android, and the same build runs in the browser at `/play/` on the website. The website itself is `web`.

## Users

People in the Gulf and worldwide who receive scam texts, calls, emails and QR codes on their phones: parents and grandparents, teenagers, and anyone who has been asked "is this message real?". Families and classrooms play together on one phone. (Inferred from the brief: "a Kuwaiti game, then global for wider reach".)

## Product Purpose

A swipe game that trains the eye to spot scams. Each card is a realistic message on a phone; the player swipes left for scam and right for legit, then a debrief marks the exact words that gave it away. Success is a player who notices the signs in a real message without the game.

## Positioning

Real looking cards in nine channels (text, notification, chat, email, call, web page, QR code, social, marketplace) with voiced calls, a debrief that marks and numbers every sign and every trap, a daily case shared by everyone, and an offline message checker. Bilingual Arabic and English, with Gulf and global examples. Free, no ads, no account, never connects to the internet, open source.

## Operating Context

Played in short sessions: the daily case of ten cards, a journey of eight chapters, a 60 second rush, a flag hunt, party mode on one phone, and a checker for messages the player actually received. Families compare the spoiler free strand of pearls they share.

## Capabilities and Constraints

- Every name, number and link on the cards is fictional; links lead nowhere and QR codes only state that they are a training example. No real brands. Legit cards use only official government domains or example.com.
- Arabic is natural Arabic, never a literal translation; a period ends a sentence and never sits in the middle of one. No dashes in any language.
- The app never makes a network request (CSP enforced). Progress is stored on the device only.
- The name is Scam Detective, محقق الاحتيال in Arabic. The domain is the author's to choose and is not yet supplied. `brand.json` holds them.

## Brand Commitments

- Made by Ali AlEnezi, Kuwait. Contact site@hotmail.com.
- Voices, music and sound effects generated with ElevenLabs; never Mishary Alafasy's voice.
- No real bank, or any real brand, named in any example.
- Identity: the pearl merchant's world (الطوّاش). The night sea, the merchant's red cloth, the nacre of a pearl and brass. Each case is a strand of ten pearls: a right call adds a lustrous pearl, a wrong one a dull bead, and the finished strand is what players share. Aref Ruqaa for display, Readex Pro for text.

## Evidence on Hand

- The playable game (`dist/`, published at `/play/`), its real screens captured by `tools/marketing/capture.mjs`.
- The real checker engine (`app/src/engine/checker.ts`) and real cards (`content/cards/`).
- No users, reviews, ratings, press or download numbers exist. None may be invented.

## Product Principles

1. Show the real thing: the game's own screens and engine are the proof.
2. Teach the sign, not the fear: every verdict explains what to notice next time.
3. Nothing leaves the phone.
4. Arabic first class, never a translation of the English.
