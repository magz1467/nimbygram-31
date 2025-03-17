
// fixApiKey.js - Forces the correct Google Maps API key across the application
(function() {
  // The correct API key - explicitly hardcoded for reliability
  const CORRECT_API_KEY = 'AIzaSyCuw9EAyPuxA7XssqBSd996Mu8deQmgZYY';
  
  // Inject our key globally to ensure everything uses it
  window.__GOOGLE_MAPS_API_KEY = CORRECT_API_KEY;
  
  console.log('🔑 API key fix script loaded');
  console.log('🔑 Using forced API key ending with:', CORRECT_API_KEY.slice(-6));
  
  // 1. Clean up any existing Google API scripts
  const scripts = document.querySelectorAll('script');
  scripts.forEach(script => {
    const src = script.getAttribute('src') || '';
    if (src.includes('maps.googleapis.com')) {
      console.log('🔑 Removing existing Google Maps script:', src);
      script.parentNode.removeChild(script);
    }
  });
  
  // 2. Clean up any existing Google objects
  if (window.google && window.google.maps) {
    console.log('🔑 Cleaning up existing Google Maps objects');
    delete window.google.maps;
    if (Object.keys(window.google).length === 0) {
      delete window.google;
    }
  }
  
  // 3. Override the getGoogleMapsApiKey function globally
  window.getGoogleMapsApiKey = function() {
    console.log('🔑 Using forced API key:', CORRECT_API_KEY.slice(-6));
    return CORRECT_API_KEY;
  };
  
  // 4. Intercept script creation to ensure correct key
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name === 'src' && 
            value && 
            value.includes('maps.googleapis.com') && 
            value.includes('key=') && 
            !value.includes(CORRECT_API_KEY)) {
          
          console.log('🔑 Intercepting Google Maps script with wrong key');
          // Replace any key with our correct key
          const newValue = value.replace(/key=([^&]+)/, `key=${CORRECT_API_KEY}`);
          console.log('🔑 Using correct key instead');
          return originalSetAttribute.call(this, name, newValue);
        }
        return originalSetAttribute.call(this, name, value);
      };
    }
    return element;
  };
  
  console.log('🔑 API key fix installed successfully');
})();
