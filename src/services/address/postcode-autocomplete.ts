
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
  const autocompleteUrl = `https://api.postcodes.io/postcodes/${encodeURIComponent(searchTerm)}/autocomplete`;
  console.log('🔍 Fetching postcode autocomplete:', autocompleteUrl);
  
  const autocompleteResponse = await fetch(autocompleteUrl);
  if (!autocompleteResponse.ok) {
    console.log('❌ Postcode autocomplete failed');
    return [];
  }
  
  const autocompleteData = await autocompleteResponse.json();
  
  if (!autocompleteData.result || !Array.isArray(autocompleteData.result) || autocompleteData.result.length === 0) {
    return [];
  }
  
  console.log('📍 Found postcode autocomplete results:', autocompleteData.result.length);
  
  // Fetch details for each suggested postcode
  const detailsPromises = autocompleteData.result.map(async (postcode) => {
    try {
      const detailsResponse = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`
      );
      
      if (detailsResponse.ok) {
        const details = await detailsResponse.json();
        if (details.result) {
          // Create a more detailed address string
          const addressParts = [
            details.result.parish || '',
            details.result.admin_ward || '',
            details.result.admin_district || '',
            details.result.admin_county || '',
            details.result.country || 'United Kingdom'
          ].filter(Boolean);
          
          return {
            ...details.result,
            postcode: details.result.postcode,
            address: `${addressParts.join(', ')}, ${details.result.postcode}`
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching postcode details:', error);
      return null;
    }
  });

  const results = await Promise.all(detailsPromises);
  return results.filter((result): result is PostcodeSuggestion => result !== null);
};

