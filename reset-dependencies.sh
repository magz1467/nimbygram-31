#!/bin/bash
# Script to reset and reinstall all dependencies

# Remove existing node_modules and lock files
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml

# Install with legacy peer deps flag
npm install --legacy-peer-deps

# Output success message
echo "Dependencies reset and reinstalled successfully!" 