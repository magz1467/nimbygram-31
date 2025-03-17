
// Use the provided API key directly
export const GOOGLE_MAPS_API_KEY = 'AIzaSyCuw9EAyPuxA7XssqBSd996Mu8deQmgZYY';

// Helper function to determine if a key is enabled for a specific API
export const isKeyEnabledForApi = async (apiKey: string, apiName: string): Promise<boolean> => {
  console.log(`Checking if key is enabled for ${apiName} API...`);
  console.log(`Running on: ${window.location.hostname}`);
  
  // In a production environment, you would validate this server-side
  try {
    // For demonstration purposes only - in production, use a server endpoint
    switch (apiName) {
      case 'geocoding':
        console.log('Testing geocoding API...');
        const geocoder = new google.maps.Geocoder();
        const result = await new Promise<boolean>((resolve) => {
          geocoder.geocode({ address: 'London, UK' }, (results, status) => {
            console.log('Geocoding test result:', status);
            console.log('Geocoding test found results:', results ? results.length : 0);
            console.log('Current hostname:', window.location.hostname);
            resolve(status === google.maps.GeocoderStatus.OK);
          });
        });
        return result;
      
      case 'places':
        console.log('Testing Places API...');
        // Basic check to see if Places API is responding
        if (window.google?.maps?.places) {
          const placesService = new google.maps.places.AutocompleteService();
          const placesResult = await new Promise<boolean>((resolve) => {
            placesService.getPlacePredictions(
              { input: 'London', componentRestrictions: { country: 'uk' } },
              (predictions, status) => {
                console.log('Places API test result:', status);
                console.log('Places API test found predictions:', predictions ? predictions.length : 0);
                console.log('Current hostname:', window.location.hostname);
                resolve(status === google.maps.places.PlacesServiceStatus.OK);
              }
            );
          });
          return placesResult;
        }
        console.log('Places API not available');
        return false;
        
      default:
        return true;
    }
  } catch (error) {
    console.error(`Error checking if key is enabled for ${apiName}:`, error);
    console.error('Current hostname:', window.location.hostname);
    return false;
  }
};

// Function to test both APIs and log results
export const testGoogleMapsAPIs = async () => {
  try {
    console.log('Testing Google Maps APIs with key ending in:', GOOGLE_MAPS_API_KEY.slice(-6));
    console.log('Current hostname:', window.location.hostname);
    
    const geocodingEnabled = await isKeyEnabledForApi(GOOGLE_MAPS_API_KEY, 'geocoding');
    console.log('Geocoding API enabled:', geocodingEnabled);
    
    const placesEnabled = await isKeyEnabledForApi(GOOGLE_MAPS_API_KEY, 'places');
    console.log('Places API enabled:', placesEnabled);
    
    return {
      geocoding: geocodingEnabled,
      places: placesEnabled,
      hostname: window.location.hostname,
      isFullyFunctional: geocodingEnabled && placesEnabled
    };
  } catch (error) {
    console.error('Error testing Google Maps APIs:', error);
    console.error('Current hostname:', window.location.hostname);
    return {
      geocoding: false,
      places: false,
      hostname: window.location.hostname,
      isFullyFunctional: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Helper function to diagnose API key domain restrictions
export const diagnoseApiKeyIssues = async () => {
  try {
    console.log('🔎 Diagnosing Google Maps API key issues...');
    console.log('🔎 Current hostname:', window.location.hostname);
    console.log('🔎 API key ends with:', GOOGLE_MAPS_API_KEY.slice(-6));
    
    if (!window.google || !window.google.maps) {
      console.log('🔎 Google Maps not loaded yet, loading...');
      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geocoding&v=quarterly`;
      
      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps script'));
        document.head.appendChild(script);
      });
      
      console.log('🔎 Google Maps script loaded for diagnostic');
    }
    
    // Test Geocoding
    const geocoder = new google.maps.Geocoder();
    const geocodeResult = await new Promise<any>((resolve) => {
      geocoder.geocode({ address: 'London, UK' }, (results, status) => {
        resolve({ status, resultsCount: results ? results.length : 0 });
      });
    });
    
    console.log('🔎 Geocoding test:', geocodeResult);
    
    // Test Places
    let placesResult;
    if (window.google.maps.places) {
      const placesService = new google.maps.places.AutocompleteService();
      placesResult = await new Promise<any>((resolve) => {
        placesService.getPlacePredictions(
          { input: 'London', componentRestrictions: { country: 'uk' } },
          (predictions, status) => {
            resolve({ status, predictionsCount: predictions ? predictions.length : 0 });
          }
        );
      });
      
      console.log('🔎 Places API test:', placesResult);
    } else {
      console.log('🔎 Places API not available');
    }
    
    return {
      hostname: window.location.hostname,
      apiKeyLastSix: GOOGLE_MAPS_API_KEY.slice(-6),
      geocoding: geocodeResult,
      places: placesResult,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('🔎 Error diagnosing API key issues:', error);
    return {
      hostname: window.location.hostname,
      apiKeyLastSix: GOOGLE_MAPS_API_KEY.slice(-6),
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
};
