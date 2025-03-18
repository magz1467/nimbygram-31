// Maps configuration
const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 
                    // Fallback to a development-only key if not in production
                    (import.meta.env.PROD ? '' : 'YOUR_DEVELOPMENT_KEY_HERE');

export const getMapsApiKey = () => {
  if (!MAPS_API_KEY && import.meta.env.PROD) {
    console.error('Google Maps API key is missing in production environment');
  }
  return MAPS_API_KEY;
};

export const loadGoogleMapsScript = () => {
  const apiKey = getMapsApiKey();
  if (!apiKey) return Promise.reject('No API key available');
  
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('Google Maps script failed to load'));
    
    document.head.appendChild(script);
  });
}; 