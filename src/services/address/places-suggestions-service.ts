
import { PostcodeSuggestion } from "../../types/address-suggestions";
import { loadGoogleMapsScript } from "./utils/script-loader";
import { getGoogleMapsApiKey } from "@/utils/api-keys";
import { getFallbackCoordinates } from "@/utils/location-fallbacks";

/**
 * Fetch address suggestions using Google Places API
 * @param searchTerm The search term to get suggestions for
 * @returns Promise with address suggestions
 */
export const fetchAddressSuggestionsByPlacesAPI = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  console.log('🔍 Fetching address suggestions via Places API for:', searchTerm);
  console.log('🔍 Using API key ending with:', getGoogleMapsApiKey().slice(-6));
  
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  try {
    // Load Google Maps Places API if not already loaded
    await loadGoogleMapsScript();
    const { google } = window as any;
    
    if (!google || !google.maps || !google.maps.places) {
      console.error('Google Maps Places API not loaded');
      console.log('Falling back to static suggestions');
      
      // Provide some static UK city/location suggestions as fallback
      const locations = Object.keys(getFallbackCoordinates(''));
      
      // Filter locations that match the search term
      const matchingLocations = locations.filter(location => 
        location.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5); // Limit to 5 results
      
      if (matchingLocations.length > 0) {
        return matchingLocations.map(location => ({
          id: `fallback-${location}`,
          postcode: location.charAt(0).toUpperCase() + location.slice(1), // Capitalize first letter
          address: `${location.charAt(0).toUpperCase() + location.slice(1)}, United Kingdom`,
          place_id: `fallback-${location}`,
          country: 'United Kingdom',
          nhs_ha: 'Unknown',
          admin_district: 'Unknown'
        }));
      }
      
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
              place_id: prediction.place_id,
              country: 'United Kingdom', // Default to UK since we're restricting to UK
              nhs_ha: '', // Required field but we don't have this info from Places API
              admin_district: prediction.structured_formatting.secondary_text || '' // Use secondary text as district
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
