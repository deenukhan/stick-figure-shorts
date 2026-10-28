"""Word-level timestamps for an A-roll/voiceover, used to time every graphic beat to the spoken word.

usage: python transcribe.py <audio-or-video> [--model medium] [--lang hi|en|auto] [--out transcript.json]
Writes <out> as [{s, e, t, words:[{w, s, e}]}] and prints "start end word" lines.
Hinglish creators: --lang hi usually gives the best timings (words come out romanised or in Devanagari).
Needs: pip install faster-whisper  (the first run downloads the model).
"""
import argparse, json, warnings
warnings.filterwarnings("ignore")  # harmless numpy matmul warnings from the feature extractor
from faster_whisper import WhisperModel

ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("--model", default="medium")
ap.add_argument("--lang", default="auto")
ap.add_argument("--out", default="transcript.json")
a = ap.parse_args()
m = WhisperModel(a.model, device="cpu", compute_type="int8")
segs, info = m.transcribe(a.src, word_timestamps=True, vad_filter=True, language=None if a.lang == "auto" else a.lang)
res = []
for s in segs:
    ws = [{"w": w.word, "s": round(w.start, 2), "e": round(w.end, 2)} for w in (s.words or [])]
    res.append({"s": round(s.start, 2), "e": round(s.end, 2), "t": s.text, "words": ws})
    for w in ws:
        print(f'{w["s"]:8.2f} {w["e"]:8.2f} {w["w"]}')
json.dump(res, open(a.out, "w"), ensure_ascii=False, indent=1)
print(f"-> {a.out}  ({info.language}, {sum(len(r['words']) for r in res)} words)")
