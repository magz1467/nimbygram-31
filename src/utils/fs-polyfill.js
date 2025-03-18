// This is a minimal polyfill for the fs module in browser environments
// It provides empty implementations of common fs functions

const fs = {
  readFileSync: () => {
    console.warn('fs.readFileSync is not available in browser environments');
    return '';
  },
  writeFileSync: () => {
    console.warn('fs.writeFileSync is not available in browser environments');
  },
  readdirSync: () => {
    console.warn('fs.readdirSync is not available in browser environments');
    return [];
  },
  statSync: () => {
    console.warn('fs.statSync is not available in browser environments');
    return {
      isDirectory: () => false,
      isFile: () => false
    };
  },
  existsSync: () => {
    console.warn('fs.existsSync is not available in browser environments');
    return false;
  }
};

export default fs; 