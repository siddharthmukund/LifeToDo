#!/bin/bash
# scripts/sync-web.sh
# Quickly build the web assets and push them into the native projects

echo "Syncing frontend changes to native wrappers..."

BUILD_TARGET=native npm run build
npx cap copy

echo "Sync complete."
