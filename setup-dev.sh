
#!/bin/bash
# Script to set up the development environment

echo "Setting up development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 18 and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v)
echo "Using Node.js version: $NODE_VERSION"

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Create necessary environment files if they don't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOL
# Environment variables for local development
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
EOL
    echo ".env file created. Please update with your actual values."
fi

echo "Development setup complete!"
echo "To start the development server, run:"
echo "npm run dev"
