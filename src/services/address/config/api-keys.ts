
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
          geocoder.geocode({ address: 'London' }, (results, status) => {
            console.log('Geocoding test result:', status);
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
    return false;
  }
};

// Function to test both APIs and log results
export const testGoogleMapsAPIs = async () => {
  try {
    console.log('Testing Google Maps APIs with key ending in:', GOOGLE_MAPS_API_KEY.slice(-6));
    
    const geocodingEnabled = await isKeyEnabledForApi(GOOGLE_MAPS_API_KEY, 'geocoding');
    console.log('Geocoding API enabled:', geocodingEnabled);
    
    const placesEnabled = await isKeyEnabledForApi(GOOGLE_MAPS_API_KEY, 'places');
    console.log('Places API enabled:', placesEnabled);
    
    return {
      geocoding: geocodingEnabled,
      places: placesEnabled,
      isFullyFunctional: geocodingEnabled && placesEnabled
    };
  } catch (error) {
    console.error('Error testing Google Maps APIs:', error);
    return {
      geocoding: false,
      places: false,
      isFullyFunctional: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
