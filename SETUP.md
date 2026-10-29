# Stick-figure shorts with Claude Code: setup guide

This skill lets Claude Code make 20–60 second stick-figure story videos (16:9 for YouTube by default, 9:16 on request). Claude writes the story, ElevenLabs voices it, and Claude draws every frame in code with Remotion. No AI image or video generator is used.

## What you need
| Tool | Why | Cost |
|---|---|---|
| **Claude Code** | Runs the skill: writes the story, draws the frames, renders | Needs a Claude plan that includes Claude Code |
| **Node.js 18+** | Remotion (the video renderer) runs on it | Free |
| **ffmpeg** | Adds the voice to the video | Free |
| **Python 3** | Turns the voice into word timings for the captions | Free |
| **ElevenLabs** | The narrator voice | The free plan is enough to try it (see licences below) |

macOS: `brew install node ffmpeg python`. Windows: install Node.js, Python and ffmpeg from their sites, or use WSL.

## Install (5 minutes)
1. Put the `stick-figure-shorts` folder in your Claude skills folder, either by cloning it (`git clone <repo-url> ~/.claude/skills/stick-figure-shorts`) or by unzipping it there:
   - macOS/Linux: `~/.claude/skills/stick-figure-shorts/`
   - Windows: `%USERPROFILE%\.claude\skills\stick-figure-shorts\`
2. For word timings, install faster-whisper once: `pip install faster-whisper`. (You can skip this if you use the ElevenLabs API route, which returns timings itself.)
3. Connect ElevenLabs, either way works:
   - **Connector:** in Claude, add the ElevenLabs connector and sign in. Claude can then pick voices and generate speech for you.
   - **API key:** create one at elevenlabs.io (Profile → API keys) and set `ELEVENLABS_API_KEY` in your terminal.
4. Restart Claude Code so it sees the new skill.

## Your first video
Open Claude Code in an empty folder and paste:

> Use the stick-figure-shorts skill. Make a 30-second 16:9 story for YouTube about the Monty Hall problem: "You're on a game show. Three doors." Act the odds out (no fact cards) and end on a question. Voice it with ElevenLabs and draw every frame in code.

Claude will write the story (and check any facts), generate the voice, time the captions to the words, build the scenes, add music and sound effects, show you test frames, then render `out/<name>_v1.mp4`.

Then try your own: a money fact, a history "day in the life", a psychology dilemma, a kids' fable. One premise per video.

## Sound (music + effects)
The films are finished with a music bed, a quiet ambience and sound effects. The first time, ask Claude to "make the sound library" and it generates 16 effects and 3 music beds with ElevenLabs (prompts in `references/sound.md`; roughly 17 credits per effect and 900 per music bed) and builds the ambience beds for free with ffmpeg. Every later video reuses the same library.

## Licences: read before you monetise
- **ElevenLabs:** the free plan gives a small monthly credit allowance (about 10,000 credits at the time of writing; one 30 s take used ~424) but **no commercial licence**. To post on a monetised channel or make videos for clients, you need a paid plan (Starter or above). Check elevenlabs.io/pricing for current terms.
- **Remotion:** free for individuals and companies with up to 3 employees; bigger companies need a Remotion company licence (remotion.dev/license).
- **YouTube:** ad revenue needs the YouTube Partner Program, which has its own eligibility rules, and YouTube can demonetise mass-produced, repetitive content. Make each video a genuinely new story.
- **Originality:** the stick-figure style is a genre anyone can use. Don't copy another channel's characters, stories, titles or branding.

## Troubleshooting
- *"Could not find composition"*: ask Claude to render through the project's `entry.tsx`.
- *Captions are out of sync*: ask Claude to re-run `cues.py` with `--lead 15` and re-render.
- *Fonts look wrong*: the first render downloads Google Fonts, so stay online.
