import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "../utils/distance-calculator";
import { createAppError } from "@/utils/errors/error-factory";
import { ErrorType, safeStringify } from "@/utils/errors/types";

/**
 * Performs a spatial search for planning applications
 * Since the RPC function might not exist, this function will return null if the function is not available
 * which will trigger the fallback search method
 */
export async function performSpatialSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: any
): Promise<Application[] | null> {
  try {
    console.log('Attempting spatial search with RPC function');
    console.log('Search parameters:', { lat, lng, radiusKm, filters });
    
    // Validate inputs
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      throw createAppError('Invalid coordinates for spatial search', null, {
        type: ErrorType.COORDINATES,
        context: { lat, lng, radiusKm },
        userMessage: 'We couldn\'t perform the search with the provided location. Please try a different search term.'
      });
    }

    if (!radiusKm || isNaN(radiusKm) || radiusKm <= 0) {
      radiusKm = 5; // Default to 5km if invalid radius
      console.log('Invalid radius provided, using default of 5km instead');
    }
    
    // Check if the RPC function exists by trying to call it
    let { data, error } = await supabase.rpc('get_nearby_applications', {
      center_lat: lat,
      center_lng: lng,
      radius_km: radiusKm,
      result_limit: 500
    });
    
    // If the function doesn't exist, return null to trigger fallback
    if (error) {
      if (error.message.includes('Could not find the function') || 
          error.message.includes('does not exist')) {
        console.log('Spatial search RPC function not available, will use fallback search');
        return null;
      }
      
      // For other errors, throw with proper error handling
      console.error('Spatial search error:', error);
      throw createAppError(`Spatial search error: ${error.message}`, error, {
        type: ErrorType.DATABASE,
        context: { lat, lng, radiusKm, filters },
        userMessage: 'We encountered an issue with the search. Please try again later.'
      });
    }
    
    if (!data) {
      console.log('No data returned from spatial search');
      return [];
    }
    
    if (data.length === 0) {
      console.log('No results found in spatial search');
      return [];
    }
    
    console.log(`Found ${data.length} results in spatial search`);
    
    // Apply additional filters if needed
    if (filters) {
      const filteredData = data.filter((app: any) => {
        // Status filter
        if (filters.status && app.status && 
            !app.status.toLowerCase().includes(filters.status.toLowerCase())) {
          return false;
        }
        
        // Type filter
        if (filters.type && app.type && 
            !app.type.toLowerCase().includes(filters.type.toLowerCase())) {
          return false;
        }
        
        // Classification filter
        if (filters.classification && app.classification && 
            !app.classification.toLowerCase().includes(filters.classification.toLowerCase())) {
          return false;
        }
        
        return true;
      });
      
      console.log(`Filtered from ${data.length} to ${filteredData.length} results`);
      data = filteredData;
    }
    
    // Add distance and sort
    const results = data
      .filter((app: any) => {
        // Safety check to ensure latitude and longitude are valid numbers
        const hasValidCoordinates = 
          typeof app.latitude === 'number' && 
          typeof app.longitude === 'number' && 
          !isNaN(app.latitude) && 
          !isNaN(app.longitude);
        
        if (!hasValidCoordinates) {
          console.log('Filtered out application with invalid coordinates:', app.id);
        }
        
        return hasValidCoordinates;
      })
      .map((app: any) => {
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
      .sort((a: any, b: any) => {
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
    // If it's already an AppError, rethrow it
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AppError') {
      console.error('Spatial search failed with AppError:', error);
      throw error;
    }
    
    // Otherwise, wrap the error in an AppError
    console.error('Spatial search error:', error);
    
    // Detect timeout errors
    const errorMessage = error instanceof Error ? error.message : safeStringify(error);
    const isTimeout = errorMessage.toLowerCase().includes('timeout') || 
                      errorMessage.toLowerCase().includes('too long') ||
                      errorMessage.toLowerCase().includes('canceling statement');
    
    throw createAppError(
      `Spatial search failed: ${errorMessage}`,
      error,
      {
        type: isTimeout ? ErrorType.TIMEOUT : ErrorType.DATABASE,
        context: { lat, lng, radiusKm, filters },
        userMessage: isTimeout 
          ? 'The search took too long to complete. Please try a smaller area or more specific location.'
          : 'We encountered an issue with the search. Please try again later.'
      }
    );
    
    // Return null to indicate fallback should be used
    // This line will actually never be reached due to the throw above,
    // but TypeScript might complain without it
    return null;
  }
}
