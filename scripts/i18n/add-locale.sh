#!/bin/bash
# scripts/i18n/add-locale.sh
# 
# Bootstraps a new locale folder and injects the base English strings
# to prevent compilation errors before the translators get to it.

if [ -z "$1" ]; then
  echo "Usage: ./scripts/i18n/add-locale.sh <locale-code>"
  echo "Example: ./scripts/i18n/add-locale.sh fr-FR"
  exit 1
fi

LOCALE_CODE=$1
MESSAGES_DIR="messages"
BASE_LOCALE="en"
TARGET_DIR="$MESSAGES_DIR/$LOCALE_CODE"

if [ -d "$TARGET_DIR" ]; then
  echo "Error: Locale directory '$TARGET_DIR' already exists."
  exit 1
fi

echo "Bootstrapping new locale: $LOCALE_CODE"

mkdir -p "$TARGET_DIR"

# Copy all English JSON files as the baseline reference
for file in "$MESSAGES_DIR/$BASE_LOCALE"/*.json; do
  filename=$(basename "$file")
  cp "$file" "$TARGET_DIR/$filename"
  echo "  Created $TARGET_DIR/$filename (copied from English base)"
done

echo ""
echo "✅ Successfully bootstrapped '$LOCALE_CODE' namespace."
echo "⚠️  Don't forget to update i18nConfig.locales inside src/i18n/config.ts!"
