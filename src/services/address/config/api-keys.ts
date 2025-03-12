
// Use the provided API key directly
export const GOOGLE_MAPS_API_KEY = 'AIzaSyCuw9EAyPuxA7XssqBSd996Mu8deQmgZYY';

// Helper function to determine if a key is enabled for a specific API
export const isKeyEnabledForApi = async (apiKey: string, apiName: string): Promise<boolean> => {
  // In a production environment, you would validate this server-side
  try {
    // For demonstration purposes only - in production, use a server endpoint
    switch (apiName) {
      case 'geocoding':
        const geocoder = new google.maps.Geocoder();
        const result = await new Promise<boolean>((resolve) => {
          geocoder.geocode({ address: 'London' }, (results, status) => {
            resolve(status === google.maps.GeocoderStatus.OK);
          });
        });
        return result;
      
      case 'places':
        // Basic check to see if Places API is responding
        if (window.google?.maps?.places) {
          return true;
        }
        return false;
        
      default:
        return true;
    }
  } catch (error) {
    console.error(`Error checking if key is enabled for ${apiName}:`, error);
    return false;
  }
};
