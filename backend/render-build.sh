#!/usr/bin/env bash
# Render.com build script
set -e
npm install
npx prisma generate
npm run build
echo "✅ Build complete"
