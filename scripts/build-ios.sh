#!/bin/bash
# scripts/build-ios.sh
# Build static web assets and open Xcode for iOS archiving

echo "Building Life To Do for iOS (Production)..."

# Build Next.js with static export
BUILD_TARGET=native npm run build

# Sync assets and plugins to the iOS project
npx cap sync ios

echo "Opening Xcode workspace..."
npx cap open ios
