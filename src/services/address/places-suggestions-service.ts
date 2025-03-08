
import { loadGoogleMapsScript } from './utils/script-loader';
import { fetchPlaceDetails } from './utils/places-details-fetcher';

interface GooglePlacesSuggestion {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

// Interface for our standardized suggestions
export interface PlacesSuggestion {
  description: string;
  placeId: string;
  mainText?: string;
  secondaryText?: string;
  isPlaceId?: boolean;
  postcode: string;
  address?: string;
}

/**
 * Fetches place suggestions from Google Places API
 * @param searchTerm - The search term to get suggestions for
 * @returns Promise with place suggestions
 */
export const fetchPlacesSuggestions = async (searchTerm: string): Promise<PlacesSuggestion[]> => {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  console.log('🔍 Fetching Google Places suggestions for:', searchTerm);
  
  try {
    // Load Google Maps Places API if not already loaded
    await loadGoogleMapsScript();
    const { google } = window as any;
    
    if (!google || !google.maps || !google.maps.places) {
      console.error('Google Maps Places API not loaded');
      return [];
    }
    
    return new Promise((resolve, reject) => {
      const service = new google.maps.places.AutocompleteService();
      
      service.getPlacePredictions(
        {
          input: searchTerm,
          componentRestrictions: { country: 'gb' }, // Restrict to UK
          types: ['geocode', 'address', 'establishment'] // Types of places to return
        },
        (predictions: GooglePlacesSuggestion[] | null, status: string) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            console.log('✅ Found Google Places suggestions:', predictions.length);
            
            // Map to our standardized format
            const suggestions = predictions.map(prediction => ({
              description: prediction.description,
              placeId: prediction.place_id,
              mainText: prediction.structured_formatting?.main_text,
              secondaryText: prediction.structured_formatting?.secondary_text,
              isPlaceId: true,
              postcode: prediction.place_id, // Store place_id in postcode field for consistency with other suggestion sources
              address: prediction.description
            }));
            
            resolve(suggestions);
          } else {
            console.log('❌ No Google Places suggestions found:', status);
            resolve([]);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error fetching Google Places suggestions:', error);
    return [];
  }
};

/**
 * Fetch a place's details using its place ID
 * This is a wrapper around the fetchPlaceDetails function
 * @param placeId The Google Place ID
 * @returns The place details or null if not found
 */
export const getPlaceDetails = async (placeId: string) => {
  try {
    return await fetchPlaceDetails(placeId);
  } catch (error) {
    console.error('Error in getPlaceDetails:', error);
    return null;
  }
};

/**
 * Fetch combined address suggestions from multiple sources
 * @param searchTerm The search term
 * @returns Combined suggestions from all sources
 */
export const fetchCombinedSuggestions = async (searchTerm: string): Promise<PlacesSuggestion[]> => {
  try {
    // Fetch suggestions from Google Places
    const placesSuggestions = await fetchPlacesSuggestions(searchTerm);
    
    // Return combined suggestions
    return placesSuggestions;
  } catch (error) {
    console.error('Error fetching combined suggestions:', error);
    return [];
  }
};
