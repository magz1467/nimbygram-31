
import { PostcodeSuggestion } from '../../types/address-suggestions';

export const fetchAddressSuggestions = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  console.log('🔍 Fetching address suggestions for:', searchTerm);
  
  // Skip if search term is too short
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  // Format search term - remove spaces and convert to uppercase for consistency
  const formattedSearchTerm = searchTerm.replace(/\s+/g, '').toUpperCase();

  try {
    // First try to get postcode autocomplete results
    console.log('📫 Fetching postcode autocomplete for:', formattedSearchTerm);
    const postcodeSuggestions = await getPostcodeAutocomplete(formattedSearchTerm);
    
    // If no postcode matches are found, try searching for location names
    if (postcodeSuggestions.length === 0) {
      const locationSuggestions = await searchLocationsByName(searchTerm);
      console.log('📋 Location suggestions count:', locationSuggestions.length);
      return locationSuggestions;
    }
    
    console.log('📋 Postcode suggestions count:', postcodeSuggestions.length);
    return postcodeSuggestions;
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    return [];
  }
};

export const getPostcodeAutocomplete = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  try {
    // Use the correct API endpoint with proper error handling
    const autocompleteUrl = `https://api.postcodes.io/postcodes/${encodeURIComponent(searchTerm)}/autocomplete`;
    console.log('🔍 Fetching from:', autocompleteUrl);
    
    const response = await fetch(autocompleteUrl);
    
    // Log the raw response for debugging
    const responseText = await response.text();
    console.log('📦 Raw API response:', responseText);
    
    // Parse the response text as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      return [];
    }
    
    if (!response.ok) {
      console.warn('❌ API request failed:', data);
      return [];
    }
    
    // Handle null result case
    if (!data.result) {
      console.log('ℹ️ No results found');
      return [];
    }
    
    // Ensure result is an array
    if (!Array.isArray(data.result)) {
      console.warn('⚠️ Unexpected response format:', data);
      return [];
    }
    
    console.log('📍 Found postcode matches:', data.result.length);
    
    // Transform the results into PostcodeSuggestion format
    const suggestions: PostcodeSuggestion[] = await Promise.all(
      data.result.map(async (postcode: string) => {
        try {
          const details = await fetchPostcodeDetails(postcode);
          return {
            postcode,
            address: postcode, // Use postcode as address for display
            country: details?.country || 'United Kingdom',
            county: details?.county || '',
            district: details?.admin_district || '',
            locality: details?.admin_ward || '',
            admin_district: details?.admin_district || '',
            nhs_ha: details?.nhs_ha || ''
          };
        } catch (error) {
          console.error(`Error fetching details for ${postcode}:`, error);
          // Return basic suggestion if details fetch fails
          return {
            postcode,
            address: postcode,
            country: 'United Kingdom',
            admin_district: '',
            nhs_ha: ''
          };
        }
      })
    );
    
    return suggestions;
  } catch (error) {
    console.error('Error in getPostcodeAutocomplete:', error);
    return [];
  }
};

const fetchPostcodeDetails = async (postcode: string) => {
  try {
    console.log('🔍 Fetching details for postcode:', postcode);
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch postcode details: ${response.status}`);
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
