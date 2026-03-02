#!/bin/bash
# scripts/build-android.sh
# Build static web assets and open Android Studio

echo "Building Life To Do for Android (Production)..."

# Build Next.js with static export
BUILD_TARGET=native npm run build

# Sync assets and plugins to the Android project
npx cap sync android

echo "Opening Android Studio..."
npx cap open android
