
import { loadGoogleMapsScript } from './script-loader';

export interface PlaceDetails {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name?: string;
  place_id: string;
}

/**
 * Fetches place details from Google Places API using a place ID
 * @param placeId - The Google Places API place ID
 * @returns Promise with place details or null if not found
 */
export const fetchPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
  console.log('🔍 Fetching place details for ID:', placeId);
  
  try {
    // Load Google Maps Places API if not already loaded
    await loadGoogleMapsScript();
    const { google } = window as any;
    
    if (!google || !google.maps || !google.maps.places) {
      console.error('Google Maps Places API not loaded');
      return null;
    }
    
    return new Promise((resolve, reject) => {
      const placesService = new google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      placesService.getDetails(
        {
          placeId,
          fields: ['name', 'formatted_address', 'geometry', 'place_id']
        },
        (result: any, status: string) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && result) {
            console.log('✅ Retrieved place details:', result);
            
            // Convert to our PlaceDetails interface
            const placeDetails: PlaceDetails = {
              formatted_address: result.formatted_address,
              geometry: {
                location: {
                  lat: result.geometry.location.lat(),
                  lng: result.geometry.location.lng()
                }
              },
              name: result.name,
              place_id: result.place_id
            };
            
            resolve(placeDetails);
          } else {
            console.error('Error fetching place details:', status);
            reject(new Error(`Place details fetch failed with status: ${status}`));
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in fetchPlaceDetails:', error);
    return null;
  }
};

/**
 * Converts a place ID to a human readable address
 * @param placeIdOrAddress Input that might be a place ID or regular address
 * @returns Promise with human readable address
 */
export const placeIdToReadableAddress = async (placeIdOrAddress: string): Promise<string> => {
  if (placeIdOrAddress.startsWith('ChIJ') || placeIdOrAddress.includes('place_id:')) {
    try {
      // Extract the place ID if it's in the format "place_id:ChIJ..."
      const placeId = placeIdOrAddress.includes('place_id:')
        ? placeIdOrAddress.split('place_id:')[1].trim()
        : placeIdOrAddress;
      
      const details = await fetchPlaceDetails(placeId);
      if (details && details.formatted_address) {
        return details.formatted_address;
      }
    } catch (error) {
      console.error('Error converting place ID to address:', error);
    }
  }
  
  // Return the original string if it's not a place ID or if conversion fails
  return placeIdOrAddress;
};
