#!/bin/bash
# Render the finished film (the composition carries the whole mix: narration, music, ambience, SFX via <Soundtrack>),
# normalise the mix to -16 LUFS, and write a contact sheet.
# usage: render.sh <engine-dir> <slug> <out.mp4>
set -e
ENGINE="$1"; SLUG="$2"; OUT="$3"
RAW="${OUT%.mp4}_raw.mp4"
(cd "$ENGINE" && npx remotion render "src/projects/$SLUG/entry.tsx" "$SLUG-FILM" "$RAW" --concurrency=4 --log=error 2>&1 | grep -v -i "webpack\|install-scripts\|react-dom" || true)
ffmpeg -v error -y -i "$RAW" -c:v copy -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 "$OUT"
rm -f "$RAW"
ffmpeg -v error -y -i "$OUT" -vf "fps=1/1.5,scale=180:-1,tile=13x2" -frames:v 1 "${OUT%.mp4}_sheet.jpg"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of compact "$OUT"
echo "-> $OUT  (+ ${OUT%.mp4}_sheet.jpg)"
