---
name: Scam Detective
description: "The pearl merchant's cloth: every case is a strand of ten pearls strung on red cloth over a night sea."
colors:
  # The world's materials, the same by night and by day
  pearl: "#f5efe4"
  on-pearl: "#3a0d16"
  on-nacre: "#3a2c18"
  cloth: "#7c1424"
  cloth-lit: "#94202f"
  cloth-deep: "#5c0e1a"
  on-cloth: "#fbeee9"
  on-cloth-2: "#f2cdc6"
  brass-on-cloth: "#f0d394"
  # Night sea, the default theme
  night-sea: "#0d1d22"
  night-sea-2: "#12272d"
  night-sea-3: "#1a343b"
  night-sea-4: "#23424a"
  night-text: "#f3ede2"
  night-text-2: "#b8c4c2"
  night-text-3: "#8fa0a2"
  night-brass: "#c9a45c"
  night-brass-text: "#e2c27f"
  night-line: "rgba(201, 164, 92, 0.16)"
  night-line-2: "rgba(201, 164, 92, 0.3)"
  night-seat: "rgba(226, 194, 127, 0.62)"
  night-thread: "rgba(201, 164, 92, 0.5)"
  night-scam-text: "#ff8a80"
  night-legit-text: "#6fd8ad"
  # Pearl day, the daylight theme
  day-mist: "#e7edec"
  day-mist-2: "#f6f8f7"
  day-mist-3: "#dce5e4"
  day-mist-4: "#cfdbd9"
  day-ink: "#10252b"
  day-ink-2: "#3d5358"
  day-ink-3: "#51666a"
  day-brass: "#a8843f"
  day-brass-text: "#7a5a1f"
  day-line: "rgba(16, 37, 43, 0.12)"
  day-line-2: "rgba(16, 37, 43, 0.22)"
  day-seat: "rgba(122, 90, 31, 0.55)"
  day-thread: "rgba(122, 90, 31, 0.42)"
  day-scam-text: "#b3322b"
  day-legit-text: "#10704c"
  day-paper: "#ffffff"
  # Verdicts: meaning only
  scam: "#e5584f"
  legit: "#3dbb8c"
  on-scam: "#2a0806"
  on-legit: "#03251a"
  scam-ink: "#c73a32"
  legit-ink: "#16815a"
  trap-ink: "#8e6a28"
  mark-scam: "rgba(229, 88, 79, 0.28)"
  mark-legit: "rgba(61, 187, 140, 0.27)"
  mark-trap: "rgba(201, 164, 92, 0.34)"
  # The phone's own inks, for message cards
  paper: "#fbfaf7"
  paper-2: "#f0eee9"
  paper-3: "#e4e1da"
  phone-ink: "#141820"
  phone-ink-2: "#545d6b"
  phone-ink-3: "#737b88"
  phone-link: "#1f5fd1"
  bubble: "#e9e7e1"
  bubble-me: "#2b6be6"
  # The website's own tokens; its sea, mist, cloth and brass fields reuse the values above
  site-on-sea: "#f1f0ed"
  site-paper: "#fffdf8"
  on-brass: "#231807"
  on-brass-2: "#4a3812"
typography:
  display:
    fontFamily: "'Aref Ruqaa', 'Readex Pro', ui-serif, Georgia, serif"
    fontSize: "clamp(2.3rem, 10.6vw, 2.85rem)"
    fontWeight: 700
    lineHeight: 1.15
  display-number:
    fontFamily: "'Aref Ruqaa', 'Readex Pro', ui-serif, Georgia, serif"
    fontSize: "clamp(4rem, 22vw, 5.6rem)"
    fontWeight: 700
    lineHeight: 1.1
    fontFeature: "tnum"
  headline:
    fontFamily: "'Aref Ruqaa', 'Readex Pro', ui-serif, Georgia, serif"
    fontSize: "1.6rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "'Aref Ruqaa', 'Readex Pro', ui-serif, Georgia, serif"
    fontSize: "1.32rem"
    fontWeight: 700
    lineHeight: 1.25
  section:
    fontFamily: "'Aref Ruqaa', 'Readex Pro', ui-serif, Georgia, serif"
    fontSize: "1.22rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "'Readex Pro', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  body-strong:
    fontFamily: "'Readex Pro', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 600
    lineHeight: 1.35
  secondary:
    fontFamily: "'Readex Pro', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.86rem"
    fontWeight: 400
    lineHeight: 1.4
  button:
    fontFamily: "'Readex Pro', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 600
    lineHeight: 1.3
  verdict:
    fontFamily: "'Readex Pro', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 700
  label:
    fontFamily: "'Readex Pro', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.84rem"
    fontWeight: 600
  device:
    fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, 'Segoe UI', Roboto, 'Noto Sans Arabic', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.98rem"
    fontWeight: 400
    lineHeight: 1.45
  site-heading:
    fontFamily: "'Aref Ruqaa', 'Readex Pro', ui-serif, Georgia, serif"
    fontSize: "clamp(40px, 5.4vw, 88px)"
    fontWeight: 700
    lineHeight: 1.15
  site-lead:
    fontFamily: "'Readex Pro', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(20px, 1.8vw, 26px)"
    fontWeight: 400
    lineHeight: 1.5
  site-body:
    fontFamily: "'Readex Pro', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.55
  site-small:
    fontFamily: "'Readex Pro', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  site-button:
    fontFamily: "'Readex Pro', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  sm: "10px"
  md: "14px"
  lg: "16px"
  bubble: "18px"
  sheet: "20px"
  pill: "999px"
spacing:
  gap: "10px"
  verdict-gap: "12px"
  tile: "14px"
  gutter: "16px"
  sheet: "20px"
  section: "28px"
  gutter-wide: "28px"
  site-gutter: "clamp(16px, 2.2vw, 32px)"
  site-column-gap: "24px"
  site-section: "clamp(80px, 9vw, 140px)"
components:
  button-primary:
    backgroundColor: "{colors.pearl}"
    textColor: "{colors.on-pearl}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 22px"
    height: "52px"
  button-primary-day:
    backgroundColor: "{colors.day-ink}"
    textColor: "{colors.pearl}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 22px"
    height: "52px"
  button-secondary:
    backgroundColor: "{colors.night-sea-3}"
    textColor: "{colors.night-text}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 22px"
    height: "52px"
  button-secondary-hover:
    backgroundColor: "{colors.night-sea-4}"
  button-ghost:
    textColor: "{colors.night-brass-text}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 22px"
    height: "44px"
  button-ghost-hover:
    backgroundColor: "{colors.night-sea-3}"
  icon-button:
    textColor: "{colors.night-text-2}"
    rounded: "{rounded.md}"
    size: "44px"
  verdict-button:
    backgroundColor: "{colors.night-sea-2}"
    typography: "{typography.verdict}"
    rounded: "{rounded.lg}"
    height: "64px"
  verdict-button-scam:
    textColor: "{colors.night-scam-text}"
  verdict-button-legit:
    textColor: "{colors.night-legit-text}"
  chip:
    backgroundColor: "{colors.night-sea-3}"
    textColor: "{colors.night-text-2}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "32px"
  chip-streak:
    textColor: "{colors.night-brass-text}"
  tile:
    backgroundColor: "{colors.night-sea-2}"
    textColor: "{colors.night-text}"
    rounded: "{rounded.lg}"
    padding: "14px"
  case-cloth:
    backgroundColor: "{colors.cloth}"
    textColor: "{colors.on-cloth}"
    rounded: "{rounded.lg}"
    padding: "22px 20px 18px"
  input-field:
    backgroundColor: "{colors.night-sea-2}"
    textColor: "{colors.night-text}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "56px"
  segmented:
    backgroundColor: "{colors.night-sea-3}"
    rounded: "{rounded.md}"
    padding: "4px"
  segmented-selected:
    backgroundColor: "{colors.night-sea}"
    textColor: "{colors.night-text}"
    rounded: "{rounded.sm}"
    height: "44px"
  switch:
    backgroundColor: "{colors.night-sea-4}"
    rounded: "{rounded.pill}"
    width: "52px"
    height: "32px"
  switch-on:
    backgroundColor: "{colors.night-brass}"
  sheet:
    backgroundColor: "{colors.night-sea-2}"
    rounded: "{rounded.sheet}"
    padding: "4px 20px 18px"
  message-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.phone-ink}"
    typography: "{typography.device}"
    rounded: "{rounded.lg}"
    width: "min(100%, 440px)"
  stamp-scam:
    backgroundColor: "{colors.scam}"
    textColor: "{colors.on-scam}"
    rounded: "{rounded.pill}"
    padding: "7px 20px 8px"
  stamp-legit:
    backgroundColor: "{colors.legit}"
    textColor: "{colors.on-legit}"
    rounded: "{rounded.pill}"
    padding: "7px 20px 8px"
  level-pearl:
    size: "48px"
  medal:
    size: "64px"
  site-button:
    backgroundColor: "{colors.cloth}"
    textColor: "{colors.pearl}"
    typography: "{typography.site-button}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "52px"
  site-button-on-sea:
    backgroundColor: "{colors.pearl}"
    textColor: "{colors.on-pearl}"
    typography: "{typography.site-button}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "52px"
---

# Design System: Scam Detective

## Overview

**Creative North Star: "The Pearl Merchant's Cloth"**

Every case is a strand being strung. The player judges ten messages, and each verdict seats a pearl in a ten-seat strand laid on the merchant's red cloth: a lustrous pearl for a right call, a dull bead for a wrong one, a brass ring for a seat still waiting. Progress, score and the result the player shares are one object, so the system refuses the category default of a dark quiz app with a progress bar, a points counter and green and red squares. The world is that of the Arabian Gulf's pearl merchant (الطوّاش): a deep blue green night sea for the ground, the red cloth as the one committed field for the day's case, nacre for the primary action and for right calls, and brass for every hairline, ring, thread and empty seat.

The game is an operating surface for short sessions on a phone, often in the evening, so the world shows as precision rather than ornament: standard controls, one soft elevation, gently rounded corners, Aref Ruqaa for titles and big numbers over Readex Pro for every other word. Motion has one authored moment: on each verdict a pearl drops into its seat in 240ms and a right call catches the light once, while a wrong call settles as a dull bead with no lustre. Three curves carry the movement: a quick ease-out (cubic-bezier(0.23, 1, 0.32, 1)) for presses, drops and arrivals, an ease-in-out (cubic-bezier(0.77, 0, 0.175, 1)) for light running across nacre, and a drawer curve (cubic-bezier(0.32, 0.72, 0, 1)) for sheets, dialogs and parked stamps. The message cards stand deliberately outside the world: they are real phone screens in the device's own font and inks, because the game trains the eye on the thing it will meet. Arabic is first class: strands, arrows, the cloth's light and the mark numbers all mirror for right to left reading, while the verdict buttons keep scam on the left and legit on the right in both languages, as the swipe does.

The website is a second surface in the same world. It keeps the sea, the cloth, brass, pearl and both faces, but lays them out as flat full-bleed fields, one colour per chapter, with no shadows and with buttons as full pills. The pieces of the game it shows keep the app's own radii, inks and type.

**Key Characteristics:**
- The ten-seat strand is progress, score and shared result in one object.
- Night sea by default, with a Pearl day theme on pale sea mist; cloth, brass and pearl stay the same in both.
- One red cloth field per app screen, carrying the day's case or the finished one.
- Nacre is the reward: right calls, passed chapters, earned medals and the level shine as lustrous pearls, and a wrong call is a dull bead.
- Aref Ruqaa at 700 for titles and big numbers, Readex Pro for every other word, the device font only inside message cards.
- One soft elevation; everything else is tonal layering edged with hairline rings.
- Fully mirrored for Arabic, with the verdict sides fixed.

## Colors

Four materials and three meanings: the night sea, the merchant's red cloth, brass and nacre, plus coral for a scam, green for legit and a deeper gold for a trap.

### Primary
- **Nacre Pearl** (#f5efe4): the primary action at night and always on the cloth, the case title on the cloth, the switch thumb. Its ink is **Cloth Ink on Pearl** (#3a0d16). A drawn pearl is never this flat colour: it is the lustre gradient, a white highlight at the upper left, a faint rose glint at the lower right, and nacre falling from #fbf7f0 through #f1e8da and #ddd1bf to #b4a58e at the rim.
- **Nacre Shadow Ink** (#3a2c18): checks, numbers and icons drawn on a pearl, as on the right-call ring in the debrief, a passed journey stop, an earned medal and the numbered steps in the checker.

### Secondary
- **Merchant's Cloth** (#7c1424): the one committed field (the day's case, the finished case and the certificate), lit from the top corner at the reading end, from **Cloth Lit Corner** (#94202f) through the cloth at 52% to **Cloth Deep Fold** (#5c0e1a). Smaller than a field, it grounds only the mark and the icon of a certificate ready to claim.
- **Cloth Paper Ink** (#fbeee9) and **Cloth Blush Ink** (#f2cdc6): text and secondary text on the cloth.
- **Brass on Cloth** (#f0d394): brass ink on the cloth. Seats and threads brighten there (rgba(234, 205, 140, 0.85) and rgba(226, 194, 127, 0.72)), and empty seats sit in wells of rgba(40, 4, 10, 0.32).

### Tertiary
- **Night Brass** (#c9a45c): brass as material, for a switch that is on, the selection tint and the hue of every night hairline.
- **Lamp Brass** (#e2c27f): brass as ink at night, for ghost buttons, icons in wells and rows, the focus ring, the trap colour in text, the streak count and the ring of the closed-case seal.
- **Day Brass** (#a8843f) and **Burnished Brass Ink** (#7a5a1f): the same two roles in Pearl day.
- **Brass Seat** (rgba(226, 194, 127, 0.62)) and **Brass Thread** (rgba(201, 164, 92, 0.5)) at night, rgba(122, 90, 31, 0.55) and rgba(122, 90, 31, 0.42) by day: the rings of empty seats, the level seat and unearned medals, the thread of every strand and the journey route.

### Neutral
- **Night Sea Ground** (#0d1d22): the default ground, the launch screen and the browser's theme colour. The night steps up through **Night Sea Surface** (#12272d) for tiles, panels, sheets, inputs and verdict buttons, **Night Sea Well** (#1a343b) for chips, icon wells, secondary buttons and pressed states, and **Night Sea Raised** (#23424a) for the active signal, the toast, the switch track and secondary hover.
- **Pale Nacre Text** (#f3ede2), **Sea Grey Text** (#b8c4c2) and **Deep Sea Grey Text** (#8fa0a2): primary, secondary and tertiary text at night.
- **Brass Hairline** (rgba(201, 164, 92, 0.16)) and **Brass Hairline Strong** (rgba(201, 164, 92, 0.3)): container rings and dividers at night.
- **Sea Mist Ground** (#e7edec), **Sea Mist Surface** (#f6f8f7), **Sea Mist Well** (#dce5e4) and **Sea Mist Raised** (#cfdbd9): the same four steps in Pearl day.
- **Sea Ink** (#10252b), **Slate Sea Ink** (#3d5358) and **Muted Sea Ink** (#51666a): text by day. Sea Ink is also the primary action off the cloth by day, with pearl text.
- **Sea Ink Hairline** (rgba(16, 37, 43, 0.12)) and **Sea Ink Hairline Strong** (rgba(16, 37, 43, 0.22)): rings and dividers by day. Message card paper turns pure white (#ffffff) by day.

### Verdict
- **Scam Coral** (#e5584f) and **Legit Green** (#3dbb8c): fills for the verdict discs, the stamps, the rush flash and a timer running low. Their inks are **Coral Shadow Ink** (#2a0806) and **Green Shadow Ink** (#03251a).
- Coral and green as text: #ff8a80 and #6fd8ad at night, #b3322b and #10704c by day.
- **Scam Number Red** (#c73a32), **Legit Number Green** (#16815a) and **Trap Gold** (#8e6a28): the discs that number the signs, always with white numerals.
- **Scam, Legit and Trap Highlights** (rgba(229, 88, 79, 0.28), rgba(61, 187, 140, 0.27) and rgba(201, 164, 92, 0.34)): the fill that marks the words on a card.

### Phone Inks
Message cards keep the phone's own inks in both themes: **Phone Paper** (#fbfaf7) with #f0eee9 and #e4e1da for banners, wells and rules; **Phone Ink** (#141820) with #545d6b and #737b88; **Link Blue** (#1f5fd1); **Received Bubble** (#e9e7e1) and **Sent Bubble** (#2b6be6) with white text.

### Website
The site's fields take the app's own values: sea (#0d1d22), sea 2 (#1a343b), mist (#e7edec), cloth (#7c1424) and brass (#c9a45c). The action and the headings on the sea and the cloth take the app's own **Pearl** (#f5efe4), which is also the nacre field of the second step, so the buttons on the site and in the game are one material. Its own tokens are **Site On Sea** (#f1f0ed), a cooler near white for running text on the sea; **Brass Field Ink** (#231807, with #4a3812 for secondary text) on the brass field; and **Site Paper** (#fffdf8) for the checker's text field. On the site the cloth is also the action on mist fields and the ink of the headline above the waterline, and the verdicts use the number inks (#c73a32 and #16815a). The pearls it draws carry the same lustre as the app's mark.

### Named Rules
**The One Cloth Rule.** An app screen holds at most one red cloth field: the day's case on Home, the finished case on results, the ground of the certificate. Smaller than a field, the cloth only ever grounds the mark and the icon of a certificate ready to claim.

**The Meaning-Only Rule.** Coral means scam or harm (a scam, a destructive action, time running out, the topic that fools the player most) and green means legit or safe; neither is ever decoration. A trap that only looks alarming is marked in Trap Gold, the one place brass carries a verdict, and the cloth's wine red never stands in for one.

**The Brass Seat Rule.** Seats, threads and the rings that hold pearls are brass in both themes. At night the container hairlines are brass as well; by day they turn to sea ink.

## Typography

**Display Font:** Aref Ruqaa (with Readex Pro, ui-serif, Georgia, serif)
**Body Font:** Readex Pro (with ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif)
**Label/Mono Font:** the device's own system font, for message cards only (-apple-system, BlinkMacSystemFont, system-ui, Segoe UI, Roboto, Noto Sans Arabic, Helvetica Neue, Arial, sans-serif)

**Character:** Aref Ruqaa brings the Ruqaa hand, the everyday Arabic handwriting, to titles and big numbers, with a lettered Latin to match; Readex Pro is a clear, even sans that reads the same in Arabic and English. Both are self-hosted as woff2 subsets for Arabic, Latin and Latin Extended under the SIL Open Font License with swap display: Aref Ruqaa in its 700 weight only, Readex Pro as a variable font from 160 to 700.

### Hierarchy
- **Display** (700, clamp(2.3rem, 10.6vw, 2.85rem), 1.15): the case title on the cloth, about 41px on a 390px phone. Results cloths step down to clamp(2.05rem, 9.4vw, 2.6rem) and balance their lines.
- **Display Number** (700, clamp(4rem, 22vw, 5.6rem), 1.1, tabular figures): the rush haul on the results cloth. Stats numbers sit at 1.95rem in the same face.
- **Headline** (700, 1.6rem, 1.2): the debrief verdict and the level name; dialog titles at 1.5rem.
- **Title** (700, 1.32rem, 1.25): the top bar title, centred.
- **Section** (700, 1.22rem, 1.3): section titles on Home and results, 28px above and 12px below; settings group titles at 1.1rem.
- **Body** (Readex Pro 400, 1rem, 1.55): running text. The debrief lesson opens to 1.65; tips and onboarding read at 1.6, onboarding on a 34ch measure.
- **Body Strong** (600, 1.02rem, 1.35): the titles of rows and tiles.
- **Button** (600, 1.02rem, 1.3) and **Verdict** (700, 1.12rem): actions.
- **Secondary** (400, 0.86rem, 1.4): the line under a row title and meta lines, in the secondary text colour.
- **Label** (600, 0.84rem): the headings of signal groups, each led by a 9px dot in its colour; the lesson's label sits at 0.88rem in brass.
- **Device** (system, 0.98rem, 1.45): message bubbles and card text. Marked text opens to 1.8 so the number discs fit.

### Named Rules
**The Two Hands Rule.** Aref Ruqaa writes only display text, always at 700: screen, section, sheet and dialog titles, the case title and big numbers. Readex Pro writes every other word, including the titles of rows, tiles and cards, buttons, labels, chips, stamps and the small counts in the play bar.

**The Phone's Own Voice Rule.** A message card speaks in the device font and the phone's inks. Only the game's own annotations on a card use Readex Pro: the channel line, the stamps, the mark numbers and banners such as an unknown sender.

**The Tabular Count Rule.** Every count, score, time and percentage sets tabular figures, so numbers hold still as they change.

## Layout

The app is one phone column. Each screen fills the viewport inside the safe areas: a top bar at least 56px tall, then a scrolling column with 16px gutters and 28px of room at the foot above the home indicator. From 720px wide the gutter grows to 28px and the content centres in a 560px column, with the play stage at 480px, the verdict row at 520px and the play bar at 640px.

Home's first viewport on a 390 by 844 phone: the head (mark and wordmark, streak chip, settings), then the case cloth at full width, at least as tall as the screen less 168px and capped at 700px. The title and its one line of status sit at the top, the strand is centred in the free space, and the primary button and a meta line (the edition and the time to the next case) sit at the foot, at thumb height. Below the cloth come the level tile and the week tile side by side, the packs in two columns, the tip of the day, the modes and a row of ghost buttons.

Play keeps the card in the middle and the decision at the bottom: a close button, the live strand and the score or a balancing spacer in the play bar; the scenario line; the card on its stage; the two verdict buttons in a two-column row with a 12px gap. After a call the debrief rises as a bottom sheet over up to 58% of the play area and can be dragged down to a 96px peek to look at the card again.

Rhythm: 10px between sibling tiles, rows and buttons; 12 to 14px inside tiles and rows; 20px inside the cloth, sheets and dialogs; 28px above a section title and 12px below it.

Family mode reads at least 1.3 times larger (the text sizes are 1, 1.12 and 1.25 otherwise), grows every target (icon buttons to 52px, buttons to 60px, verdict buttons to 76px), stacks the two Home tiles and drops the streak chip from the header, since the week tile already shows the streak.

The website is a run of full-bleed fields on a 12-column grid with 24px column gaps, a gutter of clamp(16px, 2.2vw, 32px) and section padding of clamp(80px, 9vw, 140px). It opens on the waterline: mist above, sea below, the surface at 42% of the first screen (34% under 900px, 30% under 700px). The headline is set across the surface, cloth red above and pearl below, and a real game card floats on it. How it works is four fields side by side (sea, mist, brass, sea 2) that share their rows so the cards and the lines align, stacking under 900px. The features are six tiles in two rows of uneven widths on those 12 columns (spans of 5, 4 and 3, then 4, 5 and 3), each as wide as its moment needs; under 1100px they pair up in two columns with the marked message and the privacy line spanning both, and under 700px they stack. The bar tightens again under 420px.

### Named Rules
**The Thumb Height Rule.** The day's one action sits at the foot of the cloth, at thumb height, with the strand centred in the space above it.

**The Fixed Sides Rule.** Scam is always on the left and legit on the right, in both languages, because the swipe is physical: left for scam, right for legit.

**The Mirror Rule.** In Arabic everything that reads mirrors: strands fill from the right, screens slide the other way, arrows flip, the cloth's light and its seal move to the top left, and mark numbers open on the right. Only the verdict sides stay where they are.

## Elevation & Depth

Hybrid. Structure is tonal: the night ground steps up through four sea tones, and containers draw their edge as an inset hairline ring (1px, 1.5px for outlined items such as the checker row, 2px in brass for a selected or focused item), while rows inside a panel are divided by 1px rules in the hairline colour. One soft lift marks the few surfaces that sit above the sea, and small contact shadows belong to the pearls as objects.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 18px 40px -18px rgba(0, 0, 0, 0.72), 0 4px 12px rgba(0, 0, 0, 0.28)` at night; `box-shadow: 0 16px 36px -18px rgba(16, 37, 43, 0.4), 0 3px 10px rgba(16, 37, 43, 0.12)` by day): the case cloth, the message card, the toast and the certificate preview.
- **Sheet edge** (`box-shadow: 0 -18px 40px -20px rgba(0, 0, 0, 0.7)`): the debrief sheet and bottom dialogs, the lift turned upward.
- **Pearl contact** (`box-shadow: 0 2px 5px rgba(0, 0, 0, 0.38), inset 0 -1px 2px rgba(90, 66, 30, 0.22)` at night; `box-shadow: 0 2px 4px rgba(16, 37, 43, 0.3), inset 0 0 0 1px rgba(90, 66, 30, 0.18)` by day): every lustrous bead. Larger nacre objects (the right-call ring, a passed journey stop, an earned medal, the switch thumb) take 0 2px 6px to 0 3px 8px at 30 to 35% black.
- **Stamp lift** (`box-shadow: 0 10px 26px -10px rgba(0, 0, 0, 0.55)`): the verdict stamps riding on the card.

### Named Rules
**The One Lift Rule.** Only a surface that sits above the sea gets the lift: the cloth, the message card, the toast, the certificate. Tiles, panels, rows and buttons stay flat with a hairline ring, and nothing carries both.

**The Pearls Cast Shadows Rule.** Contact shadows belong to nacre objects, never to containers.

**The Flat Chapter Rule.** The website casts no shadows: every section is one flat field, and depth comes from the change of field and the waterline.

## Shapes

Rounded rectangles for everything that holds, circles for everything that is a pearl or counts one. Controls round at 14px (buttons, inputs, icon buttons, icon wells, the segmented track, signals, the lesson); surfaces at 16px (tiles, panels, the cloth, message cards, verdict buttons); items nested inside them at 10 to 12px (segments, small wells, and the buttons and fields drawn inside a card); sheets and bottom dialogs at 20px on their top corners only. Chat bubbles round at 18px with a 6px tail corner on the sender's side, and marks at 4px. Pills (999px) are kept for chips, the seal, stamps, tags and switches. Large icon tiles round at about a quarter of their side (32px on 120px, 24px on 96px), as the mark does (15 on 64).

Strands are drawn, not boxed: a 1.5px thread with seats along it. A draped strand sags by a fifth of its width along a parabola with its ends inset 4%; its pearls are spaced evenly along the curve rather than across it and graduate from 60% at the clasp to full size in the middle, the way a necklace rests.

On the website the fields are square-edged and full-bleed, buttons are full pills (round like the pearls they stand for), the mark is drawn flat as a square of cloth, pieces of the game keep the app's radii, and the pearl diver's photograph sits in a round disc.

### Named Rules
**The Round Pearl Rule.** Circles are for pearls and what holds or counts them: beads, seats, the level seat, medals, journey stops, verdict discs and number discs, besides the phone's own avatars. Containers are never circles, and pearls are never squares.

## Components

### Buttons
- **Shape:** gently rounded (14px), full width by default, at least 52px tall (60px for the next-card button at the foot of Play and in family mode).
- **Primary:** Nacre Pearl with its cloth ink, Readex Pro 600 at 1.02rem, 22px side padding and a 10px gap to an arrow that flips for Arabic. On the cloth it is always pearl; off the cloth by day it turns to Sea Ink with pearl text.
- **Hover / Focus:** hover exists only for a fine pointer: the primary mixes in 12% white, and on the cloth it goes to pure white. Every press scales to 0.97 over 140ms. Focus is a 2px ring 3px out in Lamp Brass (Burnished Brass Ink by day, pearl on the cloth). A disabled button drops to 45% opacity.
- **Secondary / Ghost / Danger:** secondary is Night Sea Well with the text colour, one step up on hover; ghost is Lamp Brass text, 44px tall, with a well fill on hover; danger is coral at 16% with coral text.
- **Icon buttons:** 44px squares with 14px corners in the secondary text colour, pressing to 0.94 with a well fill.
- **Verdict buttons:** two equal 64px buttons on Night Sea Surface with a strong hairline ring and 16px corners, Readex Pro 700 at 1.12rem in the verdict's text colour, each led by a 32px disc in Scam Coral or Legit Green holding an x or a check at a 3px stroke. They press to 0.96 and grow to 76px in family mode.

### Chips
- **Style:** 32px pills on Night Sea Well, Readex Pro 500 at 0.85rem in secondary text with a 16px icon.
- **State:** the streak chip turns to Lamp Brass at 600 behind a 13px lustrous bead. The closed-case seal is a pill with a 1.5px Lamp Brass ring and pale gold text (#f6dca4) in the cloth's top corner at the reading end. Review tags tint the verdict colour at 16%; tip topics are outlined with a hairline ring.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** Night Sea Surface on the night ground, Sea Mist Surface by day.
- **Shadow Strategy:** none; containers stay flat (see Elevation & Depth).
- **Border:** a 1px inset hairline ring. Tinted variants change its colour: celebrations and the lesson take brass at 12% with the strong ring, the weakest topic takes coral at 11% with a coral ring at 30%, and a certificate ready to claim takes brass at 13% with a 1.5px brass ring.
- **Internal Padding:** 14px in tiles, mode rows and celebrations; 16px at the sides of panel rows and in the tip card; 18px in the level card.
- Settings panels hold rows at least 56px tall, divided by 1px hairlines and each led by a 22px brass icon. Mode rows lead with a 46px icon well holding a Lamp Brass icon and press to 0.985.

### Inputs / Fields
- **Style:** Night Sea Surface with a strong 1px inset ring and 14px corners (16px for the checker's text area), 54 to 56px tall with 16px side padding and at least 16px text, so phones never zoom.
- **Focus:** the ring thickens to 2px Lamp Brass; the caret is brass and placeholders take the tertiary text colour.
- **Segmented controls:** a Night Sea Well track with 14px corners and 4px padding, holding 44px segments with 10px corners; the chosen one lifts to the ground colour (white by day) with a strong hairline ring at 600 weight.
- **Switches:** a 52 by 32px pill on Night Sea Raised that turns Night Brass when on, with a 26px pearl thumb and its contact shadow sliding over 220ms (60 by 36px in family mode).

### Navigation
- **Home head:** the 36px mark and the wordmark in Aref Ruqaa at 1.5rem, the streak chip, the settings icon button.
- **Top bar:** at least 56px tall, a back or close icon button at the start, the title centred in Aref Ruqaa at 1.32rem and a 44px spacer to balance the end.
- **Play bar:** close, the live strand on 20px seats in the middle, then the score or a spacer. In rush the strand gives way to an 8px Lamp Brass timer bar that turns coral in the last ten seconds.
- **Movement:** screens slide 28px along the reading direction over 300ms and 20px back over 260ms; the first screen rises 6px out of the launch screen in 280ms.

### Icons
Lucide line icons on a 24px grid at a 2px stroke with round caps and joins, in the current text colour: 22px in icon buttons, 23px in mode wells, 26px on pack tiles, 16px in chips, and 19px at a 3px stroke inside the verdict discs. Icons in wells and leading rows take Lamp Brass; arrows that point flip for Arabic.

### The Strand
The signature component: one seat per card on a 1.5px brass thread.
- **States:** a right call is a lustrous pearl with its contact shadow; a wrong call is a dull bead (a grey nacre from #8f979a to #4a5255) at 84% with no lustre; a waiting seat is a 2px brass ring around a tinted well at 62% (90% on the case cloth); the seat in play rings in Lamp Brass with a 3px halo at 74%.
- **Sizes:** 22px seats by default, 20px in the play bar, 32px on the case cloth and the results cloth, 14px in the topic rows on Stats.
- **Motion:** a new verdict drops 8px into its seat from half size over 240ms; a right call then sweeps one band of light across its pearl over 640ms after a 200ms pause. On the results cloth the finished strand catches the light pearl by pearl, 700ms each and 70ms apart. With reduced motion the drop becomes a 160ms fade and the sweep is dropped.
- **Forms:** draped on the Home cloth; graduated and straight on the results cloth, never wider than 40px a seat; ten beads per topic on Stats; seven 15px pearls for the week, with today ringed in brass; three pearls in place of stars for chapters and packs. The shared text draws the strand as white and dark circles.

### The Case Cloth
The day's case laid on the cloth: Merchant's Cloth lit from the top corner at the reading end, 16px corners, 22px top, 20px side and 18px foot padding, and the lift. The case title is set in the display style in Nacre Pearl, its status line in Cloth Blush Ink, the closed seal in the lit corner, the draped strand in the middle, the pearl button and the meta line at the foot. On results the same cloth centres everything: the case or mode as its title, the finished strand (or the rush haul as a big number), the tally, and the share button for the daily case.

### Level Pearl and Medals
- **Level pearl:** a lustrous pearl in a brass seat (48px, 96px on Badges, 40px in celebration rows), graded by size the way merchants sieved pearls: 29% of the seat at level 1, growing with the logarithm of the level to 83% at level 10, then slowly to 88% at the top level.
- **Medals:** 64px (96px in their sheet, 44px in celebration rows). Not yet earned: an empty face inside a 1.5px seat ring with a tertiary icon. Earned: a lustrous face with a Nacre Shadow Ink icon, a 1.5px Lamp Brass ring 3px out and a contact shadow, with the tier as one, two or three pearls set on the ring's lower edge. A newly earned medal presses in over 520ms with a slight overshoot, then light runs across it once.

### Message Cards and Marks
- **Card:** up to 440px wide at 16px corners on Phone Paper in the device font, with the lift. Nine channels are drawn as their real screens: text message, lock screen notification, chat, email, call, web page, QR poster, social post and marketplace listing. A channel line in Readex Pro 600 at 0.78rem opens the card.
- **Bubbles:** 18px corners with a 6px tail corner, received on #e9e7e1, sent on #2b6be6 with white text.
- **Marks:** in the debrief each sign's words fill with their highlight from the reading side over 560ms, one after another (120ms, then 110ms more for each number); a trap also takes a 2px dotted underline in Trap Gold. Each mark opens with its number: a 17px disc with a white numeral in the sign's number ink. In the flag hunt a found mark carries a raised number instead, since nothing may move under a finger.
- **Stamps:** the call rides on the card as a pill in its verdict fill (Readex Pro 700 at 1.4rem) while it is dragged, lands from 1.3 times its size over 300ms, then parks on the card's top edge at 62% over 460ms. The true verdict parks in the middle; the player's call, when wrong, fades to 40%.

### Debrief Sheet
- A bottom sheet on Night Sea Surface with 20px top corners, a 40 by 5px handle and the sheet edge, sliding up over 420ms on the drawer curve.
- The verdict head: a 42px ring (lustrous with a check for a right call, a dull bead with an x for a wrong one), the headline in Aref Ruqaa, the true verdict in its text colour, and any points in Aref Ruqaa brass.
- The lesson comes first, in a brass-tinted box with a strong ring, a brass label with a shield icon, and text at 1rem with 1.65 leading.
- The signs follow in groups, the group that decides the verdict first: each a Night Sea Well row with 14px corners and a 24px number disc that matches the mark on the card.
- Dialogs take the same bottom sheet form, rising over 340ms on the drawer curve above a backdrop of rgba(4, 10, 12, 0.58). A toast sits above the verdict row on Night Sea Raised with 14px corners, the lift and a brass icon.

### Certificate
Drawn on the device at 1080 by 1350: the cloth (from #9a2333 through the cloth to #4e0b16) with nacre paper (#f7f1e6, 36px corners) laid on it under a soft shadow; a brass frame of a 3px line with a 1.5px hairline inside it; the mark and the game's name in cloth red; the title and the player's name in Aref Ruqaa in a dark ink (#2a1418); a nine-pearl graduated strand on a brass thread; three figures in brass-outlined boxes with 18px corners; the date and serial on the reading side, and on the other a printed roundel of two brass hairlines around the mark that claims nothing.

### Website
- **Fields:** each section is one flat field (sea, sea 2, mist, cloth or brass) that sets its own inks and its own action colour: pearl on the sea and the cloth, cloth on mist, sea on brass.
- **Buttons:** flat full pills at least 52px tall with 26px side padding in Readex Pro 600 at 18px; a press scales to 0.97 and hover brightens them by a tenth.
- **Links:** underlined at 1.5px with a 0.24em offset; navigation links show the underline only on hover.
- **Type:** headings in Aref Ruqaa at clamp(40px, 5.4vw, 88px), leads in Readex Pro at clamp(20px, 1.8vw, 26px), body at 18px and small text at 16px.
- **Strands:** drawn as one picture from a pearl, a dull bead and a seat, filling from the right in Arabic; ten graduated pearls make the necklace in the hero.
- **The checker:** a text field on Site Paper with a 1.5px sea ink rule and 18px corners that turns cloth on focus, beside the game's own answer in its daylight colours.
- **The close:** a sentence in the display face with an inline language select on Cloth Lit Corner and a pearl pill that opens the game.

### Named Rules
**The Honest Strand Rule.** On a strand that reports play, a lustrous pearl always means a right call, a dull bead a wrong one and an empty brass ring a seat still waiting. The three never swap meaning.

**The Reading Side Rule.** A mark's number opens the mark on the side the card reads from, joined to the mark's first word so it never sits alone on the line above. It keeps the card's direction even inside a left to right run, such as a phone number or a web address in an Arabic card, and the website's marked messages follow the same rule.

## Do's and Don'ts

### Do:
- **Do** let the strand carry progress, score and the shared result: one seat per card, a lustrous pearl for a right call, a dull bead for a wrong one, a brass ring for a seat still waiting.
- **Do** keep one red cloth field per app screen, with its one primary action at the cloth's foot at thumb height.
- **Do** draw container edges as inset hairline rings (brass at night, sea ink by day) and thicken them to a 2px brass ring for focus and selection.
- **Do** set titles and big numbers in Aref Ruqaa 700, every other word in Readex Pro, and every count in tabular figures.
- **Do** keep message cards in the device font and the phone's inks, with only the game's annotations in Readex Pro.
- **Do** mirror everything that reads for Arabic, and keep scam on the left and legit on the right in both languages.
- **Do** answer every press with a scale between 0.94 and 0.99 over 140ms on the quick ease-out (cubic-bezier(0.23, 1, 0.32, 1)), and keep hover for fine pointers.
- **Do** theme the browser's own surfaces from the palette: a brass selection tint, a brass caret, thin scrollbars in the hairline colour and brass focus rings.
- **Do** honour reduced motion and family mode: screen changes, pearl drops and arrivals become short fades of 160 to 180ms, light sweeps are dropped and loops stop; family mode also reads at least 1.3 times larger with targets of 52px and up.
- **Do** give each website chapter one flat field with its own inks and action colour, and keep its buttons flat pills.

### Don't:
- **Don't** track a case with a progress bar, a running points counter or a row of green and red squares: the strand is the progress. A bar only ever counts time, as in rush and the flag hunt.
- **Don't** use coral or green as decoration, and never let the cloth's red stand for a verdict.
- **Don't** let a strand show lustre it has not earned: a wrong call is always a dull bead and a waiting seat always an empty ring.
- **Don't** give tiles, rows or buttons a drop shadow, or put a hairline ring under the lift.
- **Don't** set a message card's own words in the game's faces or lay the world's colours on the card itself; only the debrief's marks, numbers and stamps sit on it.
- **Don't** swap the verdict sides for Arabic, or let a mark's number fall onto the line above its words.
- **Don't** draw seats, threads or night hairlines in neutral grey; they are brass.
- **Don't** add shadows or rounded section panels to the website.
