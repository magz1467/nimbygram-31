
import { PostcodeSuggestion } from '../../../types/address-suggestions';

/**
 * Processes a Google Places prediction into a PostcodeSuggestion
 * @param prediction The prediction from Google Places API
 * @param detailedPlace The detailed place information (if available)
 * @returns A PostcodeSuggestion object
 */
export const processPlacePrediction = (
  prediction: google.maps.places.AutocompletePrediction,
  detailedPlace?: google.maps.places.PlaceResult | null
): PostcodeSuggestion => {
  // Extract postcode from description if available (UK postcodes follow a pattern)
  const postcodeMatch = prediction.description.match(/[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}/i);
  const postcode = postcodeMatch ? postcodeMatch[0] : '';
  
  // Process address components to extract meaningful location data
  let locality = '';
  let district = '';
  let county = '';
  let country = 'United Kingdom';
  
  if (detailedPlace && detailedPlace.address_components) {
    // Process the detailed address components to extract location data
    for (const component of detailedPlace.address_components) {
      const types = component.types;
      
      if (types.includes('postal_town') || types.includes('locality')) {
        locality = component.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        county = component.long_name;
      } else if (types.includes('administrative_area_level_3')) {
        district = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      }
    }
  } else {
    // Fall back to parsing the description if detailed info wasn't available
    const addressParts = prediction.structured_formatting.secondary_text?.split(', ') || [];
    
    // The country is typically the last part
    if (addressParts.length > 0) {
      country = addressParts[addressParts.length - 1] || 'United Kingdom';
      
      // If we have multiple parts, the second-to-last might be a county or region
      if (addressParts.length >= 3) {
        county = addressParts[addressParts.length - 2];
      }
      
      if (addressParts.length >= 2) {
        locality = addressParts[0];
      }
    }
  }
  
  // Combine district and county information for admin_district field
  const adminDistrict = [district, county].filter(Boolean).join(', ');
  
  // Create a "clean" version of the address to display
  const streetAddress = prediction.structured_formatting.main_text || prediction.description.split(',')[0];
  
  return {
    // Use the place_id directly when there's no postcode
    postcode: postcode || prediction.place_id,
    
    // Public-facing data that will be displayed to the user
    address: streetAddress,
    locality: locality || '',
    county: county || '',
    district: district || '',
    country,
    admin_district: adminDistrict || county || '',
    nhs_ha: '',
    
    // Add a flag to indicate if this is a place ID rather than a real postcode
    isPlaceId: !postcode && !!prediction.place_id
  };
};
