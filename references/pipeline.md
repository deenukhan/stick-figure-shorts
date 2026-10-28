# Pipeline: every command

## Contents
1. File layout
2. Voice route A: the ElevenLabs connector in Claude
3. Voice route B: the ElevenLabs API (`tts.py`)
4. Word timings and cues
5. Build, preview, QA, render
6. Troubleshooting
7. NeuralTechAI studio notes

## 1. File layout
```
<engine>/src/projects/<slug>/      kit.tsx · Film.tsx · words.ts · index.tsx · entry.tsx
<public>/projects/<slug>/          narration.wav (−16 LUFS)
<public>/projects/stick-sound-library/  sfx_*.mp3 · music_*.mp3 · amb_*.mp3
<project>/input/                   narration_takeA.mp3 · narration_takeB.mp3 · transcript_takeA.json · script.txt
<project>/out/                     <slug>_v1.mp4 · <slug>_v1_muted.mp4 · <slug>_v1_sheet.jpg · qa/
<project>/BRIEF.md                 story as sent · voice + take · cue table · fact check
```
`<project>` can be any folder next to the engine (the NeuralTechAI studio uses `projects/<slug>/`).

## 2. Voice route A: the ElevenLabs connector in Claude
1. `creative_list_voices` with `search: "narrator storytelling"`, `languages: ["en"]`, `use_cases: ["narrative_story"]` (add `gender` or `accent` if the brief says so). Pick a clear, natural narrator. The Wallet used **Tyler – Natural American Narrator** (`xS4rWdm7XjmSzwmzOl3j`).
2. `creative_generate_speech` with `model_id: "eleven_v4"`, `generations_count: 2`, the script as `prompt` (tags in square brackets). It returns a `flow_id` and generation ids. About 424 credits per 26 s take for The Wallet.
3. `creative_get_generations` with the flow id and both generation ids → `full_res_url` for each completed take. Download straight away (the signed link expires in 2 hours):
   `curl -s -o input/narration_takeA.mp3 '<full_res_url>'`
4. Never call generate again to "retry": every call spends credits.

## 3. Voice route B: the ElevenLabs API (`tts.py`)
```bash
export ELEVENLABS_API_KEY=...            # from elevenlabs.io → Profile → API keys
python3 scripts/tts.py <voice_id> input/script.txt input/narration_takeA.mp3 --json input/transcript_takeA.json
```
It uses the `with-timestamps` endpoint, so the transcript comes from ElevenLabs' own character alignment (no whisper needed). Run it twice for two takes. If the API rejects `eleven_v4` for your account, pass `--model eleven_multilingual_v2` and remove the [tags].

## 4. Word timings and cues
```bash
# route A only (route B already wrote the transcript):
python3 scripts/transcribe.py input/narration_takeA.mp3 --lang en --out input/transcript_takeA.json
python3 scripts/cues.py input/transcript_takeA.json <engine>/src/projects/<slug>/words.ts --lead 15
```
- `transcribe.py` needs `pip install faster-whisper`. The medium model is accurate for English; `--model small` is faster.
- `cues.py` glues split numbers ("17" + ",000"), prints `frame end word` for every word, and writes `WORDS`, `CHUNKS` and `VOICE_END`.
- Compare takes: `ffmpeg -i take.mp3 -af silencedetect=n=-40dB:d=0.25 -f null - 2>&1 | grep silence_duration`. Longer pauses on the key beats = better drama.
- Film length = `VOICE_END` + ~100–120 frames (title card + fade). Set `FILM_FRAMES` in `Film.tsx`.

## 5. Build, preview, QA, render
```bash
bash scripts/new_film.sh <slug> <engine>                       # or no engine → standalone project
cd <engine> && npx remotion studio src/projects/<slug>/entry.tsx   # live preview
bash scripts/stills.sh <engine> <slug> <project>/out/qa 60 150 240 310 370 470 600 700 850
bash scripts/render.sh <engine> <slug> <project>/out/<slug>_v1.mp4
```
- Look at `qa/sheet.jpg` before the full render; fix layout there (it's 10× faster).
- The soundtrack is inside the composition (`<Soundtrack>`, see `sound.md`); `render.sh` normalises the finished mix to −16 LUFS, the usual loudness for social video.
- Render time for 900 frames at 1080×1920 is a few minutes on a laptop.

## 6. Troubleshooting
| Symptom | Fix |
|---|---|
| "Could not find composition" | Render through `src/projects/<slug>/entry.tsx` and use the id `<slug>-FILM`. |
| The main bundle fails because of another project | Exactly why every film has its own `entry.tsx`. Never render via `src/index.ts`. |
| Captions are early or late | Check `--lead` (15) matches `voiceAt` in `<Soundtrack>` (default 15). |
| A figure's arm points the wrong way | `armL/armR`: positive = forward (towards `facing`). Use `elbow*` for bends. |
| Blur looks blocky | Blur the set, not the figure; keep `stdDeviation` ≤ 14. |
| Fonts fall back to serif/sans | `@remotion/google-fonts` loads at render time; the machine needs internet on the first render. |

## 7. NeuralTechAI studio notes (Deenu's machine)
- Engine: `Claude Code Projects/neuraltechai-motion-graphics/engine/`; project folders in `projects/<slug>/`.
- The studio venv already has faster-whisper: `~/.neuraltech-motion-graphics/venv/bin/python ~/.claude/skills/neuraltech-ai-motion-graphics/scripts/transcribe.py …`.
- `new_project.sh` in the motion-graphics skill also registers projects in the main index; this skill's `new_film.sh` deliberately doesn't (render via `entry.tsx` only).
- Finished films are copied to `neuraltech.ai/carousel_engine/films/<slug>/` with `BRIEF.md` and `source/`.
