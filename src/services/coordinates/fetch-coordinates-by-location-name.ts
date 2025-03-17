
/**
 * Utility functions for fetching coordinates using location names
 */
import { ensureGoogleMapsLoaded, resetGoogleMapsLoader } from "./google-maps-loader";
import { withTimeout } from "@/utils/fetchUtils";

// Mapping of UK area names to coordinates for fallback
const UK_AREA_COORDINATES: Record<string, { coordinates: [number, number], postcode?: string }> = {
  // Major cities
  'liverpool': { coordinates: [53.4084, -2.9916], postcode: "L1" },
  'manchester': { coordinates: [53.4808, -2.2426], postcode: "M1" },
  'london': { coordinates: [51.5074, -0.1278], postcode: "W1" },
  'birmingham': { coordinates: [52.4862, -1.8904], postcode: "B1" },
  'leeds': { coordinates: [53.8008, -1.5491], postcode: "LS1" },
  'glasgow': { coordinates: [55.8642, -4.2518], postcode: "G1" },
  'edinburgh': { coordinates: [55.9533, -3.1883], postcode: "EH1" },
  'cardiff': { coordinates: [51.4816, -3.1791], postcode: "CF1" },
  'belfast': { coordinates: [54.5973, -5.9301], postcode: "BT1" },
  'newcastle': { coordinates: [54.9783, -1.6178], postcode: "NE1" },
  'bristol': { coordinates: [51.4545, -2.5879], postcode: "BS1" },
  
  // London areas
  'enfield': { coordinates: [51.6521, -0.0806], postcode: "EN1" },
  'enfield wash': { coordinates: [51.6667, -0.0333], postcode: "EN3" },
  'barnet': { coordinates: [51.6503, -0.2001], postcode: "EN5" },
  'camden': { coordinates: [51.5390, -0.1426], postcode: "NW1" },
  'hackney': { coordinates: [51.5450, -0.0553], postcode: "E8" },
  'islington': { coordinates: [51.5362, -0.1031], postcode: "N1" },
  'kensington': { coordinates: [51.5016, -0.1926], postcode: "W8" },
  'lambeth': { coordinates: [51.4961, -0.1180], postcode: "SE1" },
  'southwark': { coordinates: [51.5037, -0.0885], postcode: "SE1" },
  'tower hamlets': { coordinates: [51.5130, -0.0243], postcode: "E1" },
  'wandsworth': { coordinates: [51.4570, -0.1927], postcode: "SW18" },
  'westminster': { coordinates: [51.4973, -0.1372], postcode: "SW1" },
  'brent': { coordinates: [51.5671, -0.2699], postcode: "NW9" },
  'ealing': { coordinates: [51.5130, -0.3089], postcode: "W5" },
  'harrow': { coordinates: [51.5880, -0.3355], postcode: "HA1" },
  'hounslow': { coordinates: [51.4684, -0.3338], postcode: "TW3" },
  'kingston': { coordinates: [51.4085, -0.3064], postcode: "KT1" },
  'merton': { coordinates: [51.4107, -0.2110], postcode: "SW19" },
  'redbridge': { coordinates: [51.5591, 0.0744], postcode: "IG1" },
  'richmond': { coordinates: [51.4615, -0.3035], postcode: "TW9" },
  'sutton': { coordinates: [51.3615, -0.1947], postcode: "SM1" },
  'waltham forest': { coordinates: [51.5908, -0.0134], postcode: "E17" },
  'croydon': { coordinates: [51.3728, -0.1004], postcode: "CR0" },
  'bromley': { coordinates: [51.4052, 0.0146], postcode: "BR1" },
  'bexley': { coordinates: [51.4536, 0.1450], postcode: "DA5" },
  'greenwich': { coordinates: [51.4808, -0.0090], postcode: "SE10" },
  'lewisham': { coordinates: [51.4452, -0.0202], postcode: "SE13" },
  'haringey': { coordinates: [51.5897, -0.1118], postcode: "N22" },
  'barking': { coordinates: [51.5387, 0.0809], postcode: "IG11" },
  'dagenham': { coordinates: [51.5584, 0.1347], postcode: "RM8" },
  'havering': { coordinates: [51.5770, 0.1825], postcode: "RM1" },
  'hillingdon': { coordinates: [51.5311, -0.4518], postcode: "UB8" },
  'newham': { coordinates: [51.5077, 0.0469], postcode: "E15" }
};

/**
 * Fetches coordinates for a location name using the Google Geocoding API
 * Also attempts to extract a postcode when possible for UK locations
 * @param locationName The name of the location to look up
 * @returns Promise with coordinates [lat, lng] and postcode if found
 */
export const fetchCoordinatesByLocationName = async (
  locationName: string
): Promise<{ coordinates: [number, number]; postcode?: string }> => {
  console.log('🔍 Fetching coordinates for location name:', locationName);
  
  if (!locationName) {
    throw new Error("No location name provided");
  }
  
  // Normalize the location name for comparison
  const normalizedLocationName = locationName.toLowerCase().trim();
  
  // Check if we have direct coordinates for this location
  for (const [key, value] of Object.entries(UK_AREA_COORDINATES)) {
    // We're using includes here to match partial names like "London" in "Central London"
    if (normalizedLocationName.includes(key)) {
      console.log(`🔍 Found direct coordinates match for "${key}" in "${normalizedLocationName}"`);
      return value;
    }
  }
  
  // Special case handling for London areas that might not be in our mapping
  if (normalizedLocationName.includes('london') || 
      normalizedLocationName.includes('greater london')) {
    console.log("🔍 Using London coordinates for London area that's not specifically mapped");
    return UK_AREA_COORDINATES['london'];
  }
  
  // Set much longer timeouts to match preview behavior
  const isLargeCity = /\b(london|manchester|birmingham|glasgow|edinburgh|newcastle|bristol|cardiff|belfast|leeds)\b/i.test(locationName);
  const timeoutMs = isLargeCity ? 60000 : 45000; // 60 seconds for large cities, 45 for others
  
  console.log(`🔍 Using ${timeoutMs}ms timeout for ${isLargeCity ? 'large city' : 'location'}: ${locationName}`);
  console.log(`🔍 Current hostname: ${window.location.hostname}`);
  
  try {
    // Reset Google Maps loader if we're seeing repeated API key issues
    // This will force a clean reload of the script
    if (window.google && window.google.maps && 
        typeof window.google.maps.Geocoder !== 'function') {
      console.log('🔄 Detected corrupted Google Maps instance, resetting loader');
      resetGoogleMapsLoader(true);
    }
    
    // First ensure Google Maps API is loaded
    await ensureGoogleMapsLoaded();
    
    // Check if Google Maps loaded properly
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      console.error('❌ Google Maps API not loaded properly, falling back to direct coordinates');
      
      // Try to find a partial match for fallback
      for (const [key, value] of Object.entries(UK_AREA_COORDINATES)) {
        const keyWords = key.split(' ');
        // Check if any word from the key is in the location name
        if (keyWords.some(word => normalizedLocationName.includes(word))) {
          console.log(`🔍 Found partial match with "${key}" for "${normalizedLocationName}"`);
          return value;
        }
      }
      
      // Default to London if we can't find anything
      console.log('🔍 No matches found, defaulting to London');
      return UK_AREA_COORDINATES['london'];
    }
    
    // Use Geocoding API instead of Places API for location names
    const geocoder = new google.maps.Geocoder();
    
    // Always append UK to the location name if not already there to be consistent
    const searchLocation = normalizedLocationName.includes('uk') ? 
      locationName : 
      `${locationName}, UK`;
    
    console.log('🔍 Enhanced search location:', searchLocation);
    
    // Wrap the geocoding promise with our timeout
    const geocodingPromise = new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      console.log('🔍 Starting geocoder.geocode call...');
      
      geocoder.geocode(
        { 
          address: searchLocation, 
          region: 'gb', // Force UK region for better results
          componentRestrictions: {
            country: 'gb' // Restrict to United Kingdom
          }
        }, 
        (results, status) => {
          console.log('🔍 Geocoder returned status:', status);
          console.log('🔍 Geocoder found results:', results ? results.length : 0);
          
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            console.log('✅ Geocoder found results:', results.length);
            resolve(results);
          } else {
            console.error('❌ Geocoder failed:', status);
            
            // Check for fallbacks in our mapping
            for (const [key, value] of Object.entries(UK_AREA_COORDINATES)) {
              if (normalizedLocationName.includes(key)) {
                console.log(`🔍 Using fallback for "${key}" after geocoder error`);
                // Create a mock result matching the expected structure
                resolve([{
                  geometry: {
                    location: {
                      lat: () => value.coordinates[0],
                      lng: () => value.coordinates[1]
                    },
                    location_type: 'APPROXIMATE',
                    viewport: null
                  },
                  formatted_address: `${key}, UK`,
                  address_components: [
                    value.postcode ? { long_name: value.postcode, short_name: value.postcode, types: ['postal_code'] } : undefined
                  ].filter(Boolean) as google.maps.GeocoderAddressComponent[],
                  types: ['locality'],
                  place_id: `fallback-${key}`
                } as google.maps.GeocoderResult]);
                return;
              }
            }
            
            // If no specific fallback found, check for London areas
            if (normalizedLocationName.includes('london') || 
                normalizedLocationName.includes('greater london')) {
              console.log('🔍 Using London fallback for geocoder error');
              resolve([{
                geometry: {
                  location: {
                    lat: () => 51.5074,
                    lng: () => -0.1278
                  },
                  location_type: 'APPROXIMATE',
                  viewport: null
                },
                formatted_address: 'London, UK',
                address_components: [
                  { long_name: 'W1', short_name: 'W1', types: ['postal_code'] }
                ],
                types: ['locality'],
                place_id: 'ChIJdd4hrwug2EcRmSrV3Vo6llI' // London place_id
              } as google.maps.GeocoderResult]);
              return;
            }
            
            // Use a more simplified error message that's consistent with preview
            reject(new Error(`Timeout while searching for simplified location "${locationName}". Please try a more specific location.`));
          }
        }
      );
    });
    
    // Apply timeout to the geocoding promise
    const response = await withTimeout(
      geocodingPromise,
      timeoutMs,
      `Timeout while searching for simplified location "${locationName}". Please try a more specific location.`
    );
    
    if (response && response.length > 0) {
      const result = response[0];
      const location = result.geometry.location;
      
      // Get coordinates in correct order - lat first, then lng
      const lat = location.lat();
      const lng = location.lng();
      
      console.log('📍 Got coordinates from Geocoding API:', [lat, lng], 'for location:', locationName);
      console.log('📍 Geometry location type:', result.geometry.location_type);
      console.log('📍 Formatted address:', result.formatted_address);
      
      // Try to extract postcode from address components
      let postcode: string | undefined;
      
      if (result.address_components) {
        // Look for postal code in address components
        const postcodeComponent = result.address_components.find(
          component => component.types.includes('postal_code')
        );
        
        if (postcodeComponent) {
          postcode = postcodeComponent.long_name;
          console.log('📫 Found postcode in address components:', postcode);
        }
      }
      
      // If we didn't find a postcode component, try to extract it from the formatted address
      if (!postcode && result.formatted_address) {
        // UK postcodes typically appear at the end of the address
        const ukPostcodeRegex = /[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}\b/i;
        const match = result.formatted_address.match(ukPostcodeRegex);
        
        if (match && match[0]) {
          postcode = match[0];
          console.log('📫 Extracted postcode from formatted address:', postcode);
        }
      }
      
      // If we still don't have a postcode, extract the outcode from the area
      if (!postcode) {
        // Look for an appropriate outcode in our mapping
        const locationLower = locationName.toLowerCase();
        
        for (const [key, value] of Object.entries(UK_AREA_COORDINATES)) {
          if (locationLower.includes(key) && value.postcode) {
            postcode = value.postcode;
            console.log(`📫 Using default outcode for "${key}": ${postcode}`);
            break;
          }
        }
        
        // If still no match, use central London as last resort
        if (!postcode && (locationLower.includes('london') || locationLower.includes('greater london'))) {
          postcode = "W1";
          console.log('📫 Using default London outcode: W1');
        }
      }
      
      // Return coordinates in correct [lat, lng] order for consistency with other services
      // Also include the postcode if we found one
      return { 
        coordinates: [lat, lng],
        postcode
      };
    }
    
    throw new Error(`No results found for location "${locationName}"`);
  } catch (error: any) {
    console.error('❌ Error in geocoding location name:', error);
    console.error('❌ Current hostname:', window.location.hostname);
    
    // Try to find a match in our UK area mapping
    for (const [key, value] of Object.entries(UK_AREA_COORDINATES)) {
      if (normalizedLocationName.includes(key)) {
        console.log(`🔍 Using ${key} fallback after error`);
        return value;
      }
    }
    
    // Check for London areas specifically
    if (normalizedLocationName.includes('london') || 
        normalizedLocationName.includes('greater london')) {
      console.log('🔍 Using London fallback after error');
      return UK_AREA_COORDINATES['london'];
    }
    
    // Check if the location might be a town near a major city
    // Very basic approach - look for partial word matches in our keys
    const words = normalizedLocationName.split(/\s+/);
    for (const word of words) {
      if (word.length > 3) { // Only check words with more than 3 characters
        for (const [key, value] of Object.entries(UK_AREA_COORDINATES)) {
          if (key.includes(word)) {
            console.log(`🔍 Found partial match "${key}" containing "${word}" from "${normalizedLocationName}"`);
            return value;
          }
        }
      }
    }
    
    // Simplified error message to match preview behavior
    throw new Error(`Timeout while searching for location "${locationName}". Please try a more specific location.`);
  }
};
