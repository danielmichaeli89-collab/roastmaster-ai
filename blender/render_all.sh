#!/usr/bin/env bash
# Render all 7 Nocture scenes sequentially. Each scene is a fresh bpy session
# (bpy can only be initialised once per process), so we shell out to python3
# for each one.
#
# Usage:
#   bash blender/render_all.sh [resolution] [samples] [outdir]
#   bash blender/render_all.sh 1920x1080 256 blender/out/v2
set -euo pipefail
RES="${1:-1600x900}"
SPP="${2:-128}"
OUT="${3:-blender/out/$(date +%Y%m%d_%H%M)}"
mkdir -p "$OUT"
SCRIPT="$(dirname "$0")/nocture_scene.py"

CAMS=(counter_hero entrance equipment brew_lab seating audiophile operator)
for cam in "${CAMS[@]}"; do
  echo "[render_all] $cam → $OUT/$cam.jpg  ($RES, ${SPP}spp)"
  python3 "$SCRIPT" -- --camera "$cam" --res "$RES" --samples "$SPP" --out "$OUT/$cam.jpg" \
    | grep -E "rendering|Saved|Error|Time:" || true
done
echo "[render_all] done → $OUT"
ls -la "$OUT"
