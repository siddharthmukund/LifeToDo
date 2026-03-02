#!/usr/bin/env bash
# generate-icons.sh — Generate all platform icon sizes from a 1024×1024 source.
# Requires: imagemagick  (brew install imagemagick)
# Usage: ./scripts/generate-icons.sh [path/to/icon-1024.png]
set -euo pipefail

SOURCE=${1:-"public/icons/icon-1024.png"}
if [ ! -f "$SOURCE" ]; then
  echo "Error: source icon not found at '$SOURCE'"
  echo "Usage: $0 path/to/icon-1024.png"
  exit 1
fi
command -v convert >/dev/null || { echo "Error: ImageMagick not found. brew install imagemagick"; exit 1; }

# ── iOS ──────────────────────────────────────────────────────────────────────
IOS_DIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"
mkdir -p "$IOS_DIR"
for SIZE in 20 29 40 58 60 76 80 87 120 152 167 180 1024; do
  convert "$SOURCE" -resize "${SIZE}x${SIZE}" "${IOS_DIR}/Icon-${SIZE}.png"
  echo "  iOS ${SIZE}×${SIZE}"
done

# ── Android ──────────────────────────────────────────────────────────────────
declare -A ANDROID=([mdpi]=48 [hdpi]=72 [xhdpi]=96 [xxhdpi]=144 [xxxhdpi]=192)
for DENSITY in "${!ANDROID[@]}"; do
  SIZE=${ANDROID[$DENSITY]}
  DIR="android/app/src/main/res/mipmap-${DENSITY}"
  mkdir -p "$DIR"
  convert "$SOURCE" -resize "${SIZE}x${SIZE}" "${DIR}/ic_launcher.png"
  # Adaptive icon foreground (centered, 72% scale inside 108dp safe zone)
  INNER=$((SIZE * 72 / 100))
  convert "$SOURCE" -resize "${INNER}x${INNER}" -gravity center \
    -background transparent -extent "${SIZE}x${SIZE}" \
    "${DIR}/ic_launcher_foreground.png"
  echo "  Android $DENSITY ${SIZE}×${SIZE}"
done

echo "✓ Icons generated for iOS and Android"
