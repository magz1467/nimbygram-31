
import { withTimeout } from '@/utils/promise-utils';
import { 
  fetchCoordinatesFromPlaceId,
  fetchCoordinatesByLocationName,
  fetchCoordinatesFromPostcodesIo,
  fetchCoordinatesByAddress,
  extractPlaceName,
  detectLocationType
} from '@/services/coordinates';
import { resetGoogleMapsLoader } from '@/services/coordinates/google-maps-loader';

// Callback type for coordinate functions
type CoordinateCallbacks = {
  setCoordinates: (coords: [number, number]) => void,
  setPostcode: (postcode: string | null) => void,
};

export async function fetchCoordinatesForPlaceId(
  searchTerm: string, 
  isMounted: boolean, 
  callbacks: CoordinateCallbacks
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
  callbacks: CoordinateCallbacks
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

export async function fetchCoordinatesForOutcode(
  searchTerm: string,
  isMounted: boolean,
  callbacks: CoordinateCallbacks
) {
  console.log('📫 Outcode detected, fetching centroid from Postcodes.io API');
  try {
    // Use the outcode endpoint to get the centroid
    const response = await fetch(`https://api.postcodes.io/outcodes/${searchTerm}`);
    
    if (!response.ok) {
      throw new Error(`Outcode API returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📍 Outcode API response:', data);
    
    if (data.status === 200 && data.result) {
      if (typeof data.result.latitude === 'number' && typeof data.result.longitude === 'number') {
        const coords: [number, number] = [data.result.latitude, data.result.longitude];
        console.log('✅ Setting coordinates from outcode:', coords);
        
        if (isMounted) {
          callbacks.setCoordinates(coords);
          callbacks.setPostcode(searchTerm);
        }
        return;
      }
    }
    
    throw new Error("Invalid outcode response");
  } catch (error) {
    console.error('❌ Error getting outcode coordinates:', error);
    
    // Fall back to location name search as a town
    console.log('⚠️ Falling back to location search for outcode');
    await fetchCoordinatesForTown(searchTerm, isMounted, callbacks);
  }
}

export async function fetchCoordinatesForTown(
  searchTerm: string,
  isMounted: boolean,
  callbacks: CoordinateCallbacks
) {
  console.log('🏙️ Detected town or city name:', searchTerm);
  
  try {
    // First try with OS Places API to get better UK results
    console.log('🔍 Searching with OS Places API for town:', searchTerm);
    
    // Add "UK" suffix to improve results for town searches
    const enhancedSearchTerm = searchTerm.toLowerCase().includes('uk') ? 
      searchTerm : `${searchTerm}, UK`;
      
    const result = await fetchCoordinatesByAddress(enhancedSearchTerm);
    
    if (isMounted && result.coordinates) {
      console.log('✅ Found coordinates for town with OS API:', result.coordinates);
      callbacks.setCoordinates(result.coordinates);
      
      // If we got a postcode, save it
      if (result.postcode) {
        console.log('📫 Setting postcode from town search:', result.postcode);
        callbacks.setPostcode(result.postcode);
        return;
      }
    }
    
    // If OS API fails or doesn't return a postcode, try Google geocoding
    throw new Error("Town search with OS API didn't return complete results");
  } catch (error) {
    console.warn('⚠️ OS town search failed, falling back to Google geocoding:', error);
    
    // Fall back to standard location name search
    try {
      const result = await withTimeout(
        fetchCoordinatesByLocationName(searchTerm),
        15000,
        "Timeout while searching for town"
      );
      
      if (isMounted && result.coordinates) {
        console.log('✅ Found coordinates for town with Google geocoding:', result.coordinates);
        callbacks.setCoordinates(result.coordinates);
        
        if (result.postcode) {
          console.log('📫 Setting postcode from Google geocoding:', result.postcode);
          callbacks.setPostcode(result.postcode);
        }
      }
    } catch (locationError) {
      console.error('❌ Both OS and Google town searches failed:', locationError);
      throw locationError;
    }
  }
}

export async function fetchCoordinatesForAddress(
  searchTerm: string,
  isMounted: boolean,
  callbacks: CoordinateCallbacks
) {
  console.log('🏠 Detected address, using OS API:', searchTerm);
  
  try {
    const result = await withTimeout(
      fetchCoordinatesByAddress(searchTerm),
      15000,
      "Timeout while searching for address"
    );
    
    if (isMounted && result.coordinates) {
      console.log('✅ Found coordinates for address:', result.coordinates);
      callbacks.setCoordinates(result.coordinates);
      
      // If we got a postcode, save it
      if (result.postcode) {
        console.log('📫 Setting postcode from address search:', result.postcode);
        callbacks.setPostcode(result.postcode);
      }
    }
  } catch (error) {
    console.error('❌ Address search failed:', error);
    throw error;
  }
}

export async function fetchCoordinatesForLocationName(
  searchTerm: string,
  isMounted: boolean,
  callbacks: CoordinateCallbacks
) {
  // First, let's check what type of location we're dealing with more specifically
  const locationType = detectLocationType(searchTerm);
  
  console.log(`🔍 Refined location type detection: ${locationType} for "${searchTerm}"`);
  
  // Use specialized handlers for different location types
  switch (locationType) {
    case 'OUTCODE':
      await fetchCoordinatesForOutcode(searchTerm, isMounted, callbacks);
      return;
      
    case 'TOWN':
      await fetchCoordinatesForTown(searchTerm, isMounted, callbacks);
      return;
      
    case 'ADDRESS':
      await fetchCoordinatesForAddress(searchTerm, isMounted, callbacks);
      return;
  }
  
  // Generic location name handling as fallback
  console.log('🏙️ Processing generic location name:', searchTerm);
  
  // Try with Postcodes.io first if it looks like a partial postcode
  if (searchTerm.length <= 4 && /^[A-Za-z]{1,2}[0-9]{1,2}$/.test(searchTerm)) {
    try {
      console.log('📫 Detected possible outcode, trying Postcodes.io first');
      // Will throw if not found
      await fetchCoordinatesForOutcode(searchTerm, isMounted, callbacks);
      return;
    } catch (postcodeError) {
      console.warn('⚠️ Outcode lookup failed, continuing with location search');
    }
  }
  
  try {
    // First try with the full search term using Google's geocoding
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
      
      // For API key issues, try to use places.io as a UK-specific fallback
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
                // Also try to get the nearest postcode for this location
                try {
                  const reverseResponse = await fetch(
                    `https://api.postcodes.io/postcodes?lon=${place.longitude}&lat=${place.latitude}&limit=1`
                  );
                  
                  if (reverseResponse.ok) {
                    const reverseData = await reverseResponse.json();
                    
                    if (reverseData.result && reverseData.result.length > 0) {
                      const nearestPostcode = reverseData.result[0].postcode;
                      console.log('📫 Found nearest postcode:', nearestPostcode);
                      callbacks.setPostcode(nearestPostcode);
                    }
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
