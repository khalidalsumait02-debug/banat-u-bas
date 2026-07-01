# بنات وبس — Brand & Strategy

A one-stop brief for the name, look, voice, positioning, and content direction.
Everything here is reflected in the app (`src/data.js` → `BRAND` + `C`, and the
UI in `src/App.jsx`).

---

## 1. The name

**بنات وبس** — *Banat w Bas* ("Girls, that's it" / "Just girls").

Keep it. It is genuinely the right name for this niche, and here's why it beats
the alternatives:

- **It states the audience in two words.** The whole market gap (see §5) is that
  no one owns "girls-first Khaleeji party trivia." The name plants that flag.
- **It fits the category's naming conventions.** Winning Gulf party games use
  short, punchy, second-person dialect names — *سين جيم*, *شنو حرفك؟*, *بس دقيقة*,
  *لا اي ولا لا*. "بنات وبس" is in exactly that register.
- **"وبس" carries attitude** — a little wink of "and that's final 💅" that matches
  the playful, confident tone.

**English lockup:** `Banat w Bas` (used as a small tracking-spaced sub-label under
the Arabic wordmark).

**If you ever want to rebrand,** these were the strongest runners-up — all
available-looking in the space and on-brand:
| Name | Reads as | Note |
|---|---|---|
| **قروب بنات** | "Girls' group" | clear, a touch generic |
| **بنات القروب** | "The group's girls" | friendly, less punchy |
| **دقّة بنات** | "A girls' beat/moment" | cute, wordplay on دقّة |
| **ولكن بنات** | riffs on the "…ولكن" brand family (Girls ولكن) | risks looking derivative |

Recommendation: **stay with بنات وبس.** It's better than all of these.

---

## 2. Logo & mark

- **Wordmark:** *بنات وبس* set in **Lalezar** (rounded, warm, display) with a
  gold→rose→gold shimmer sweep.
- **Mark:** a **kiss/heart inside a gold ring** with a sparkle — feminine, glam,
  reads at favicon size. Lives in `src/App.jsx` (`<Mark/>`) and as
  `public/favicon.svg`.
- Always pair the mark + wordmark on the intro; the mark alone works as the app
  icon and share thumbnail.

## 3. Color palette

Dark-glam "diwaniya at night" — not the pastel-pink cliché, which is the point of
difference. Tokens live in `src/data.js` as `C`.

| Token | Hex | Use |
|---|---|---|
| `ink` | `#2A0E2E` | background base, deepest plum |
| `berry` / `berry2` | `#45123F` / `#5A1850` | surfaces, cards |
| `magenta` / `magenta2` | `#FF3D8A` / `#F5387F` | primary action, tiles, "hot" |
| `gold` | `#F2C879` | scores, accents, the "prize" color |
| `rose` | `#FFC2DD` | soft highlight, team A |
| `cream` | `#FBEFE9` | text |

## 4. Voice & tone

- **Kuwaiti dialect, second person, girl-to-girl.** "سمّوا الفريقين"،
  "دورهم"، "يالله نبدأ".
- **Warm and a little cheeky**, never mean. Emojis as punctuation (💅✨🙊).
- **Host-friendly:** the game trusts the group. Scores are host-tapped, editable,
  and undoable — party-game style, not a strict quiz engine.

---

## 5. Market positioning (why this wins)

Research into the live 2025–2026 market (Seen Jeem, Tahdani, Trabba', the
JokeyJoy "Girls ولكن" deck, and the Kuwaiti physical party-card scene) surfaced a
clean, exploitable gap:

- **Seen Jeem (سين جيم)** is the category leader and uses the *identical* engine
  (2 teams · 6 categories · 36 questions · 3 helpers). But it's **~2.6★** and its
  reviews hammer two things: **pay-per-game pricing** ("غالي") and **stale /
  repetitive / Kuwait-only content**.
- **The girls-targeted reference product** — *Girls ولكن* by JokeyJoy — is
  **Egyptian-dialect and physical** (a card deck).
- **Nobody owns the intersection:** a **Khaleeji-dialect, girls-first, digital**
  party game.

**بنات وبس sits exactly in that gap.** Positioning line:

> *"سين جيم للبنات" — بس بمحتوى طازج وفصلة أكثر.*
> *("Seen Jeem for the girls — but fresher, with more فصلة.")*

Three moves that beat the incumbents:

1. **Win on content freshness & audience fit.** Girl-culture categories
   (turkish/korean drama, makeup, perfume, cafes/matcha, Kuwaiti weddings,
   nostalgia, dialect) that the neutral trivia apps don't do well.
2. **Win on tone.** A real feminine brand, not a gender-neutral quiz.
3. **Win on the "فصلة".** The performance rounds (دندنة / تمثيل / ممنوع تقولين /
   إيموجي) turn it from a quiz into a party — the thing card decks do and trivia
   apps don't.

### Don't repeat Seen Jeem's mistakes
- **Be generous with free play.** The #1 complaint is price/paywall pressure.
  Keep the core game free; if you ever monetize, do it with **content-pack DLC**
  and **seasonal drops** (رمضان pack, قرقيعان pack, "عروس / bride-to-be" pack),
  *not* a per-game meter.
- **Keep content fresh.** Batch-refresh categories each season; the data lives in
  one file (`src/data.js`) precisely so this is easy.

---

## 6. Content principles (and what to avoid)

The question bank is written to be **current, hyper-local, and culturally safe**.

**Safe & great material** (all in the app): Turkish/Korean drama, K-pop,
makeup & "clean girl", Gulf celebrities (Ahlam, Hayat Al-Fahad, Nour Al Ghandour),
Kuwaiti drama (درب الزلق، بيت الحمولة، أفكار أمي), كويت زمان, fashion & Kuwaiti
designers (يوسف الجسمي), cafes & matcha & Dubai chocolate, perfume & oud
(خمرة/لطافة، عبدالصمد القرشي، Amouage), social media (Boutiqaat, TikTok),
nostalgia (سبيستون، افتح يا سمسم، تماغوتشي، BBM), Kuwaiti dialect & Arabizi,
Kuwaiti wedding traditions (الحنّة، الملچة، الزفّة، الدزّة، الجلوة).

**Two content pillars, deliberately balanced:**
1. **"Typical Kuwaiti" staples** (the ثبّت / مخمخ baseline every trivia app has):
   معلومات كويتية — currency, National Day, أبراج الكويت, فيلكا, pearl diving, السدو.
2. **Global topics Kuwaitis actually care about** — because this audience is
   worldly and travels constantly. All written in Arabic:
   - **سفر ووجهات** — real Kuwaiti summer spots: London (Harrods/Knightsbridge),
     Georgia (Tbilisi/Batumi), Bodrum, Greece, Cannes, LA.
   - **معالم ومدن** — world landmarks/cities (Paris, NYC, London, Venice,
     St Tropez, Boston).
   - **أغاني عالمية** — English songs trending with this crowd (Espresso, Taylor
     Swift, The Weeknd, APT., Billie Eilish, Die With A Smile).

**Avoid** (baked into the content rules):
- Politics, regional conflict, and religion-as-quiz-material.
- Alcohol / dating / clubbing framing (Kuwait is conservative; keep it clean).
- Influencer controversies and body-/appearance-shaming — keep it celebratory.
- Framing gendered gatherings (diwaniya, weddings) in ways that assume mixed-gender
  norms; present them as heritage.

---

## 7. Ideas for the next iteration

- **Party-card round variety** (the JokeyJoy playbook): a light, clean "مين فينا…"
  (who's most likely) superlatives round, or a "شنو حرفك" letter-race category.
- **Seasonal content packs** as above.
- **Shareable end-card** (a styled result image for stories) — the audience is
  Instagram/TikTok/Snap-first; make winning screenshot-worthy.
- **PWA install** is already wired (`manifest.webmanifest`, theme color, apple
  meta) so it can live on the home screen.
