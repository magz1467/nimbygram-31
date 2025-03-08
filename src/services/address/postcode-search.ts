
import { PostcodeSuggestion } from '@/types/address-suggestions';

/**
 * Search for postcodes using postcodes.io API
 */
export const searchPostcodes = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  const postcodeUrl = `https://api.postcodes.io/postcodes?q=${encodeURIComponent(searchTerm)}`;
  console.log('🔍 Trying general postcode search:', postcodeUrl);
  
  const postcodeResponse = await fetch(postcodeUrl);
  if (!postcodeResponse.ok) {
    console.log('❌ General postcode search failed');
    return [];
  }
  
  const postcodeData = await postcodeResponse.json();
  
  if (!postcodeData.result || !Array.isArray(postcodeData.result) || postcodeData.result.length === 0) {
    return [];
  }
  
  console.log('📍 Found general postcode results:', postcodeData.result.length);
  
  // Format the search results with better address display
  return postcodeData.result.map((result: any) => {
    // Create a more detailed address string
    const addressParts = [
      result.parish || '',
      result.admin_ward || '',
      result.admin_district || '',
      result.admin_county || '',
      result.country || 'United Kingdom'
    ].filter(Boolean);
    
    return {
      ...result,
      postcode: result.postcode,
      address: `${addressParts.join(', ')}, ${result.postcode}`
    };
  });
};
