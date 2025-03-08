
/**
 * Utility functions for fetching coordinates using Google Place IDs
 */
import { ensureGoogleMapsLoaded } from "./google-maps-loader";

/**
 * Fetches coordinates for a Google Place ID
 * @param placeId The Google Place ID to look up
 * @returns Promise with coordinates [lat, lng]
 */
export const fetchCoordinatesFromPlaceId = async (placeId: string): Promise<[number, number]> => {
  await ensureGoogleMapsLoaded();

  return new Promise<[number, number]>((resolve, reject) => {
    try {
      console.log('🔍 Getting place details for:', placeId);
      const placesService = new google.maps.places.PlacesService(document.createElement('div'));
      
      placesService.getDetails(
        {
          placeId: placeId,
          fields: ['geometry']
        },
        (place, status) => {
          console.log('📍 Place API status:', status);
          
          if (status !== google.maps.places.PlacesServiceStatus.OK || !place || !place.geometry || !place.geometry.location) {
            reject(new Error(`Failed to get location for place ID: ${status}`));
            return;
          }
          
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          console.log('📍 Got coordinates from Google Places API:', [lat, lng]);
          resolve([lat, lng]);
        }
      );
    } catch (error) {
      console.error('Error in Places API call:', error);
      reject(error);
    }
  });
};
