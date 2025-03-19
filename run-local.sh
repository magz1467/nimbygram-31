
#!/bin/bash
# Script to run the application locally

echo "Starting local development server..."

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "Node modules not found. Running setup first..."
    bash ./setup-dev.sh
fi

# Start development server
npm run dev
