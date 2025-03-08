
import { PostcodeSuggestion } from "../../types/address-suggestions";
import { fetchAddressSuggestionsByPlacesAPI } from "./places-suggestions-service";

// Re-export the function from places-suggestions-service
export { fetchAddressSuggestionsByPlacesAPI };

/**
 * Get address suggestions from Google Places API
 * @param searchTerm The search term to get suggestions for
 * @returns Promise with address suggestions
 */
export const getGooglePlacesSuggestions = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  console.log('🔍 Getting Google Places suggestions for:', searchTerm);
  return await fetchAddressSuggestionsByPlacesAPI(searchTerm);
};
