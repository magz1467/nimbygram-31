
import { PostcodeSuggestion } from '../../types/address-suggestions';
import { OS_API_KEY } from './address-api-base';

/**
 * Search for address suggestions using OS OpenNames API
 */
export const searchOSAddresses = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  const addressUrl = `https://api.os.uk/search/names/v1/find?query=${encodeURIComponent(searchTerm)}&key=${OS_API_KEY}`;
  console.log('🔍 Trying address search:', addressUrl);
  
  const addressResponse = await fetch(addressUrl);
  if (!addressResponse.ok) {
    console.log('❌ OS address search failed');
    return [];
  }
  
  const addressData = await addressResponse.json();
  
  if (!addressData.results || !Array.isArray(addressData.results) || addressData.results.length === 0) {
    return [];
  }
  
  console.log('📍 Found address results:', addressData.results.length);
  
  // Process address results into our format
  return addressData.results.slice(0, 10).map((result: any) => {
    // Format address with available info
    const addressParts = [
      result.DISTRICT_BOROUGH,
      result.COUNTY_UNITARY,
      result.REGION,
      result.COUNTRY
    ].filter(Boolean);
    
    // If we have a postcode in the result, use it
    const postcode = result.POSTCODE || 'Unknown';
    
    return {
      postcode: postcode,
      country: result.COUNTRY || 'United Kingdom',
      nhs_ha: '',
      admin_district: result.DISTRICT_BOROUGH || '',
      address: `${result.NAME || ''}, ${addressParts.join(', ')}${postcode ? `, ${postcode}` : ''}`
    };
  });
};
