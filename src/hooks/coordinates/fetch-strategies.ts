
import { withTimeout } from '@/utils/promise-utils';
import { 
  fetchCoordinatesFromPlaceId,
  fetchCoordinatesByLocationName,
  fetchCoordinatesFromPostcodesIo,
  extractPlaceName
} from '@/services/coordinates';
import { resetGoogleMapsLoader } from '@/services/coordinates/google-maps-loader';

export async function fetchCoordinatesForPlaceId(
  searchTerm: string, 
  isMounted: boolean, 
  callbacks: {
    setCoordinates: (coords: [number, number]) => void,
    setPostcode: (postcode: string | null) => void,
  }
) {
  console.log('🌍 Detected Google Place ID, using Maps API to get coordinates');
  const placeCoords = await withTimeout(
    fetchCoordinatesFromPlaceId(searchTerm),
    15000, // Increased timeout
    "Timeout while retrieving location details"
  );
  if (isMounted) callbacks.setCoordinates(placeCoords);
}

export async function fetchCoordinatesForPostcode(
  searchTerm: string,
  isMounted: boolean,
  callbacks: {
    setCoordinates: (coords: [number, number]) => void,
    setPostcode: (postcode: string | null) => void,
  }
) {
  // Regular UK postcode - use Postcodes.io
  console.log('📫 Regular postcode detected, using Postcodes.io API');
  const postcodeCoords = await withTimeout(
    fetchCoordinatesFromPostcodesIo(searchTerm),
    10000,
    "Timeout while looking up postcode"
  );
  if (isMounted) {
    callbacks.setCoordinates(postcodeCoords);
    callbacks.setPostcode(searchTerm);
  }
}

export async function fetchCoordinatesForLocationName(
  searchTerm: string,
  isMounted: boolean,
  callbacks: {
    setCoordinates: (coords: [number, number]) => void,
    setPostcode: (postcode: string | null) => void,
  }
) {
  console.log('🏙️ Detected location name:', searchTerm);
  
  // Try with Postcodes.io first if it looks like a partial postcode
  if (searchTerm.length <= 4 && /^[A-Za-z]{1,2}[0-9]{1,2}$/.test(searchTerm)) {
    try {
      console.log('📫 Detected possible outcode, trying Postcodes.io first');
      // Will throw if not found
      const postcodeCoords = await withTimeout(
        fetchCoordinatesFromPostcodesIo(searchTerm + " 1AA"), // Add dummy inward code
        10000,
        "Timeout while looking up postcode"
      );
      if (isMounted) {
        callbacks.setCoordinates(postcodeCoords);
        callbacks.setPostcode(searchTerm);
      }
      return;
    } catch (postcodeError) {
      console.warn('⚠️ Postcode lookup failed, continuing with location search');
    }
  }
  
  try {
    // First try with the full search term
    console.log('🔍 Searching for exact location name:', searchTerm);
    const result = await withTimeout(
      fetchCoordinatesByLocationName(searchTerm),
      15000, // Increased timeout
      "Timeout while searching for location"
    );
    
    if (isMounted && result.coordinates) {
      console.log('✅ Found coordinates for location:', result.coordinates);
      callbacks.setCoordinates(result.coordinates);
      
      // If we got a postcode, save it
      if (result.postcode) {
        console.log('📫 Setting postcode from location search:', result.postcode);
        callbacks.setPostcode(result.postcode);
      }
    }
  } catch (locationError: any) {
    console.warn('⚠️ Location search failed:', locationError.message);
    
    // If it looks like an API key issue, try to reset the loader
    if (locationError.message.includes('API key') || 
        locationError.message.includes('denied') || 
        locationError.message.includes('not authorized')) {
      console.log('🔄 Resetting Google Maps loader due to API key issue');
      resetGoogleMapsLoader();
      
      // For API key issues, try to use Postcodes.io as a UK-specific fallback
      if (/\b[a-z]+\b/i.test(searchTerm)) {
        try {
          console.log('🔍 API key issue detected, trying UK place search as fallback');
          const response = await fetch(`https://api.postcodes.io/places?q=${encodeURIComponent(searchTerm)}&limit=1`);
          const data = await response.json();
          
          if (data.result && data.result.length > 0) {
            const place = data.result[0];
            console.log('📍 Found place using Postcodes.io:', place);
            if (place.latitude && place.longitude) {
              const fallbackCoords: [number, number] = [
                Number(place.latitude),
                Number(place.longitude)
              ];
              console.log('✅ Using coordinates from Postcodes.io place API:', fallbackCoords);
              if (isMounted) {
                callbacks.setCoordinates(fallbackCoords);
                // Also try to get the closest postcode for this location
                try {
                  const reverseResponse = await fetch(
                    `https://api.postcodes.io/postcodes?lon=${place.longitude}&lat=${place.latitude}&limit=1`
                  );
                  const reverseData = await reverseResponse.json();
                  if (reverseData.result && reverseData.result.length > 0) {
                    const nearestPostcode = reverseData.result[0].postcode;
                    console.log('📫 Found nearest postcode:', nearestPostcode);
                    callbacks.setPostcode(nearestPostcode);
                  }
                } catch (reverseError) {
                  console.error('❌ Failed to get nearest postcode:', reverseError);
                }
              }
              return;
            }
          }
        } catch (placeError) {
          console.error('❌ UK place search fallback failed:', placeError);
        }
      }
    }
    
    // Extract simplified place name as fallback
    const placeName = extractPlaceName(searchTerm);
    if (placeName && placeName !== searchTerm) {
      try {
        console.log('🔍 Trying with simplified place name:', placeName);
        const fallbackResult = await withTimeout(
          fetchCoordinatesByLocationName(placeName),
          15000, // Increased timeout
          "Timeout while searching for simplified location"
        );
        
        if (isMounted && fallbackResult.coordinates) {
          console.log('✅ Found coordinates for simplified location:', fallbackResult.coordinates);
          callbacks.setCoordinates(fallbackResult.coordinates);
          
          // If we got a postcode, save it
          if (fallbackResult.postcode) {
            console.log('📫 Setting postcode from simplified location:', fallbackResult.postcode);
            callbacks.setPostcode(fallbackResult.postcode);
          }
        }
      } catch (fallbackError) {
        console.error('❌ Both direct and simplified location searches failed');
        throw fallbackError;
      }
    } else {
      throw locationError;
    }
  }
}
