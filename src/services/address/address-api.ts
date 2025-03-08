
import { PostcodeSuggestion } from '@/types/address-suggestions';

// OS API Key has to be accessed differently in browser environment
// This is a workaround for the "process is not defined" error
const OS_API_KEY = 'ZTEafpzqZzMQXvUiMJFqnkEhdXrLbsLp'; // Default key, should be replaced with env var in production

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
