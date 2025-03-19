module.exports = {
  plugins: [
    {
      // Plugin to ensure sharp is properly installed
      package: '@netlify/plugin-functions-install-core',
      config: {
        includeModules: ['sharp']
      }
    }
  ],
  build: {
    environment: {
      NODE_VERSION: "18",
      NPM_VERSION: "9"
    }
  }
} 