#!/bin/bash
# Synthesise the three 40 s ambience beds the films use (free, no API): city night hum, space capsule hum, quiet room tone.
# usage: make_ambience.sh <library-dir>      (e.g. public/projects/stick-sound-library)
set -e
L="$1"; [ -z "$L" ] && { echo "usage: make_ambience.sh <library-dir>"; exit 1; }
mkdir -p "$L"; cd "$L"
ffmpeg -v error -y -f lavfi -i "anoisesrc=color=brown:duration=40:amplitude=0.5:seed=3" -f lavfi -i "sine=frequency=120:duration=40" \
  -filter_complex "[0]highpass=f=50,lowpass=f=420,volume=0.9[n];[1]volume=0.012[h];[n][h]amix=inputs=2:normalize=0,afade=t=in:d=1,afade=t=out:st=38:d=2,loudnorm=I=-30" -ar 48000 -ac 2 amb_city_night.mp3
ffmpeg -v error -y -f lavfi -i "anoisesrc=color=pink:duration=40:amplitude=0.3:seed=5" -f lavfi -i "sine=frequency=60:duration=40" \
  -filter_complex "[0]highpass=f=120,lowpass=f=1500,volume=0.6[n];[1]volume=0.05[h];[n][h]amix=inputs=2:normalize=0,afade=t=in:d=1,afade=t=out:st=38:d=2,loudnorm=I=-32" -ar 48000 -ac 2 amb_space_capsule.mp3
ffmpeg -v error -y -f lavfi -i "anoisesrc=color=brown:duration=40:amplitude=0.3:seed=9" \
  -filter_complex "[0]highpass=f=80,lowpass=f=300,afade=t=in:d=1,afade=t=out:st=38:d=2,loudnorm=I=-36" -ar 48000 -ac 2 amb_room_tone.mp3
echo "-> $L/amb_city_night.mp3, amb_space_capsule.mp3, amb_room_tone.mp3"
