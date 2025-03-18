#!/bin/bash

echo "Generating package-lock.json file..."

# Ensure we're in the project root directory
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found in current directory."
  echo "Please run this script from the project root directory."
  exit 1
fi

# Run npm install to generate package-lock.json
npm install

# Verify the file was created
if [ -f "package-lock.json" ]; then
  echo "✅ package-lock.json successfully generated!"
  echo "File size: $(du -h package-lock.json | cut -f1)"
else
  echo "❌ Failed to generate package-lock.json"
  exit 1
fi

echo "Done!" 