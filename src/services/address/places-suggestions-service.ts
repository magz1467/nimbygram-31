
import { PostcodeSuggestion } from '../../types/address-suggestions';
import { loadGoogleMapsScript } from './utils/script-loader';
import { processPlacePrediction } from './utils/address-processor';
import { fetchPlaceDetails } from './utils/places-details-fetcher';
import { GOOGLE_MAPS_API_KEY } from './config/api-keys';

/**
 * Checks if a string looks like a UK postcode
 * @param searchTerm The string to check
 * @returns Boolean indicating whether the string looks like a UK postcode
 */
const isUkPostcodePattern = (searchTerm: string): boolean => {
  return /^[A-Z]{1,2}[0-9][0-9A-Z]?(\s*[0-9][A-Z]{2})?$/i.test(searchTerm);
};

/**
 * Gets place predictions from Google Places API
 * @param searchTerm The search term
 * @param isPostcode Whether the search term looks like a postcode
 * @returns Promise that resolves to an array of place predictions
 */
const getPlacePredictions = async (
  searchTerm: string,
  isPostcode: boolean
): Promise<google.maps.places.AutocompletePrediction[]> => {
  // Create session token for billing optimization
  const sessionToken = new google.maps.places.AutocompleteSessionToken();
  const autocompleteService = new google.maps.places.AutocompleteService();
  
  // Define options based on search type
  const options: google.maps.places.AutocompletionRequest = {
    input: searchTerm,
    componentRestrictions: { country: 'uk' },
    sessionToken
  };
  
  // Important: Don't mix 'address' and 'geocode' types - this causes the API to fail
  // For non-postcodes, use 'geocode' only which is more generic
  if (!isPostcode) {
    options.types = ['geocode'];
  }
  
  // Add postcode prefix for better UK results
  if (isPostcode && !searchTerm.toLowerCase().includes('uk') && !searchTerm.toLowerCase().includes('united kingdom')) {
    options.input = `${searchTerm} UK`;
  }

  console.log('🔍 Places API request:', options);
  
  // Make the API request
  return new Promise((resolve, reject) => {
    autocompleteService.getPlacePredictions(
      options,
      (predictions, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
          console.log('Places API returned:', status, 'for input:', searchTerm);
          
          // If no results and looks like postcode, try with 'postcode' added
          if (isPostcode && status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            // Try again with a different search approach
            autocompleteService.getPlacePredictions(
              {
                input: `${searchTerm} postcode`,
                componentRestrictions: { country: 'uk' },
                sessionToken
              },
              (secondTryPredictions, secondStatus) => {
                if (secondStatus === google.maps.places.PlacesServiceStatus.OK && secondTryPredictions) {
                  console.log('Second attempt successful:', secondTryPredictions.length, 'results');
                  resolve(secondTryPredictions);
                } else {
                  console.log('No predictions found in second attempt:', secondStatus);
                  resolve([]);
                }
              }
            );
          } else {
            resolve([]);
          }
          return;
        }
        
        console.log('Found', predictions.length, 'predictions');
        resolve(predictions);
      }
    );
  });
};

/**
 * Creates a manual postcode suggestion when needed
 * @param searchTerm The postcode to create a suggestion for
 * @returns A PostcodeSuggestion object
 */
const createManualPostcodeSuggestion = (searchTerm: string): PostcodeSuggestion => {
  return {
    postcode: searchTerm.toUpperCase(),
    address: `${searchTerm.toUpperCase()} (Postcode)`,
    country: 'United Kingdom',
    locality: '',
    admin_district: '',
    nhs_ha: '',
    district: '',
    county: '',
    isManualPostcode: true
  };
};

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
    
    // Check if it looks like a UK postcode pattern
    const looksLikeUkPostcode = isUkPostcodePattern(searchTerm);
    
    // Get predictions from the Google Places API
    const predictions = await getPlacePredictions(searchTerm, looksLikeUkPostcode);
    
    if (!predictions || predictions.length === 0) {
      // For UK postcodes, if still no results, create a manual result
      if (looksLikeUkPostcode) {
        console.log('Creating fallback result for UK postcode');
        return [createManualPostcodeSuggestion(searchTerm)];
      }
      return [];
    }
    
    console.log('Processing', predictions.length, 'predictions');
    
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
