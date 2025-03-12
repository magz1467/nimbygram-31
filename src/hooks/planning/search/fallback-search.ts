
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "../utils/distance-calculator";
import { createAppError } from "@/utils/errors/error-factory";
import { ErrorType, safeStringify } from "@/utils/errors/types";

/**
 * Performs a fallback search for planning applications using a bounding box approach
 * This is used when the spatial search function is not available
 */
export async function performFallbackSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: any
): Promise<Application[]> {
  console.log('Performing fallback search with bounding box approach');
  console.log('Search parameters:', { lat, lng, radiusKm, filters });
  
  try {
    // Input validation with detailed error messages
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      throw createAppError('Invalid coordinates for search', null, {
        type: ErrorType.COORDINATES,
        context: { lat, lng },
        userMessage: 'We couldn\'t find the location you specified. Please try a different search term.'
      });
    }
    
    if (!radiusKm || isNaN(radiusKm) || radiusKm <= 0) {
      console.log('Invalid radius detected, using default of 5km');
      radiusKm = 5; // Default to 5km
    }
    
    // Check if this is a known high-density area like HP22 6JJ
    const isHighDensityArea = isKnownHighDensityArea(lat, lng);
    if (isHighDensityArea) {
      console.log('High density area detected, using reduced search parameters');
      // Use smaller radius for high-density areas
      radiusKm = Math.min(radiusKm, 2);
      console.log('Adjusted radius for high-density area:', radiusKm);
    }
    
    // Calculate the latitude and longitude deltas for the bounding box
    // 1 degree of latitude = ~111.32 km
    // 1 degree of longitude = ~111.32 km * cos(latitude)
    const latDelta = radiusKm / 111.32;
    const lngDelta = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180));
    
    console.log('Calculated bounding box:', {
      latMin: lat - latDelta,
      latMax: lat + latDelta,
      lngMin: lng - lngDelta,
      lngMax: lng + lngDelta
    });
    
    // For high-density areas or large radius searches, fetch fewer results initially
    const resultLimit = isHighDensityArea || radiusKm > 3 ? 50 : 100;
    
    // Build the query with more robust error handling
    let query = supabase
      .from('crystal_roof')
      .select('*')
      .gte('latitude', lat - latDelta)
      .lte('latitude', lat + latDelta)
      .gte('longitude', lng - lngDelta)
      .lte('longitude', lng + lngDelta);
    
    // Apply filters with careful validation
    if (filters) {
      if (filters.status && typeof filters.status === 'string') {
        query = query.ilike('status', `%${filters.status}%`);
      }
      
      if (filters.type && typeof filters.type === 'string') {
        query = query.ilike('type', `%${filters.type}%`);
      }
      
      if (filters.classification && typeof filters.classification === 'string') {
        query = query.ilike('classification', `%${filters.classification}%`);
      }
    }
    
    // Limit the number of results to improve performance
    query = query.limit(resultLimit);
    
    console.log(`Executing fallback search query with limit: ${resultLimit}`);
    let { data, error } = await query;
    
    if (error) {
      console.error('Fallback search error:', error);
      
      // Handle timeout errors specifically with retry logic
      if (error.message.includes('timeout') || error.message.includes('canceling statement')) {
        console.log('Query timeout occurred, reducing search area');
        
        // Try a more restricted search area - make it even smaller this time
        const reducedRadius = Math.max(radiusKm * 0.3, 0.5); // Reduced from 0.5 to 0.3, ensure minimum 0.5km radius
        const reducedLatDelta = reducedRadius / 111.32;
        const reducedLngDelta = reducedRadius / (111.32 * Math.cos(lat * Math.PI / 180));
        
        console.log('Retrying with reduced radius:', reducedRadius);
        
        try {
          // More restricted query with even lower limits
          const reducedQuery = supabase
            .from('crystal_roof')
            .select('*')
            .gte('latitude', lat - reducedLatDelta)
            .lte('latitude', lat + reducedLatDelta)
            .gte('longitude', lng - reducedLngDelta)
            .lte('longitude', lng + reducedLngDelta)
            .limit(30); // Reduced from 50 to 30
          
          const { data: reducedData, error: reducedError } = await reducedQuery;
          
          if (reducedError) {
            console.error('Reduced area search also failed:', reducedError);
            
            // Last resort - try an even smaller area with minimal fields
            console.log('Attempting last resort search with minimal area');
            
            try {
              // Include only essential fields to speed up the query
              const lastResortQuery = supabase
                .from('crystal_roof')
                .select('id, latitude, longitude, address, title, status')
                .gte('latitude', lat - (reducedLatDelta * 0.5))
                .lte('latitude', lat + (reducedLatDelta * 0.5))
                .gte('longitude', lng - (reducedLngDelta * 0.5))
                .lte('longitude', lng + (reducedLngDelta * 0.5))
                .limit(15); // Further reduced limit
                
              const { data: lastResortData, error: lastResortError } = await lastResortQuery;
              
              // Emergency fallback for very problematic postcodes (like HP22 6JJ)
              if ((lastResortError || !lastResortData || lastResortData.length === 0) && 
                  isHighDensityArea) {
                console.log('All standard methods failed for known high-density area, using micro search');
                return performMicroSearch(lat, lng, filters);
              }
              
              if (lastResortError || !lastResortData || lastResortData.length === 0) {
                throw createAppError('Search failed after multiple retries', lastResortError || reducedError, { 
                  type: ErrorType.TIMEOUT,
                  recoverable: true,
                  userMessage: 'The search took too long. Please try a smaller area, a more specific location, or try again later.'
                });
              }
              
              console.log(`Last resort search found ${lastResortData.length} results`);
              data = lastResortData;
            } catch (finalError) {
              // If we're in a known high-density area, try one last emergency approach
              if (isHighDensityArea) {
                console.log('All standard methods failed for known high-density area, using micro search');
                return performMicroSearch(lat, lng, filters);
              }
              
              throw createAppError('All search attempts failed', finalError, { 
                type: ErrorType.TIMEOUT,
                userMessage: 'We had trouble searching this area. Please try a more specific location or try again later.'
              });
            }
          } else if (!reducedData || reducedData.length === 0) {
            console.log('No results found in reduced search area');
            return [];
          } else {
            console.log(`Found ${reducedData.length} results in reduced search area`);
            data = reducedData;
          }
        } catch (retryError) {
          // If we're in a known high-density area, try one last emergency approach
          if (isHighDensityArea) {
            console.log('All standard methods failed for known high-density area, using micro search');
            return performMicroSearch(lat, lng, filters);
          }
          
          // If the retry also fails, throw a more specific error
          throw createAppError('Search failed after retry with reduced area', retryError, {
            type: ErrorType.TIMEOUT,
            context: { lat, lng, originalRadius: radiusKm, reducedRadius },
            userMessage: 'The search took too long to complete. Please try a more specific location.'
          });
        }
      } else {
        // For non-timeout errors, provide a more specific error type and context
        const errorType = detectErrorType(error);
        throw createAppError('Database search failed', error, { 
          type: errorType,
          context: { lat, lng, radiusKm, errorCode: error.code },
          userMessage: getErrorUserMessage(errorType)
        });
      }
    }
    
    if (!data) {
      console.log('No data returned from fallback search');
      return [];
    }
    
    if (data.length === 0) {
      console.log('No results found in fallback search');
      return [];
    }
    
    console.log(`Found ${data.length} results in fallback search`);
    
    // Add distance and sort results with careful error handling
    const results = data
      .filter((app) => {
        // Ensure valid coordinates to prevent calculation errors
        const hasValidCoordinates = 
          typeof app.latitude === 'number' && 
          typeof app.longitude === 'number' && 
          !isNaN(app.latitude) && 
          !isNaN(app.longitude);
        
        if (!hasValidCoordinates) {
          console.log('Filtering out application with invalid coordinates:', app.id);
        }
        
        return hasValidCoordinates;
      })
      .map((app) => {
        try {
          const distanceKm = calculateDistance(lat, lng, Number(app.latitude), Number(app.longitude));
          const distanceMiles = distanceKm * 0.621371;
          
          return {
            ...app,
            distance: `${distanceMiles.toFixed(1)} mi`,
            coordinates: [Number(app.latitude), Number(app.longitude)] as [number, number]
          };
        } catch (err) {
          console.error('Error calculating distance for application:', app.id, err);
          // Return the application without distance info if calculation fails
          return {
            ...app,
            distance: 'Unknown',
            coordinates: [Number(app.latitude), Number(app.longitude)] as [number, number]
          };
        }
      })
      .sort((a, b) => {
        try {
          const distA = calculateDistance(lat, lng, Number(a.latitude), Number(a.longitude));
          const distB = calculateDistance(lat, lng, Number(b.latitude), Number(b.longitude));
          return distA - distB;
        } catch (err) {
          console.error('Error sorting applications by distance:', err);
          return 0; // Keep original order if comparison fails
        }
      });
    
    console.log(`Returning ${results.length} filtered and sorted results`);
    return results;
  } catch (error) {
    console.error('Error in fallback search:', error);
    
    // If it's already an AppError, rethrow it
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AppError') {
      throw error;
    }
    
    // Wrap in AppError with improved error type detection
    const errorMessage = error instanceof Error ? error.message : safeStringify(error);
    const errorType = detectErrorType(error);
    
    throw createAppError(
      `Failed to perform fallback search: ${errorMessage}`, 
      error, 
      {
        type: errorType,
        recoverable: errorType === ErrorType.NETWORK || errorType === ErrorType.TIMEOUT,
        context: { lat, lng, radiusKm, filters },
        userMessage: getErrorUserMessage(errorType)
      }
    );
  }
}

/**
 * A last-resort search method for problematic high-density areas
 * Uses a very small radius and limited fields to improve performance
 */
async function performMicroSearch(lat: number, lng: number, filters: any): Promise<Application[]> {
  console.log('Performing micro search for high-density area');
  
  const microRadius = 0.3; // 300 meters only
  const latDelta = microRadius / 111.32;
  const lngDelta = microRadius / (111.32 * Math.cos(lat * Math.PI / 180));
  
  try {
    // Ultra-minimal query with only essential fields
    const query = supabase
      .from('crystal_roof')
      .select('id, latitude, longitude, address, title, status, type, decision_date')
      .gte('latitude', lat - latDelta)
      .lte('latitude', lat + latDelta)
      .gte('longitude', lng - lngDelta)
      .lte('longitude', lng + lngDelta)
      .limit(10); // Very low limit to ensure we get at least some results
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Micro search failed:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No results found in micro search');
      return [];
    }
    
    console.log(`Micro search found ${data.length} results`);
    
    // Process results
    const results = data.map(app => {
      try {
        const distanceKm = calculateDistance(lat, lng, Number(app.latitude), Number(app.longitude));
        const distanceMiles = distanceKm * 0.621371;
        
        return {
          ...app,
          distance: `${distanceMiles.toFixed(1)} mi`,
          coordinates: [Number(app.latitude), Number(app.longitude)] as [number, number]
        };
      } catch (err) {
        return {
          ...app,
          distance: 'Nearby',
          coordinates: [Number(app.latitude), Number(app.longitude)] as [number, number]
        };
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error in micro search:', error);
    throw createAppError(
      'Emergency micro search failed', 
      error,
      {
        type: ErrorType.SEARCH,
        context: { lat, lng, microRadius: microRadius },
        userMessage: 'We found too many planning applications in this area. Please try searching for a specific street within this postcode area.'
      }
    );
  }
}

/**
 * Check if the coordinates are in a known high-density area
 * These are areas that typically cause timeouts
 */
function isKnownHighDensityArea(lat: number, lng: number): boolean {
  // Special case for HP22 6JJ area (and surrounding)
  const isHp226jjArea = 
    lat >= 51.755 && lat <= 51.775 && 
    lng >= -0.755 && lng <= -0.735;
    
  // Add other problematic areas here as needed
  const isAmershamArea = 
    lat >= 51.65 && lat <= 51.68 && 
    lng >= -0.63 && lng <= -0.57;
    
  const isBathArea =
    lat >= 51.35 && lat <= 51.40 && 
    lng >= -2.40 && lng <= -2.33;
    
  return isHp226jjArea || isAmershamArea || isBathArea;
}

// Helper function to determine error type
function detectErrorType(error: any): ErrorType {
  if (!error) return ErrorType.UNKNOWN;
  
  const message = typeof error === 'string' 
    ? error.toLowerCase() 
    : error instanceof Error 
      ? error.message.toLowerCase()
      : error.message 
        ? error.message.toLowerCase() 
        : '';
  
  if (message.includes('timeout') || message.includes('too long') || message.includes('canceling statement')) {
    return ErrorType.TIMEOUT;
  } else if (message.includes('network') || message.includes('fetch') || message.includes('connection') || !navigator?.onLine) {
    return ErrorType.NETWORK;
  } else if (message.includes('not found') || message.includes('no results')) {
    return ErrorType.NOT_FOUND;
  } else if (message.includes('coordinates') || message.includes('location')) {
    return ErrorType.COORDINATES;
  } else if (message.includes('database') || message.includes('sql') || message.includes('query') || message.includes('syntax')) {
    return ErrorType.DATABASE;
  } else if (message.includes('permission') || message.includes('access') || message.includes('unauthorized')) {
    return ErrorType.PERMISSION;
  }
  
  return ErrorType.UNKNOWN;
}

// Helper function to get user-friendly error messages
function getErrorUserMessage(errorType: ErrorType): string {
  switch (errorType) {
    case ErrorType.NETWORK:
      return "We're having trouble connecting to our servers. Please check your internet connection and try again.";
    case ErrorType.TIMEOUT:
      return "The search took too long to complete. Please try a more specific location or different filters.";
    case ErrorType.NOT_FOUND:
      return "We couldn't find any planning applications matching your search criteria.";
    case ErrorType.COORDINATES:
      return "We couldn't find the location you specified. Please try a different search term.";
    case ErrorType.DATABASE:
      return "We encountered an issue with our database. Please try again later.";
    case ErrorType.PERMISSION:
      return "You don't have permission to access this information.";
    default:
      return "We had trouble searching for planning applications. Please try again later.";
  }
}
