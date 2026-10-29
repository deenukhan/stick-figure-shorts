---
name: stick-figure-shorts
description: Makes original stick-figure story films (20–60 s, 16:9 for a YouTube channel by default, 9:16 on request) drawn entirely in code, with SVG and React in Remotion, voiced with ElevenLabs and timed word by word. The look is white round-head characters with ink outlines and stick limbs on moody one-light sets. Every idea is acted out by the characters and props; the only text is plain subtitles (no fact cards, no typography). Use whenever the user wants a stick-figure, stickman or "white head" cartoon story video, a faceless story or explainer video, a "you" second-person dilemma story, an animated fact story for a faceless YouTube or Instagram page, or asks to make "videos like this" from a stick-figure reference. Also use to plan a series for such a channel, or to fix the timing, subtitles or look of a film made with this skill.
---

# Stick-figure shorts

One skill, one pipeline: **story → voice → word timings → shots in code → sound design → render → QA**. Nothing is AI-generated except the audio (voice, and optionally the music and SFX library). Every character, set and prop is SVG drawn by Claude, so the result is original, consistent and cheap to repeat daily.

Worked example: **"Three Doors"** (16:9, 33.6 s, the Monty Hall problem acted out with glowing orbs), whose source is `assets/template/`. Copying it and changing the story is the fastest start. Second example: **"The Lost Phone"** (`assets/examples/lost-phone-16x9/`), a 59 s thriller with two motion styles, frames-only and full animation.

## The rules (from the creator's feedback, 2026-10-29)
1. **Animation first.** Every idea is shown by the characters, props, light and camera, so a viewer gets it with the sound off. Facts are acted out, never put on a card (patterns in `references/visual-grammar.md` §6).
2. **The only always-on text is plain subtitles.** One line, all white, no karaoke highlight.
3. **In-scene text only as a premium complement:** one short piece at a time, on a prop or the set, in the film's own style, timed to the word (door signs flipping to "2/3", a price tag on a briefcase, a desk calendar, the real screen of a phone the character holds).
4. **Never:** fact cards, full-screen typography, chips, stakes tags, stamps, meters, floating labels, title cards or on-screen source lines. They read as "AI slop". Sources go in `BRIEF.md`.
5. **16:9 only** for the main channel, unless someone asks for 9:16.

## 0. Before you start
- **Ask for (or pick):** the premise, the niche, the language, the length (30 s or 60 s), and whether it ends on a question (engagement) or a twist (story). Default: English, 16:9, ~30 s, ending on a question.
- **Originality:** the genre (round white heads, stick limbs, "you" stories) is free to use. A specific channel's characters, costumes, story, title, colours and on-screen furniture are not. Invent your own cast (one costume colour + one hair or hat detail each).
- **Facts:** if the story uses a fact, find the primary source first and keep the numbers exact. See `references/story.md` → "Fact rules". Then decide **how the characters will act it out** before writing shots.

## 1. Story: hook → problem → twist → payoff (30 s ≈ 55–95 words, 60 s ≈ 140–160)
| Beat | Time (30 s) | Job | Example (Three Doors) |
|---|---|---|---|
| Hook | 0–3 s | Second person, present tense, concrete stakes in the first line | "You're on a game show. Three doors." |
| Problem | 3–15 s | The choice or danger, made specific | "You pick door number one… he opens door three. A goat." |
| Twist | 15–25 s | A real fact or turn that flips the expectation | "It feels like fifty-fifty. It isn't." |
| Payoff | 25–29 s | What it means, shown as an action | "Your first pick only had a one-in-three chance." |
| Question | last 3 s | One short line to the viewer; hold on the hero (no title card) | "So… would you switch?" |

- Short sentences, 3–9 words. Write pauses with "..." (ElevenLabs honours them).
- One hero, at most two other characters.
- Read `references/story.md` for premise formulas, niche ideas, series hooks and the fact rules.

## 2. Visual grammar (full spec: `references/visual-grammar.md`)
- **Canvas:** a 2560×1440 world rendered at `--scale=0.75` (1920×1080), 30 fps. Subtitles at top y 1290. The hero on the left third, the second character on the right, the set or object in the middle.
- **Characters** (`<Figure>` in `kit.tsx`): a white circle head (r 62) with a **7 px ink outline**, dot eyes, brows that carry the mood (`neutral · worried · sly · happy · surprised · sad`), a small mouth. Limbs are **single 9 px ink lines**, hands are white mittens, feet are chunky white sneakers. **One costume colour on the torso** identifies each character.
- **Light:** dark desaturated sets + **one motivated light per shot** (a lamp cone, a spotlight, a phone screen, headlights) + the hero's costume colour as the only saturated hue. Rain, dust or confetti always moving in the air.
- **Two motion styles** (§7 of the grammar):
  - **frames-only:** held tableaux with small life, plus a handheld drift, push-ins, impact shakes and a 2-frame black dip before the big reveal;
  - **full animation:** the characters walk, turn, reach and flinch.
- **Camera:** cuts every 2.5–4 s; each shot gets one slow eased push (1.00 → 1.04–1.14).
- **Shot rotation:** wide → insert → medium → close-up → the acted-out fact → payoff wide → close-up on the question.

## 3. Voice: ElevenLabs with word-timed cues (detail: `references/pipeline.md`)
1. **Pick a voice** that fits: a clear, natural narrator (calm with a little suspense) for most stories, a mystery narrator for thrillers, a storyteller for kids' fables. With the ElevenLabs connector: `creative_list_voices` (search "narrator storytelling", `use_cases: ["narrative_story"]`).
2. **Generate** with `eleven_v4` (1–2 takes). Light audio tags only, at the start of a beat: `[calm, a little suspense]`, `[quietly]`, `[softly]`. Connector: `creative_generate_speech` → `creative_get_generations` → download `full_res_url` with curl (the link expires in 2 hours). API alternative: `scripts/tts.py`.
3. **Word timings:** `transcribe.py` (faster-whisper) or whisper.cpp (`whisper-cli -ml 1 -sow -oj`) → `transcript_takeA.json`. `scripts/tts.py` writes the same file straight from ElevenLabs' alignment.
4. **Cues:** `python3 scripts/cues.py transcript_takeA.json <project>/words.ts --lead 15` writes `WORDS` and `CHUNKS` (subtitle groups) and prints the cue table. **Film frame = 15 + round(seconds × 30).** Put every key word's frame at the top of `Film.tsx` and in `BRIEF.md`, and start each shot's beat on its word.

## 4. Build in Remotion
1. **Scaffold:** `bash scripts/new_film.sh <slug> <remotion-engine-dir>` copies `assets/template/` into `src/projects/<slug>/` (kit.tsx, Film.tsx, index.tsx, entry.tsx, words.ts) and renames the ids. With no engine dir, it creates a standalone Remotion project and runs `npm install`.
2. **Write `Film.tsx`:** a `SHOTS: ShotDef[]` list, each `{from, to, z0, z1, fx, fy, render(f)}`, plus your sets, props and the acting. Keep `kit.tsx` generic; story drawing lives in `Film.tsx`.
3. **Animate on the words:** `keys(f, [[frame, value]…])` for eased keyframes, `pop(f, at)` for pop-ins, `eout(ramp(f, a, b))` for slides, `blinkAt(f, seed)` for blinks, `walk={f * 0.3}` for walk cycles.
4. **Always render through the project's own `entry.tsx`**, never the main `src/index.ts` (one broken project anywhere breaks the main bundle).

## 5. Sound design (detail: `references/sound.md`)
The mix lives in the composition: `<Soundtrack total voice voiceEnd music amb ambVol sfx />` from `kit.tsx`.
1. **Narration:** `ffmpeg -i input/narration_takeA.mp3 -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 48000 <public>/projects/<slug>/narration.wav`. It plays from frame 15.
2. **Library (once):** SFX + music beds made with ElevenLabs (prompts in `references/sound.md`, ~17 credits per SFX, ~900 per bed) + ambience beds from `scripts/make_ambience.sh` (free). Trim SFX to their first hit.
3. **Pick per film:** one music bed, one ambience, and an `SFX` list `[frame, name, volume]`: story sounds on their picture beats (a coin clink, a door creak, a phone buzz), one signature sound, hits only in voice pauses.
4. **Levels:** voice 1.0 · music 0.2 under the voice, 0.34 after · ambience 0.5–0.7 · SFX 0.25–0.6. Final mix −16 LUFS (30 s films) or −14 LUFS (60 s YouTube stories).

## 6. Render
```bash
bash scripts/stills.sh <engine> <slug> <out_dir> 60 150 240 310 370 470 600 700 850   # QA stills + sheet
bash scripts/render.sh <engine> <slug> <out_dir>/<slug>_v1.mp4 --scale=0.75            # finished film, mix → −16 LUFS
```
`render.sh` renders the composition with its soundtrack, normalises the mix and writes a contact sheet next to the MP4. Extra arguments go to `remotion render`.

## 7. QA checklist (do every item before showing anyone)
**Story and facts**
- [ ] The hook is line 1, in second person, with a concrete object or number.
- [ ] Every fact matches its primary source (numbers, units, what was measured); the source is in `BRIEF.md`.
- [ ] No channel's characters, story, title, colours or layout are copied.

**Text (the rules above)**
- [ ] With the sound off, every idea still reads from the animation.
- [ ] No fact cards, chips, tags, stamps, meters, floating labels or title cards anywhere.
- [ ] Any in-scene text is one short piece on a prop or the set, timed to its word.
- [ ] Subtitles are plain (one colour, no highlight) and never sit on a face.

**Timing**
- [ ] Every shot starts on (or 2–3 frames before) its key word; the action lands on the word.
- [ ] Subtitles change exactly with the words: spot-check 3 words in the final MP4.
- [ ] No shot is shorter than 1 s or longer than 6 s.

**Look**
- [ ] Ink outline is the same weight on every character (7 px at scale 1); heads are perfect circles.
- [ ] One motivated light per shot, one saturated costume colour per character.
- [ ] Each shot has one slow push (plus the chosen style's handheld or shakes); nothing jitters by accident.

**Sound**
- [ ] Integrated loudness on target (−16 or −14 ± 1 LUFS); music never masks a word; every SFX lands on its picture beat.

**Files**
- [ ] The MP4 is 1920×1080 (or 1080×1920), 30 fps, H.264 + AAC, and the duration is right.
- [ ] `BRIEF.md` holds the story as sent, the voice and take, the music/ambience/SFX, the cue table, how each fact is acted out, and the fact check.
- [ ] The contact sheet has been looked at frame by frame.

## Files in this skill
- `references/visual-grammar.md`: the text rule, character construction, light, staging, **acting out facts**, the two motion styles, camera, subtitles.
- `references/story.md`: premise formulas, niches, series and vote mechanics, fact rules.
- `references/pipeline.md`: every command, both voice routes, file layout, troubleshooting.
- `references/sound.md`: the sound library (prompts, trimming), mix levels, SFX placement.
- `assets/template/`: "Three Doors" (16:9): `kit.tsx` (helpers, `Figure`, `Face`, `Shots`, plain `Captions`, `Glint`, `Grain`, `Soundtrack`), `Film.tsx`, `words.ts`, `index.tsx`, `entry.tsx`.
- `assets/examples/lost-phone-16x9/`: "The Lost Phone", a 59 s thriller: rain, a phone, photos, the EXIF fact acted out, one `Film.tsx` with a `motion` prop for the frames-only and full-animation cuts.
- `scripts/`: `new_film.sh`, `cues.py`, `tts.py`, `transcribe.py`, `make_ambience.sh`, `stills.sh`, `render.sh`.
- `SETUP.md`: the install and setup guide for someone receiving this skill.
