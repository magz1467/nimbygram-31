
import { PostcodeSuggestion } from '@/types/address-suggestions';
import {
  searchOSAddresses,
  searchOutcodes,
  searchStreets,
  searchPostcodes,
  getPostcodeAutocomplete
} from './address-api';

/**
 * Deduplicate suggestion results based on address
 */
const dedupeSuggestions = (suggestions: PostcodeSuggestion[]): PostcodeSuggestion[] => {
  const uniqueSuggestions: PostcodeSuggestion[] = [];
  const addresses = new Set<string>();
  
  suggestions.forEach(suggestion => {
    const addressKey = suggestion.address || suggestion.postcode;
    if (!addresses.has(addressKey)) {
      addresses.add(addressKey);
      uniqueSuggestions.push(suggestion);
    }
  });
  
  return uniqueSuggestions;
};

/**
 * Check if a search term appears to be a postcode
 */
const isPostcodeLike = (searchTerm: string): boolean => {
  return /^[A-Z]{1,2}[0-9][A-Z0-9]?/i.test(searchTerm.toUpperCase());
};

/**
 * Fetch address suggestions based on search term
 */
export const fetchAddressSuggestions = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  try {
    const suggestions: PostcodeSuggestion[] = [];
    searchTerm = searchTerm.trim();
    
    // Try to determine if input is a postcode or address
    const postcodeLike = isPostcodeLike(searchTerm);
    
    console.log('🔍 Searching for:', searchTerm, 'isPostcodeLike:', postcodeLike);
    
    // For non-postcode searches (addresses, streets), try place search first
    if (!postcodeLike && searchTerm.length >= 3) {
      try {
        const addressResults = await searchOSAddresses(searchTerm);
        suggestions.push(...addressResults);
      } catch (error) {
        console.error('Error in address search:', error);
      }
      
      // If we didn't get any results, try an outcode search
      if (suggestions.length === 0) {
        try {
          const outcodeResults = await searchOutcodes(searchTerm);
          suggestions.push(...outcodeResults);
        } catch (error) {
          console.error('Error in outcode search:', error);
        }
      }
      
      // Also try a general address search with postcodes.io
      try {
        const streetResults = await searchStreets(searchTerm);
        suggestions.push(...streetResults);
      } catch (error) {
        console.error('Error in street/place search:', error);
      }
      
      // If we still don't have results, try a partial postcode search
      if (suggestions.length === 0) {
        try {
          const postcodeResults = await searchPostcodes(searchTerm);
          suggestions.push(...postcodeResults);
        } catch (error) {
          console.error('Error in general postcode search:', error);
        }
      }
    }
    
    // If it looks like a postcode or we still don't have results, try postcode-specific searches
    if (postcodeLike || suggestions.length === 0) {
      // Always try general search for postcodes
      try {
        const searchResults = await searchPostcodes(searchTerm);
        suggestions.push(...searchResults);
      } catch (error) {
        console.error('Error in postcode search:', error);
      }
      
      // If it looks more like a postcode and we have few results, try postcode autocomplete
      if (postcodeLike && suggestions.length < 5) {
        try {
          const autocompleteResults = await getPostcodeAutocomplete(searchTerm);
          suggestions.push(...autocompleteResults);
        } catch (error) {
          console.error('Error in postcode autocomplete:', error);
        }
      }
    }
    
    // Remove duplicate suggestions
    const uniqueSuggestions = dedupeSuggestions(suggestions);
    
    console.log('📍 Final suggestion count:', uniqueSuggestions.length);
    return uniqueSuggestions;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};
