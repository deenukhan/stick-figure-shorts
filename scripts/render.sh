#!/bin/bash
# Render the finished film (the composition carries the whole mix: narration, music, ambience, SFX via <Soundtrack>),
# bring the mix to -16 LUFS (measured gain + limiter at -1.5 dBTP), and write a contact sheet.
# usage: render.sh <engine-dir> <slug> <out.mp4> [extra remotion args, e.g. --scale=0.75 for a 16:9 film]
set -e
ENGINE="$1"; SLUG="$2"; OUT="$3"; shift 3
RAW="${OUT%.mp4}_raw.mp4"
(cd "$ENGINE" && npx remotion render "src/projects/$SLUG/entry.tsx" "$SLUG-FILM" "$RAW" --concurrency=4 --log=error "$@" 2>&1 | grep -v -i "webpack\|install-scripts\|react-dom" || true)
# measure, then gain + limiter (a single loudnorm pass can stop short of −16 when the true-peak ceiling bites)
I=$(ffmpeg -i "$RAW" -af ebur128=framelog=quiet -f null - 2>&1 | awk '/^ +I:/{print $2}' | tail -1)
GAIN=$(python3 -c "print(round(-16 - float('$I'), 2))")
ffmpeg -v error -y -i "$RAW" -c:v copy -af "volume=${GAIN}dB,alimiter=limit=0.84:level=false" -c:a aac -b:a 192k -ar 48000 "$OUT"
echo "loudness: $I LUFS → gain ${GAIN} dB → $(ffmpeg -i "$OUT" -af ebur128=framelog=quiet -f null - 2>&1 | awk '/^ +I:/{print $2}' | tail -1) LUFS"
rm -f "$RAW"
ffmpeg -v error -y -i "$OUT" -vf "fps=1/1.5,scale=180:-1,tile=13x2" -frames:v 1 "${OUT%.mp4}_sheet.jpg"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of compact "$OUT"
echo "-> $OUT  (+ ${OUT%.mp4}_sheet.jpg)"
