
import { loadGoogleMapsScript } from './utils/script-loader';
import { PostcodeSuggestion } from '@/types/address-suggestions';

/**
 * Fetch address suggestions from Google Places API
 * @param searchTerm The search term to get suggestions for
 * @returns Promise with place suggestions formatted as PostcodeSuggestion objects
 */
export const fetchAddressSuggestionsByPlacesAPI = async (
  searchTerm: string
): Promise<PostcodeSuggestion[]> => {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  try {
    // Load Google Maps Places API if not already loaded
    await loadGoogleMapsScript();
    const { google } = window as any;

    if (!google || !google.maps || !google.maps.places) {
      console.error('Google Maps Places API not loaded');
      return [];
    }

    return new Promise((resolve) => {
      const placesService = new google.maps.places.AutocompleteService();
      
      placesService.getPlacePredictions(
        {
          input: searchTerm,
          componentRestrictions: { country: 'uk' },
          types: ['geocode', 'address', 'establishment']
        },
        (predictions: any[] | null, status: string) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
            console.log('No place predictions found or error:', status);
            resolve([]);
            return;
          }

          // Convert Google predictions to our PostcodeSuggestion format
          const suggestions: PostcodeSuggestion[] = predictions.map(prediction => ({
            postcode: prediction.place_id, // Store place_id in postcode field for later lookup
            address: prediction.description,
            country: 'United Kingdom',
            admin_district: prediction.structured_formatting?.secondary_text || '',
            nhs_ha: '',
            isPlaceId: true // Mark this as a place ID for special handling
          }));

          resolve(suggestions);
        }
      );
    });
  } catch (error) {
    console.error('Error fetching Places API suggestions:', error);
    return [];
  }
};
