
/**
 * Fetches detailed place information from Google Places API
 * @param placeId The Google Place ID
 * @returns Promise that resolves to the place details
 */
export const fetchPlaceDetails = async (
  placeId: string
): Promise<google.maps.places.PlaceResult | null> => {
  // Create a dummy div to host the PlacesService (required by Google Maps API)
  const dummyElement = document.createElement('div');
  const placesService = new google.maps.places.PlacesService(dummyElement);
  
  try {
    return await new Promise((resolve) => {
      placesService.getDetails(
        {
          placeId: placeId,
          fields: ['address_components', 'formatted_address'],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            resolve(place);
          } else {
            console.log('Failed to get place details:', status);
            resolve(null);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
};
