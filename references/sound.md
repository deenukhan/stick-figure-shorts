# Sound design

The film is finished inside Remotion: `<Soundtrack>` in `kit.tsx` plays the narration, a music bed, an ambience bed and every SFX on its frame, so the render comes out mixed. `render.sh` then normalises the whole mix to −16 LUFS.

## Contents
1. The library (make it once, reuse it forever)
2. Prompts for every sound
3. Mix levels
4. Placing SFX
5. Checking the mix without ears

## 1. The library
All films read from one folder: `<public dir>/projects/stick-sound-library/` (`LIB("sfx_pop")` → `staticFile("projects/stick-sound-library/sfx_pop.mp3")`). In the NeuralTechAI studio the public dir is `neuraltechai-motion-graphics/assets/`; in a standalone project it's `public/`.

Make it once:
- **SFX:** ElevenLabs sound effects (`creative_generate_in_flow`, `node_type: "sfx"`, `model_id: "eleven_text_to_sound_v2"`, `generations_count: 1`). About 17 credits each.
- **Music beds:** ElevenLabs Music (`node_type: "music"`, `model_id: "eleven_music_v2_5"`), 35 s each, instrumental. About 900 credits each. Price first with `estimate_only: true`.
- **Ambience beds:** `bash scripts/make_ambience.sh <library-dir>` synthesises three 40 s beds with ffmpeg (free). Generated ambiences tend to come back too short to loop.
- Put all generations on **one flow** and download every `full_res_url` with curl straight away (links expire in 2 hours).
- **Trim** each SFX to its first clean hit: generators often pad with silence or repeat the sound. Find the regions with `ffmpeg -i f.mp3 -af silencedetect=n=-40dB:d=0.12 -f null -`, then `atrim=start:end,asetpts=PTS-STARTPTS,afade=t=out:st=<len-0.04>:d=0.04`. Keep the untrimmed files in `raw/`.

## 2. Prompts for every sound
| File | Prompt |
|---|---|
| sfx_whoosh | Soft airy whoosh transition, quick and clean, cartoon style, 0.6 seconds |
| sfx_pop | Single soft cartoon bubble pop, clean UI pop sound, 0.3 seconds |
| sfx_sparkle | Magical sparkle glint, short bright shimmer chime, 1 second |
| sfx_footsteps | Sneaker footsteps walking on a wet city pavement at night, six steps, then stop, 2 seconds |
| sfx_counter | Fast mechanical number counter ticking up, rapid soft clicks speeding up then stopping with a small ding, 2 seconds |
| sfx_card_slide | Paper card sliding onto a table, soft swish and tap, 0.7 seconds |
| sfx_coin | Single copper coin dropped on a wooden table, bright clink and short spin, 1 second |
| sfx_cha_ching | Classic cash register cha-ching with coins, cheerful, 1.2 seconds |
| sfx_heart_chime | Warm gentle two-note harp and bell chime, heartwarming moment, 1.5 seconds |
| sfx_drumroll | Short snare drumroll building tension, ending with a cymbal crash, game show, 2 seconds |
| sfx_ding | Bright game show correct answer ding ding, cheerful bell, 1 second |
| sfx_door_creak | Wooden door creaking open slowly, short, 1.5 seconds |
| sfx_clock_tick | Wall clock tick tock, slow and clear, in a quiet room, 4 seconds |
| sfx_gulp | Cartoon nervous gulp swallow sound, funny, 0.6 seconds |
| sfx_goat | A single funny goat bleat, baa, clear and close, 1 second |
| sfx_reveal_hit | Soft cinematic reveal hit, deep low boom with a short airy tail, not too loud, 1.5 seconds |
| music_suspense | Instrumental only, 35 seconds. Curious, light-suspense underscore: soft pizzicato strings, muted marimba and a gentle ticking pulse, warm low synth pad, medium-slow tempo around 92 BPM. Sparse and quiet so a narrator sits clearly on top; a small warm lift in the last 10 seconds, then a soft ending. |
| music_playful | Instrumental only, 35 seconds. Playful, light and curious: plucky ukulele, glockenspiel melody, soft brushed snare and upright bass, bouncy medium tempo around 104 BPM. Gentle and quiet under a narrator, building slightly with a cheerful lift in the last 10 seconds, then a soft clean ending. |
| music_ambient | Instrumental only, 35 seconds. Ambient cinematic wonder: slow evolving synth pads, soft felt piano notes, airy shimmer and a distant low drone, no drums, very slow around 70 BPM. Calm and spacious under a narrator, a gentle swell around the middle and a quiet, open ending. |

Music prompts describe the sound (genre, mood, instruments, tempo, how energy moves), never the story.

## 3. Mix levels (the `Soundtrack` defaults)
| Layer | Level | Notes |
|---|---|---|
| Narration | 1.0 | pre-normalised to −16 LUFS (`loudnorm=I=-16:TP=-1.5:LRA=11`) as `narration.wav` |
| Music | 0.2 under the voice → 0.34 after `voiceEnd` | fades in over 20 frames, out over the last 40; ~17 dB under the voice |
| Ambience | 0.5–0.7 | the ffmpeg beds are already quiet (−30 to −38 dB) |
| SFX | 0.25–0.5 | whooshes 0.2–0.3; big hits only in voice pauses |

Films longer than the 35 s bed: `musicAt = FILM_FRAMES - 1050`, so the bed covers the ending.

## 4. Placing SFX
- `SFX: Sfx[] = [[frame, "name", volume], …]` in `Film.tsx`. Frames are composition frames, the same as the cue table.
- A whoosh 2 frames before most cuts. Story sounds on their picture beat (the glint, the slide, the pop), starting 0–2 frames before the visual.
- At most two SFX in any 10 frames. Nothing loud on top of a key word; put hits in the gaps (`cues.txt` shows them).
- One signature sound per film is enough (the goat, the cha-ching). Don't decorate every beat.

## 5. Checking the mix without ears
```bash
ffmpeg -i out.mp4 -af ebur128=framelog=quiet -f null - 2>&1 | grep " I:"      # integrated loudness, target −16
ffmpeg -ss <t> -t 1 -i out.mp4 -vn -af volumedetect -f null - 2>&1 | grep mean   # a voice second vs a music-only second
```
Voice seconds should sit ~6–10 dB above music-only seconds after the voice ends, and the integrated loudness should be −16 ± 1 LUFS.
