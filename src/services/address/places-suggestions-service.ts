
import { loadGoogleMapsScript } from './utils/script-loader';
import { fetchPlaceDetails } from './utils/places-details-fetcher';
import { PostcodeSuggestion } from '../../types/address-suggestions';

interface GooglePlacesSuggestion {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlacesSuggestion {
  id: string;
  description: string;
  placeId: string;
  mainText?: string;
  secondaryText?: string;
}

/**
 * Fetches place suggestions from Google Places API
 * @param searchTerm - The search term to get suggestions for
 * @returns Promise with place suggestions
 */
export const fetchAddressSuggestionsByPlacesAPI = async (searchTerm: string): Promise<PostcodeSuggestion[]> => {
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
            
            // Map to our standardized format that matches PostcodeSuggestion
            const suggestions = predictions.map(prediction => ({
              postcode: prediction.place_id, // Store place_id in postcode field for consistency
              address: prediction.description,
              country: 'United Kingdom',
              locality: prediction.structured_formatting?.main_text || '',
              admin_district: prediction.structured_formatting?.secondary_text || '',
              nhs_ha: '',
              district: '',
              county: ''
            } as PostcodeSuggestion));
            
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
              id: prediction.place_id,
              description: prediction.description,
              placeId: prediction.place_id,
              mainText: prediction.structured_formatting?.main_text,
              secondaryText: prediction.structured_formatting?.secondary_text
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

export const fetchCombinedSuggestions = async (searchTerm: string): Promise<PlacesSuggestion[]> => {
  try {
    // Fetch suggestions from Google Places
    const placesSuggestions = await fetchPlacesSuggestions(searchTerm);
    
    // In the future, this function could also fetch from other sources
    // and combine the results
    
    return placesSuggestions;
  } catch (error) {
    console.error('Error fetching combined suggestions:', error);
    return [];
  }
};
