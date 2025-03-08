
import { PostcodeSuggestion } from '../../types/address-suggestions';

/**
 * Search for streets and places using postcodes.io API
 */
export const searchStreets = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  const streetUrl = `https://api.postcodes.io/places?q=${encodeURIComponent(searchTerm)}&limit=10`;
  console.log('🔍 Trying street/place search:', streetUrl);
  
  const streetResponse = await fetch(streetUrl);
  if (!streetResponse.ok) {
    console.log('❌ Street/place search failed');
    return [];
  }
  
  const streetData = await streetResponse.json();
  
  if (!streetData.result || !Array.isArray(streetData.result) || streetData.result.length === 0) {
    return [];
  }
  
  console.log('📍 Found street/place results:', streetData.result.length);
  
  // Format the search results
  return streetData.result.map((result: any) => {
    // Create address string
    const addressParts = [
      result.name || '',
      result.county || '',
      result.country || 'United Kingdom',
    ].filter(Boolean);
    
    return {
      postcode: result.postcode || addressParts[0],
      country: result.country || 'United Kingdom',
      nhs_ha: '',
      admin_district: result.admin_district || '',
      address: addressParts.join(', ')
    };
  });
};
