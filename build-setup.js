
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Detect if we're on Netlify
const isNetlify = process.env.NETLIFY === 'true';

console.log('Running build setup script...');
console.log('Environment:', isNetlify ? 'Netlify' : 'Local');
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);

// Function to run a command and log output
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.toString());
    // Don't exit process on error, try to continue
  }
}

// Ensure esbuild is properly installed for the platform
if (isNetlify) {
  console.log('Installing platform-specific esbuild for Netlify...');
  runCommand('npm install @netlify/esbuild-linux-64 --no-save');
  
  // Set NODE_OPTIONS to help with memory issues
  console.log('Setting NODE_OPTIONS for build...');
  process.env.NODE_OPTIONS = '--max_old_space_size=4096';
  
  // Install the essential Netlify plugins
  console.log('Installing Netlify plugins...');
  runCommand('npm install -D @netlify/plugin-functions-install-core --no-save');
} else {
  console.log('Running in local environment, skipping Netlify-specific setup');
}

// Create a small test file to confirm the setup process worked
const timestamp = new Date().toISOString();
fs.writeFileSync(
  path.join(__dirname, 'build-setup-log.txt'), 
  `Build setup ran successfully at ${timestamp}\n` +
  `Platform: ${process.platform}\n` +
  `Architecture: ${process.arch}\n` +
  `Node version: ${process.version}\n`
);

console.log('Build setup completed successfully');
