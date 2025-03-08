
import { PostcodeSuggestion } from '../../types/address-suggestions';

// Use the provided API key directly
const GOOGLE_MAPS_API_KEY = 'AIzaSyC7zDNJTRJgs7g3E_MAAOv72cpZdp1APSA';

// Add a flag to track if the API has been loaded successfully
let googleMapsLoaded = false;
let loadAttempted = false;

export const fetchAddressSuggestionsByPlacesAPI = async (
  searchTerm: string
): Promise<PostcodeSuggestion[]> => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  try {
    // Load Google Maps API script dynamically with the provided key
    const isLoaded = await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
    
    if (!isLoaded) {
      console.error('Google Maps API failed to load');
      // Return an empty array instead of throwing, to prevent UI disruption
      return [];
    }
    
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
          // The types parameter must be a single value from this list
          // Don't mix 'geocode' with other types as it causes the API error
          types: ['address'],
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
      
      // Split the description into parts to get location details
      const addressParts = prediction.structured_formatting.secondary_text?.split(', ') || [];
      
      // The country is typically the last part
      const country = addressParts.length > 0 ? addressParts[addressParts.length - 1] : 'United Kingdom';
      
      // Extract administrative areas and location data
      let admin_district = '';
      let county = '';
      
      if (addressParts.length > 1) {
        // If we have multiple parts, the second-to-last might be a county or region
        if (addressParts.length >= 3) {
          county = addressParts[addressParts.length - 2];
        }
        
        // Use all parts except the country as the admin_district
        admin_district = addressParts.slice(0, -1).join(', ');
      }
      
      // Create a "clean" version of the address to display
      const cleanAddress = prediction.structured_formatting.main_text || prediction.description;
      
      return {
        // Store the place_id internally for use when selecting
        postcode: postcode || prediction.place_id,
        
        // Public-facing data that will be displayed to the user
        address: cleanAddress,
        country,
        county, // Add county information
        nhs_ha: '',
        admin_district,
        
        // Add a flag to indicate if this is a place ID rather than a real postcode
        isPlaceId: !postcode && !!prediction.place_id
      };
    });
    
    return suggestions;
  } catch (error) {
    console.error('Error fetching Google Places suggestions:', error);
    return [];
  }
};

// Helper function to load Google Maps script
const loadGoogleMapsScript = (apiKey: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // If script is already loaded, resolve immediately
    if (window.google && window.google.maps && window.google.maps.places) {
      googleMapsLoaded = true;
      resolve(true);
      return;
    }
    
    // If we've already tried to load and failed, don't try again
    if (loadAttempted && !googleMapsLoaded) {
      resolve(false);
      return;
    }
    
    loadAttempted = true;
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    // Set a timeout to handle cases where the script takes too long to load
    const timeoutId = setTimeout(() => {
      console.error('Google Maps script load timed out');
      resolve(false);
    }, 10000); // 10 second timeout
    
    script.onload = () => {
      clearTimeout(timeoutId);
      googleMapsLoaded = true;
      resolve(true);
    };
    
    script.onerror = (error) => {
      clearTimeout(timeoutId);
      console.error('Failed to load Google Maps script:', error);
      resolve(false);
    };
    
    document.head.appendChild(script);
  });
};
