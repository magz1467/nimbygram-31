
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
    // Get postcode autocomplete results
    const suggestions = await getPostcodeAutocomplete(searchTerm);
    console.log('📋 Fetched address suggestions count:', suggestions.length);
    return suggestions;
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
    // Construct the API URL
    const autocompleteUrl = `https://api.postcodes.io/postcodes/${encodeURIComponent(searchTerm)}/autocomplete`;
    console.log('🔍 Fetching postcode autocomplete:', autocompleteUrl);
    
    // Make the API request
    const response = await fetch(autocompleteUrl);
    if (!response.ok) {
      console.log('❌ Postcode autocomplete failed with status:', response.status);
      return [];
    }
    
    // Parse the response JSON
    const data = await response.json();
    
    // Check if we have results - API returns null for no results
    if (!data.result) {
      console.log('ℹ️ No postcode autocomplete results found (null result)');
      return [];
    }
    
    // Ensure result is an array (API returns null for no results)
    if (!Array.isArray(data.result)) {
      console.log('ℹ️ Result is not an array:', typeof data.result);
      return [];
    }
    
    console.log('📍 Found postcode autocomplete results:', data.result.length);
    
    // Convert API results to our suggestion format
    const suggestions: PostcodeSuggestion[] = data.result.map((postcode: string) => ({
      postcode,
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
