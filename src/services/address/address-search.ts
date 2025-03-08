import { PostcodeSuggestion, AddressSuggestionOptions } from '../../types/address-suggestions';
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
 * Safely execute a search function and handle errors
 */
const safeSearch = async <T>(
  searchFn: (term: string) => Promise<T[]>,
  searchTerm: string,
  errorLabel: string
): Promise<T[]> => {
  try {
    return await searchFn(searchTerm);
  } catch (error) {
    console.error(`Error in ${errorLabel}:`, error);
    return [];
  }
};

/**
 * Search for addresses using OS Places API
 */
const searchAddresses = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  const addressResults = await safeSearch(searchOSAddresses, searchTerm, 'address search');
  
  // If no results, try outcode search
  if (addressResults.length === 0) {
    const outcodeResults = await safeSearch(searchOutcodes, searchTerm, 'outcode search');
    return outcodeResults;
  }
  
  return addressResults;
};

/**
 * Search for streets and places
 */
const searchStreetPlaces = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  return await safeSearch(searchStreets, searchTerm, 'street/place search');
};

/**
 * Search for postcodes with partial matches
 */
const searchPostcodeMatches = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  return await safeSearch(searchPostcodes, searchTerm, 'general postcode search');
};

/**
 * Get postcode autocompletion suggestions
 */
const searchPostcodeAutocompletions = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  return await safeSearch(getPostcodeAutocomplete, searchTerm, 'postcode autocomplete');
};

/**
 * Perform address-based search (non-postcode)
 */
const performAddressSearch = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  let suggestions: PostcodeSuggestion[] = [];
  
  // Try address search first
  suggestions = await searchAddresses(searchTerm);
  
  // Also try a general address search with postcodes.io
  const streetResults = await searchStreetPlaces(searchTerm);
  suggestions.push(...streetResults);
  
  // If we still don't have results, try a partial postcode search
  if (suggestions.length === 0) {
    const postcodeResults = await searchPostcodeMatches(searchTerm);
    suggestions.push(...postcodeResults);
  }
  
  return suggestions;
};

/**
 * Perform postcode-based search
 */
const performPostcodeSearch = async (searchTerm: string, needsAutocomplete: boolean): Promise<PostcodeSuggestion[]> => {
  let suggestions: PostcodeSuggestion[] = [];
  
  // Always try general search for postcodes
  const searchResults = await searchPostcodeMatches(searchTerm);
  suggestions.push(...searchResults);
  
  // If it looks more like a postcode and we have few results, try postcode autocomplete
  if (needsAutocomplete && suggestions.length < 5) {
    const autocompleteResults = await searchPostcodeAutocompletions(searchTerm);
    suggestions.push(...autocompleteResults);
  }
  
  return suggestions;
};

/**
 * Fetch address suggestions based on search term
 */
export const fetchAddressSuggestions = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  try {
    searchTerm = searchTerm.trim();
    
    // Try to determine if input is a postcode or address
    const postcodeLike = isPostcodeLike(searchTerm);
    
    console.log('🔍 Searching for:', searchTerm, 'isPostcodeLike:', postcodeLike);
    
    let suggestions: PostcodeSuggestion[] = [];
    
    // For non-postcode searches (addresses, streets), try place search first
    if (!postcodeLike && searchTerm.length >= 3) {
      const addressSuggestions = await performAddressSearch(searchTerm);
      suggestions.push(...addressSuggestions);
    }
    
    // If it looks like a postcode or we still don't have results, try postcode-specific searches
    if (postcodeLike || suggestions.length === 0) {
      const postcodeSuggestions = await performPostcodeSearch(searchTerm, postcodeLike);
      suggestions.push(...postcodeSuggestions);
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
