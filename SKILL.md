---
name: stick-figure-shorts
description: Makes original 20–40 second stick-figure story shorts (9:16 Reels, Shorts, TikTok) drawn entirely in code, with SVG and React in Remotion, voiced with ElevenLabs and timed word by word. The look is white round-head characters with ink outlines and stick limbs on moody one-light sets, plus clean fact cards and karaoke captions. Use whenever the user wants a stick-figure, stickman or "white head" cartoon story video, a faceless story or explainer short, a "you" second-person dilemma story, an animated fact story for a faceless YouTube or Instagram page, or asks to make "videos like this" from a stick-figure reference. Also use to plan a series for such a channel, or to fix the timing, captions or look of a film made with this skill.
---

# Stick-figure shorts

One skill, one pipeline: **story → voice → word timings → shots in code → sound design → render → QA**. Nothing is AI-generated except the audio (voice, and optionally the music and SFX library). Every character, set and card is SVG drawn by Claude, so the result is original, consistent and cheap to repeat daily.

Worked example: "The Wallet" (30 s, full sound design), whose source is in `assets/template/`. Copying it and changing the story is the fastest start. Four more films made with this skill (The Penny, Three Doors, The Marshmallow, The Wall From Space) show the range.

## 0. Before you start
- **Ask for (or pick):** the premise, the niche, the language, and whether it ends on a question (engagement) or a twist (story). Default: English, 9:16, ~30 s, ending on a question.
- **Originality:** the genre (round white heads, stick limbs, "you" stories) is free to use. A specific channel's characters, costumes, story, title, colours and on-screen furniture are not. Invent your own cast (one costume colour + one hair or hat detail each).
- **Facts:** if the story uses a fact, find the primary source first and keep the numbers exact. See `references/story.md` → "Fact rules".

## 1. Story: hook → problem → twist → payoff (20–40 s, 55–95 words)
| Beat | Time | Job | Example (The Wallet) |
|---|---|---|---|
| Hook | 0–3 s | Second person, present tense, concrete stakes in the first line | "You find a wallet on an empty street." |
| Problem | 3–10 s | The temptation or danger, made specific | "Inside… a hundred dollars. And a key. Nobody saw you." |
| Twist | 10–20 s | A real fact or turn that flips the expectation | "Scientists 'lost' 17,000 wallets in 40 countries…" |
| Payoff | 20–27 s | What it means, shown as an action | "More people tried to give them back." |
| Question | last 3 s | One short line to the viewer, then a title card | "So… would you give it back?" |

- Short sentences, 3–9 words. Write pauses with "..." (ElevenLabs honours them).
- One hero, at most two other characters.
- Read `references/story.md` for premise formulas, niche ideas, series hooks and the fact rules.

## 2. Visual grammar (full spec: `references/visual-grammar.md`)
- **Canvas:** 1080×1920, 30 fps. Captions sit at ~y 1360; keep the top 120 px and the bottom 300 px free of key action (platform UI).
- **Characters** (`<Figure>` in `kit.tsx`): a white circle head (r 62) with a **7 px ink outline**, dot eyes, brows that carry the mood (`neutral · worried · sly · happy · surprised · sad`), a small mouth. Limbs are **single 9 px ink lines**, hands are white mittens, feet are chunky white sneakers. **One costume colour on the torso** identifies each character. Options: hair tuft or bun, glasses, scarf, lab coat, held prop.
- **Palette:** dark desaturated sets (navy, slate, teal-grey) + **one warm light source** per scene + the hero's costume colour as the only saturated hue. Fact cards are flat paper with ink type and the hero colour as the single highlight.
- **Camera:** hard cuts every **2.5–4 s** (8–10 shots in 30 s). Each shot gets **one slow eased push** (zoom 1.00 → 1.05–1.14 around a focus point) and nothing else. No shakes, whips or spins.
- **Shot rotation:** wide (set the scene) → insert (the object) → medium (the reaction) → close-up (the decision) → fact card → fact card → payoff wide → close-up on the question.
- **Close-ups:** reuse the same `<Figure>` at scale 2.6–4.2 and blur the set behind it (`<Street blur={9–14}>`) for depth.
- **Text:** karaoke captions (Inter 800, 68 px, 2–4 words, the spoken word bright and the rest dim); fact cards carry their own big number (Fraunces 800) and a small mono label; captions hide on cards. At most one small stakes tag ("FOUND · $100 + 1 KEY").

## 3. Voice: ElevenLabs with word-timed cues (detail: `references/pipeline.md`)
1. **Pick a voice** that fits: a clear, natural narrator (calm with a little suspense) for most stories, a storyteller for kids' fables. With the ElevenLabs connector: `creative_list_voices` (search "narrator storytelling", `use_cases: ["narrative_story"]`).
2. **Generate** with `eleven_v4` and 2 takes. Light audio tags only, at the start of a beat: `[calm, a little suspense]`, `[quietly]`, `[warmly]`, `[softly]`. Connector: `creative_generate_speech` → `creative_get_generations` → download `full_res_url` with curl (the link expires in 2 hours). API alternative: `scripts/tts.py`.
3. **Pick the take** with the better pauses on the key beats (listen, or compare `silencedetect` gaps). Keep both in `input/`.
4. **Word timings:** `transcribe.py` (faster-whisper, word timestamps) → `transcript_takeA.json`. `scripts/tts.py` writes the same file straight from ElevenLabs' alignment.
5. **Cues:** `python3 scripts/cues.py transcript_takeA.json <project>/words.ts --lead 15` writes `WORDS` (frame-accurate karaoke) and `CHUNKS` (caption groups) and prints the cue table. **Film frame = 15 + round(seconds × 30).** Put every key word's frame at the top of `Film.tsx` and in `BRIEF.md`, and start each shot's beat on its word.

## 4. Build in Remotion
1. **Scaffold:** `bash scripts/new_film.sh <slug> <remotion-engine-dir>` copies `assets/template/` into `src/projects/<slug>/` (kit.tsx, Film.tsx, index.tsx, entry.tsx, words.ts) and renames the ids. With no engine dir, it creates a standalone Remotion project and runs `npm install`.
2. **Write `Film.tsx`:** a `SHOTS: ShotDef[]` list, each `{from, to, z0, z1, fx, fy, render(f)}`, plus your sets (`Street`, `Doorway`…), props and fact cards. Keep `kit.tsx` generic; story drawing lives in `Film.tsx`.
3. **Animate on the words:** `keys(f, [[frame, value]…])` for eased keyframes, `pop(f, at)` for overshoot pop-ins, `eout(ramp(f, a, b))` for slides, `blinkAt(f, seed)` for blinks, `walk={f * 0.3}` for walk cycles.
4. **Always render through the project's own `entry.tsx`**, never the main `src/index.ts` (one broken project anywhere breaks the main bundle).

## 5. Sound design (detail: `references/sound.md`)
The mix lives in the composition: `<Soundtrack total voice voiceEnd music amb ambVol sfx />` from `kit.tsx`.
1. **Narration:** `ffmpeg -i input/narration_takeA.mp3 -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 48000 <public>/projects/<slug>/narration.wav`. It plays from frame 15.
2. **Library (once):** 16 SFX + 3 music beds made with ElevenLabs (prompts in `references/sound.md`, ~17 credits per SFX, ~900 per 35 s bed) + 3 ambience beds from `scripts/make_ambience.sh` (free). Trim SFX to their first hit.
3. **Pick per film:** one music bed (suspense / playful / ambient), one ambience, and an `SFX` list `[frame, name, volume]`: a whoosh before most cuts, story sounds on their beats, one signature sound, hits only in voice pauses.
4. **Levels:** voice 1.0 · music 0.2 under the voice, 0.34 after · ambience 0.5–0.7 · SFX 0.25–0.5.

## 6. Render
```bash
bash scripts/stills.sh <engine> <slug> <out_dir> 60 150 240 310 370 470 600 700 850   # QA stills + sheet
bash scripts/render.sh <engine> <slug> <out_dir>/<slug>_v1.mp4                         # finished film, mix → −16 LUFS
```
`render.sh` renders the composition with its soundtrack, normalises the mix to −16 LUFS and writes a contact sheet next to the MP4.

## 7. QA checklist (do every item before showing anyone)
**Story and facts**
- [ ] The hook is line 1, in second person, with a concrete object or number.
- [ ] 20–40 s total; the voice ends 2–4 s before the end for the title card.
- [ ] Every fact matches its primary source (numbers, units, what was measured); the source is cited on the card or in `BRIEF.md`.
- [ ] No channel's characters, story, title, colours or layout are copied.

**Timing**
- [ ] Every shot starts on (or 2–3 frames before) its key word; the action lands on the word (`key` → the key slides out).
- [ ] Captions change exactly with the words: spot-check 3 words in the final MP4.
- [ ] No shot is shorter than 1.3 s or longer than 6 s (cards can run to ~4.5 s).

**Look**
- [ ] Ink outline is the same weight on every character (7 px at scale 1); heads are perfect circles.
- [ ] One warm light per set, one saturated costume colour per character.
- [ ] Captions never sit on a face and never touch the edges; text on cards is ≥ 26 px.
- [ ] Nothing important in the top 120 px or bottom 300 px.
- [ ] Each shot has one slow push; nothing jitters (check two adjacent frames).

**Sound**
- [ ] Integrated loudness −16 ± 1 LUFS; music never masks a word; every SFX lands on its picture beat.
- [ ] No SFX stacks (≤ 2 in any 10 frames); the signature sound is in a voice pause.

**Files**
- [ ] `out/<slug>_v1.mp4` is 1080×1920, 30 fps, H.264 + AAC, and the duration is right.
- [ ] `BRIEF.md` holds the story as sent, the voice and take, the music/ambience/SFX, the cue table and the fact check.
- [ ] The contact sheet has been looked at frame by frame.

## Files in this skill
- `references/story.md`: premise formulas, niches, series and vote mechanics, fact rules.
- `references/visual-grammar.md`: character construction numbers, palettes, sets, cards, camera and caption specs.
- `references/pipeline.md`: every command, both voice routes, file layout, troubleshooting.
- `references/sound.md`: the sound library (prompts, trimming), mix levels, SFX placement, checking the mix.
- `assets/template/`: `kit.tsx` (helpers, `Figure`, `Face`, `Shots`, `Captions`, `Glint`, `Grain`, `Soundtrack`), `Film.tsx` (The Wallet, the worked example), `words.ts`, `index.tsx`, `entry.tsx`.
- `scripts/`: `new_film.sh`, `cues.py`, `tts.py`, `transcribe.py`, `make_ambience.sh`, `stills.sh`, `render.sh`.
- `SETUP.md`: the install and setup guide for someone receiving this skill.
