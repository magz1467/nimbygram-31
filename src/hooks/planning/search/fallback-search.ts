
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
    query = query.limit(100); // Reduced from 200 to 100
    
    console.log('Executing fallback search query');
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
            .limit(50); // Reduced from 100 to 50
          
          const { data: reducedData, error: reducedError } = await reducedQuery;
          
          if (reducedError) {
            console.error('Reduced area search also failed:', reducedError);
            
            // Last resort - try an even smaller area with minimal filters
            console.log('Attempting last resort search with minimal area');
            
            try {
              const lastResortQuery = supabase
                .from('crystal_roof')
                .select('id, latitude, longitude, address, title, status')
                .gte('latitude', lat - (reducedLatDelta * 0.5))
                .lte('latitude', lat + (reducedLatDelta * 0.5))
                .gte('longitude', lng - (reducedLngDelta * 0.5))
                .lte('longitude', lng + (reducedLngDelta * 0.5))
                .limit(20);
                
              const { data: lastResortData, error: lastResortError } = await lastResortQuery;
              
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
