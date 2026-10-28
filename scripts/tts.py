"""ElevenLabs text-to-speech WITH word timings, via the API (the route when the ElevenLabs connector isn't available).

usage: ELEVENLABS_API_KEY=... python3 tts.py <voice_id> <script.txt> <out.mp3> [--model eleven_v4] [--json transcript.json]
Calls POST /v1/text-to-speech/{voice_id}/with-timestamps, saves the MP3, and turns the character alignment into the same
word list transcribe.py writes ([{s, e, t, words:[{w, s, e}]}]), so cues.py works on either.
Audio tags like [calm] are removed from the word list (they're spoken as direction, not words).
If your account rejects the model id, try --model eleven_multilingual_v2. Each call spends credits.
"""
import argparse, base64, json, os, re, sys, urllib.request

ap = argparse.ArgumentParser()
ap.add_argument("voice_id")
ap.add_argument("script")
ap.add_argument("out")
ap.add_argument("--model", default="eleven_v4")
ap.add_argument("--json", default=None)
a = ap.parse_args()
key = os.environ.get("ELEVENLABS_API_KEY") or sys.exit("set ELEVENLABS_API_KEY")
text = open(a.script).read().strip()

req = urllib.request.Request(
    f"https://api.elevenlabs.io/v1/text-to-speech/{a.voice_id}/with-timestamps",
    data=json.dumps({"text": text, "model_id": a.model}).encode(),
    headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "application/json"},
)
res = json.load(urllib.request.urlopen(req))
open(a.out, "wb").write(base64.b64decode(res["audio_base64"]))
al = res.get("alignment") or res.get("normalized_alignment")

# characters → words (a word = a run of non-space characters, minus [tags])
words, cur, inside_tag = [], None, False
for ch, s, e in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
    if ch == "[": inside_tag = True
    if inside_tag:
        if ch == "]": inside_tag = False
        continue
    if ch.isspace():
        if cur: words.append(cur); cur = None
        continue
    if cur is None: cur = {"w": ch, "s": round(s, 2), "e": round(e, 2)}
    else: cur["w"] += ch; cur["e"] = round(e, 2)
if cur: words.append(cur)
words = [w for w in words if re.search(r"\w", w["w"])]

out = a.json or os.path.splitext(a.out)[0] + "_transcript.json"
json.dump([{"s": words[0]["s"], "e": words[-1]["e"], "t": " ".join(w["w"] for w in words), "words": words}], open(out, "w"), indent=1)
print(f"-> {a.out} + {out}  ({len(words)} words, {words[-1]['e']:.2f} s)")
