
import { PostcodeSuggestion } from '../../types/address-suggestions';
import { loadGoogleMapsScript } from './utils/script-loader';
import { processPlacePrediction } from './utils/address-processor';
import { fetchPlaceDetails } from './utils/places-details-fetcher';
import { GOOGLE_MAPS_API_KEY } from './config/api-keys';

/**
 * Fetches address suggestions using the Google Places API
 * @param searchTerm The search term to find address suggestions for
 * @returns Promise that resolves to an array of PostcodeSuggestion objects
 */
export const fetchAddressSuggestionsByPlacesAPI = async (
  searchTerm: string
): Promise<PostcodeSuggestion[]> => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  try {
    // Load Google Maps API script dynamically with the provided key
    const isLoaded = await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
    
    if (!isLoaded) {
      console.error('Google Maps API failed to load');
      // Return an empty array instead of throwing, to prevent UI disruption
      return [];
    }
    
    // Initialize the Places service
    const sessionToken = new google.maps.places.AutocompleteSessionToken();
    
    // Create the autocomplete service
    const autocompleteService = new google.maps.places.AutocompleteService();
    
    // Get predictions from the Google Places API
    const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
      autocompleteService.getPlacePredictions(
        {
          input: searchTerm,
          componentRestrictions: { country: 'uk' },
          sessionToken,
          types: ['address'],
        },
        (predictions, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
            console.log('No predictions found or error:', status);
            resolve([]);
            return;
          }
          
          resolve(predictions);
        }
      );
    });
    
    if (!predictions || predictions.length === 0) {
      return [];
    }
    
    console.log('Found predictions:', predictions.length);
    
    // Process each prediction into a PostcodeSuggestion
    const suggestions = await Promise.all(
      predictions.map(async (prediction) => {
        // Get more detailed place information
        const detailedPlace = await fetchPlaceDetails(prediction.place_id);
        
        // Process the prediction with the detailed place info
        return processPlacePrediction(prediction, detailedPlace);
      })
    );
    
    return suggestions;
  } catch (error) {
    console.error('Error fetching Google Places suggestions:', error);
    return [];
  }
};
