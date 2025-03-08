
import { PostcodeSuggestion } from "../../types/address-suggestions";
import { loadGoogleMapsScript } from "./utils/script-loader";

/**
 * Fetch address suggestions using Google Places API
 * @param searchTerm The search term to get suggestions for
 * @returns Promise with address suggestions
 */
export const fetchAddressSuggestionsByPlacesAPI = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  console.log('🔍 Fetching address suggestions via Places API for:', searchTerm);
  
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
      const service = new google.maps.places.AutocompleteService();
      
      service.getPlacePredictions(
        {
          input: searchTerm,
          componentRestrictions: { country: 'uk' },
          types: ['geocode']
        },
        (predictions: any, status: string) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            console.log('✅ Retrieved place predictions:', predictions.length);
            
            // Map to our PostcodeSuggestion format
            const suggestions: PostcodeSuggestion[] = predictions.map((prediction: any) => ({
              id: prediction.place_id,
              postcode: prediction.structured_formatting.main_text,
              address: prediction.description,
              place_id: prediction.place_id
            }));
            
            resolve(suggestions);
          } else {
            console.log('No places found or error:', status);
            resolve([]);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error fetching address suggestions via Places API:', error);
    return [];
  }
};
