
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
    // First try to get postcode autocomplete results
    const postcodeSuggestions = await getPostcodeAutocomplete(searchTerm);
    
    // If no postcode matches are found, try searching for location names
    if (postcodeSuggestions.length === 0) {
      const locationSuggestions = await searchLocationsByName(searchTerm);
      console.log('📋 Fetched location suggestions count:', locationSuggestions.length);
      return locationSuggestions;
    }
    
    console.log('📋 Fetched address suggestions count:', postcodeSuggestions.length);
    return postcodeSuggestions;
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

/**
 * Search for locations by name using the postcodes.io API
 */
const searchLocationsByName = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  try {
    console.log('🔍 Searching for locations by name:', searchTerm);
    
    // Use the "query" endpoint for searching places by name
    const url = `https://api.postcodes.io/places?q=${encodeURIComponent(searchTerm)}&limit=10`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log('❌ Location search failed with status:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    // Check if we have results
    if (!data.result || !Array.isArray(data.result) || data.result.length === 0) {
      console.log('ℹ️ No location results found for:', searchTerm);
      return [];
    }
    
    console.log('📍 Found location results:', data.result.length);
    
    // Convert results to our suggestion format
    const suggestions: PostcodeSuggestion[] = data.result.map(place => {
      // Get the actual place name and add necessary location info
      const name = place.name_1 || '';
      const county = place.county_unitary || '';
      const region = place.region || '';
      
      // Format address properly in a human-readable style
      let formattedAddress = name;
      if (county) formattedAddress += `, ${county}`;
      formattedAddress += `, UK`;
      
      return {
        postcode: formattedAddress, // Use full address as the postcode field for search
        address: formattedAddress, // Full formatted address for display
        country: 'United Kingdom',
        county: county,
        district: place.district_borough || '',
        locality: region,
        admin_district: place.county_unitary || '',
        nhs_ha: '',
        isLocationName: true
      };
    });
    
    return suggestions;
  } catch (error) {
    console.error('Error searching for locations by name:', error);
    return [];
  }
};
