#!/bin/bash
# Scaffold a new stick-figure short from the template (The Wallet).
# usage: new_film.sh <slug> [remotion-engine-dir]
#   With an engine dir (a Remotion project with node_modules/remotion): copies the template to <engine>/src/projects/<slug>/.
#   Without one: creates a standalone Remotion project in ./<slug>-film/ and runs npm install.
# Ids are renamed: composition "<slug>-FILM", root component "<Name>Root". Render through src/projects/<slug>/entry.tsx.
set -e
SLUG="$1"; ENGINE="$2"
[ -z "$SLUG" ] && { echo "usage: new_film.sh <slug> [remotion-engine-dir]"; exit 1; }
[[ "$SLUG" =~ ^[a-z0-9-]+$ ]] || { echo "slug must be lowercase letters, numbers, dashes"; exit 1; }
TPL="$(cd "$(dirname "$0")/../assets/template" && pwd)"
NAME=$(echo "$SLUG" | python3 -c "import sys;print(''.join(w.capitalize() for w in sys.stdin.read().strip().split('-')))")
if [ -z "$ENGINE" ]; then
  ENGINE="$PWD/$SLUG-film"; mkdir -p "$ENGINE/src"
  cat > "$ENGINE/package.json" <<JSON
{
  "name": "$SLUG-film",
  "private": true,
  "scripts": { "studio": "remotion studio src/projects/$SLUG/entry.tsx" },
  "dependencies": {
    "@remotion/cli": "4.0.534",
    "@remotion/google-fonts": "4.0.534",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "remotion": "4.0.534"
  },
  "devDependencies": { "@types/react": "19.1.8", "typescript": "5.8.3" }
}
JSON
  (cd "$ENGINE" && npm install --silent)
  PUBLIC="$ENGINE/public"
  bash "$(dirname "$0")/make_ambience.sh" "$PUBLIC/projects/stick-sound-library" >/dev/null
fi
PUBLIC="${PUBLIC:-$ENGINE/public}"
[ -f "$ENGINE/remotion.config.ts" ] && grep -q setPublicDir "$ENGINE/remotion.config.ts" && \
  PUBLIC="$ENGINE/$(sed -n 's/.*setPublicDir("\(.*\)").*/\1/p' "$ENGINE/remotion.config.ts")"
mkdir -p "$PUBLIC/projects/$SLUG"
DEST="$ENGINE/src/projects/$SLUG"
[ -e "$DEST" ] && { echo "exists: $DEST"; exit 1; }
mkdir -p "$DEST"
cp "$TPL"/*.tsx "$TPL"/*.ts "$DEST/"
python3 - "$DEST" "$SLUG" "$NAME" <<'PY'
import sys, pathlib
d, slug, name = sys.argv[1:]
for f in pathlib.Path(d).glob("*.ts*"):
    s = f.read_text().replace("stick-wallet-story", slug).replace("StickWalletStoryRoot", f"{name}Root")
    f.write_text(s)
PY
echo "created $DEST"
echo "assets (narration.wav, frames) go in: $PUBLIC/projects/$SLUG/   ·   sound library: $PUBLIC/projects/stick-sound-library/"
[ -f "$PUBLIC/projects/stick-sound-library/sfx_pop.mp3" ] || echo "note: no SFX/music library yet: make it once (references/sound.md), or strip the music/sfx props from <Soundtrack> in Film.tsx"
echo "next: narration → transcribe/tts → cues.py → $DEST/words.ts, then rewrite $DEST/Film.tsx (shots + SFX)"
echo "preview: cd \"$ENGINE\" && npx remotion studio src/projects/$SLUG/entry.tsx"
