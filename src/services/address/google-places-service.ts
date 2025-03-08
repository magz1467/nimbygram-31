
import { PostcodeSuggestion } from '../../types/address-suggestions';

// Use the provided API key directly
const GOOGLE_MAPS_API_KEY = 'AIzaSyC7zDNJTRJgs7g3E_MAAOv72cpZdp1APSA';

export const fetchAddressSuggestionsByPlacesAPI = async (
  searchTerm: string
): Promise<PostcodeSuggestion[]> => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  try {
    // Load Google Maps API script dynamically with the provided key
    await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
    
    // Initialize the Places service
    const sessionToken = new google.maps.places.AutocompleteSessionToken();
    
    // Create the autocomplete service
    const autocompleteService = new google.maps.places.AutocompleteService();
    
    // Get predictions from the Google Places API
    const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
      autocompleteService.getPlacePredictions(
        {
          input: searchTerm,
          componentRestrictions: { country: 'uk' },
          sessionToken,
        },
        (predictions, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
            console.log('No predictions found or error:', status);
            resolve([]);
            return;
          }
          
          resolve(predictions);
        }
      );
    });
    
    if (!predictions || predictions.length === 0) {
      return [];
    }
    
    // Convert Google Places predictions to PostcodeSuggestion format
    const suggestions = predictions.map((prediction): PostcodeSuggestion => {
      // Extract postcode from description if available (UK postcodes follow a pattern)
      const postcodeMatch = prediction.description.match(/[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}/i);
      const postcode = postcodeMatch ? postcodeMatch[0] : '';
      
      // Split the description into parts to get district and country
      const addressParts = prediction.structured_formatting.secondary_text?.split(', ') || [];
      const country = addressParts.length > 0 ? addressParts[addressParts.length - 1] : 'United Kingdom';
      const admin_district = addressParts.length > 1 ? addressParts[0] : '';
      
      return {
        postcode: postcode || prediction.place_id, // Use place_id as a fallback
        address: prediction.description,
        country: country,
        nhs_ha: '',
        admin_district: admin_district
      };
    });
    
    return suggestions;
  } catch (error) {
    console.error('Error fetching Google Places suggestions:', error);
    return [];
  }
};

// Helper function to load Google Maps script
const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If script is already loaded, resolve immediately
    if (window.google && window.google.maps && window.google.maps.places) {
      resolve();
      return;
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      reject(new Error('Google Maps script failed to load'));
    };
    
    document.head.appendChild(script);
  });
};
