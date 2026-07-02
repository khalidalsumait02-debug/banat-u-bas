# بنات وبس · Banat w Bas

**لعبة القروب اللي فئاتها لكم 💅** — a girls-first Kuwaiti party trivia game
(سين جيم style) built in React. Two teams, six categories, 36 questions, and real
*فصلة*: humming, charades, taboo, and emoji rounds.

> Positioning: *"سين جيم للبنات" — بس بمحتوى طازج وفصلة أكثر.*
> See [`BRAND.md`](./BRAND.md) for the full brand + market strategy.

## Engine
- **2 teams**, each picks **3 categories** → a **6-category × 6-question** board
  (2×200, 2×400, 2×600 per category) = **36 questions**.
- **3 helper tools per team:** 📞 دقّي على صديقتج · ✌️ جوابين · 💅 الخطفة.
- **Question types:** normal Q&A · 🧩 إيموجي · 🎵 دندنة (hum) · 🎭 تمثيل (charades)
  · 🙊 ممنوع تقولين (taboo). Performance types use press-and-hold "peek" cards and
  built-in ring timers.

## What's in v3
- **Brand identity** — wordmark + kiss/heart mark, English lockup, dark-glam
  palette, favicon & PWA manifest (installs to the home screen).
- **Bigger, fresher content** — **24 categories / 144 questions** researched
  against current (2025–2026) Kuwaiti girl culture, culturally reviewed. Mixes
  "typical Kuwaiti" staples (à la ثبّت / مخمخ) with global topics Kuwaitis love —
  travel destinations (London, Georgia, Bodrum, Greece, Cannes, LA), English
  songs, and now-culture categories (ترندات الكويت 🔥، الكويت الحين ⚡) built
  from deep social-media research — all written in Arabic. See
  [`docs/CURRENT-CULTURE-2026.md`](./docs/CURRENT-CULTURE-2026.md) for the
  research base and content safety rules.
- **Easier to run a game night:**
  - 🔊 **Sound** (synthesized, no assets) with a mute toggle.
  - ❔ **How-to-play** sheet reachable from any screen.
  - ↩︎ **Resume on refresh** — the game auto-saves to the device.
  - ✏️ **Editable scores** (+/− per team) and **↶ Undo** for host corrections.
  - ⏱️ **Circular ring timers** with countdown ticks.
  - Accessibility passes: focus rings, aria labels, reduced-motion support.

## Project layout
```
src/
  App.jsx              UI + game engine (screens, board, question overlay)
  data.js              BRAND tokens, color palette, categories & questions
  sound.js             tiny Web Audio SFX engine (no audio files)
  usePersistedState.js localStorage-backed state (resume-on-refresh)
public/
  favicon.svg          brand mark
  manifest.webmanifest PWA install metadata
```

## Run locally
```bash
npm install
npm run dev
```

## Build & preview
```bash
npm run build
npm run preview
```

## Editing content
All questions live in `src/data.js` under `CATS`. **Keep each category at exactly
6 questions in tiers 200/200/400/400/600/600** — the board relies on 2 questions
per tier. Add a `t` field (`emoji`/`hum`/`act`/`taboo`) for performance questions.

## Status
Playable prototype with a researched content bank. Scores are host-tapped and
editable (party-game style), not auto-graded. Before a public launch, get a native
Kuwaiti pass on phrasing and refresh any fast-moving pop-culture answers.
