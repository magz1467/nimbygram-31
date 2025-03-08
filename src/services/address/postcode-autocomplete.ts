
import { PostcodeSuggestion } from '../../types/address-suggestions';

/**
 * Fetch autocomplete suggestions for postcodes
 * @param searchTerm The search term to get suggestions for
 * @returns Promise with postcode suggestions
 */
export const fetchAddressSuggestions = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  console.log('🔍 Fetching address suggestions for:', searchTerm);
  
  // Skip if search term is too short
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  try {
    return await getPostcodeAutocomplete(searchTerm);
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    return [];
  }
};

/**
 * Get postcode autocomplete suggestions
 */
export const getPostcodeAutocomplete = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  try {
    const autocompleteUrl = `https://api.postcodes.io/postcodes/${encodeURIComponent(searchTerm)}/autocomplete`;
    console.log('🔍 Fetching postcode autocomplete:', autocompleteUrl);
    
    const autocompleteResponse = await fetch(autocompleteUrl);
    if (!autocompleteResponse.ok) {
      console.log('❌ Postcode autocomplete failed with status:', autocompleteResponse.status);
      return [];
    }
    
    const autocompleteData = await autocompleteResponse.json();
    
    if (!autocompleteData.result || !Array.isArray(autocompleteData.result) || autocompleteData.result.length === 0) {
      console.log('ℹ️ No postcode autocomplete results found');
      return [];
    }
    
    console.log('📍 Found postcode autocomplete results:', autocompleteData.result.length);
    
    // Create lightweight suggestions from the autocomplete results without fetching details
    // This prevents excessive API calls that might be failing
    const suggestions: PostcodeSuggestion[] = autocompleteData.result.map((postcode: string) => ({
      postcode: postcode,
      country: 'United Kingdom',
      address: postcode,
      nhs_ha: '',
      admin_district: ''
    }));
    
    return suggestions;
  } catch (error) {
    console.error('Error in getPostcodeAutocomplete:', error);
    return [];
  }
};
