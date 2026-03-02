#!/bin/bash
# scripts/dev-native.sh
# Launch the Next.js dev server and configure Capacitor for live reload

echo "Starting Next.js Dev Server mapped to Native Wrappers..."

# Make sure capacitor.config.ts points to localhost:3000
npm run dev
