
import { PostcodeSuggestion } from '@/types/address-suggestions';

/**
 * Search for outcodes based on search term
 */
export const searchOutcodes = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  const outcodeUrl = `https://api.postcodes.io/outcodes?q=${encodeURIComponent(searchTerm)}`;
  console.log('🔍 Trying outcode search:', outcodeUrl);
  
  const outcodeResponse = await fetch(outcodeUrl);
  if (!outcodeResponse.ok) {
    console.log('❌ Outcode search failed');
    return [];
  }
  
  const outcodeData = await outcodeResponse.json();
  
  if (!outcodeData.result || !Array.isArray(outcodeData.result) || outcodeData.result.length === 0) {
    return [];
  }
  
  console.log('📍 Found outcode results:', outcodeData.result.length);
  
  // Add outcode results as suggestions
  return outcodeData.result.map((result: any) => ({
    ...result,
    postcode: result.outcode,
    address: `${result.outcode}, ${result.admin_district || ''}, ${result.admin_county || result.region || ''}`,
    nhs_ha: result.nhs_ha || '',
    country: result.country || 'United Kingdom',
    admin_district: result.admin_district || ''
  }));
};
