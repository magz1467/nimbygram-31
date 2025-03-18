#!/bin/bash

# Remove backup files
find . -name "*.bak" -type f -delete
find . -name "*.backup" -type f -delete
find . -name "*-backup.*" -type f -delete

# Remove alternative configuration files
find . -name "vite.config.*.js" -type f -delete
find . -name "tsconfig.*.json" -not -name "tsconfig.node.json" -type f -delete

# List remaining configuration files
echo "Remaining configuration files:"
find . -maxdepth 1 -name "*.json" -o -name "*.js" -o -name "*.toml" | sort

echo "Cleanup complete!" 