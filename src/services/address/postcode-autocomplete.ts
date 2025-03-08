
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
 * Get postcode autocomplete suggestions with enhanced location data
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
    
    // Get detailed information for each postcode
    const enhancedSuggestions = await Promise.all(
      data.result.map(async (postcode: string) => {
        try {
          const details = await fetchPostcodeDetails(postcode);
          return {
            postcode,
            country: details?.country || 'United Kingdom',
            county: details?.county || '',
            district: details?.admin_district || '',
            locality: details?.admin_ward || '',
            nhs_ha: details?.nhs_ha || '',
            admin_district: details?.admin_district || '',
            address: postcode
          };
        } catch (error) {
          console.error(`Error fetching details for ${postcode}:`, error);
          return {
            postcode,
            country: 'United Kingdom',
            address: postcode,
            nhs_ha: '',
            admin_district: ''
          };
        }
      })
    );
    
    return enhancedSuggestions;
  } catch (error) {
    console.error('Error in getPostcodeAutocomplete:', error);
    return [];
  }
};

/**
 * Fetch detailed information for a specific postcode
 */
const fetchPostcodeDetails = async (postcode: string) => {
  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error(`Error fetching details for ${postcode}:`, error);
    return null;
  }
};
