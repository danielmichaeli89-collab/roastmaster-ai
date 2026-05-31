#!/usr/bin/env bash
# Copy the newest available render for each camera into public/scenes/ under the
# filenames the Studio Viewer expects. Prefers v2 over v1 when both exist.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/public/scenes"
mkdir -p "$DEST"

# camera (render name) -> scene hero filename used by src/data/scenes.ts
declare -A MAP=(
  [counter_hero]=counter_hero.jpg
  [entrance]=entrance.jpg
  [equipment]=equipment.jpg
  [brew_lab]=brew_lab.jpg
  [seating]=seating.jpg
  [audiophile]=audiophile.jpg
  [operator]=operator.jpg
)

for cam in "${!MAP[@]}"; do
  src=""
  for ver in v4 v3 v2 v1; do
    cand="$ROOT/blender/out/$ver/$cam.jpg"
    [ -f "$cand" ] && { src="$cand"; break; }
  done
  if [ -n "$src" ]; then
    cp "$src" "$DEST/${MAP[$cam]}"
    echo "synced $cam <- $(echo "$src" | sed "s|$ROOT/||")"
  fi
done
echo "done -> $DEST"
ls -la "$DEST"
