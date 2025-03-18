#!/bin/bash
# Script to debug build issues

echo "=== Environment Information ==="
node --version
npm --version
echo "NODE_ENV: $NODE_ENV"

echo "=== Package Information ==="
npm list --depth=0

echo "=== Starting Build ==="
npm run build 