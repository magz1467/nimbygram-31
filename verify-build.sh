#!/bin/bash

echo "Starting build verification..."

# Clean previous build
rm -rf dist

# Install dependencies
npm install

# Build the project
npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed!"
  exit 1
fi

# Check if dist folder exists and contains index.html
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
  echo "✅ dist folder contains index.html"
else
  echo "❌ dist folder missing or incomplete"
  exit 1
fi

# Count JS and CSS files
JS_COUNT=$(find dist -name "*.js" | wc -l)
CSS_COUNT=$(find dist -name "*.css" | wc -l)

echo "Found $JS_COUNT JavaScript files and $CSS_COUNT CSS files in dist folder"

echo "Build verification complete!" 