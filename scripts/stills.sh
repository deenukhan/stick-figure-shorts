#!/bin/bash
# QA: render frames of a film through its own entry.tsx and tile them into one contact sheet.
# usage: stills.sh <engine-dir> <slug> <out-dir> <frame> [frame...]
set -e
ENGINE="$1"; SLUG="$2"; OUT="$3"; shift 3
mkdir -p "$OUT"; cd "$ENGINE"; IN=()
for fr in "$@"; do
  npx remotion still "src/projects/$SLUG/entry.tsx" "$SLUG-FILM" "$OUT/f$fr.png" --frame="$fr" --scale=0.5 --log=error 2>&1 | grep -v -i "webpack\|install-scripts" || true
  IN+=(-i "$OUT/f$fr.png")
done
ffmpeg -v error -y "${IN[@]}" -filter_complex "hstack=$#" "$OUT/sheet.jpg"
echo "-> $OUT/sheet.jpg"
