
import { Application } from "@/types/planning";
import { createFallbackSearchError } from "./error-handling";
import { buildBoundingBoxQuery, buildReducedAreaQuery, buildLastResortQuery } from "./query-builder";
import { processApplicationResults } from "./results-processor";
import { FallbackSearchParams } from "./types";
import { ErrorType } from "@/utils/errors/types";

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
      throw createFallbackSearchError(
        'Invalid coordinates for search', 
        null, 
        { lat, lng },
        ErrorType.COORDINATES
      );
    }
    
    if (!radiusKm || isNaN(radiusKm) || radiusKm <= 0) {
      console.log('Invalid radius detected, using default of 5km');
      radiusKm = 5; // Default to 5km
    }
    
    const searchParams: FallbackSearchParams = { lat, lng, radiusKm, filters };
    
    // Execute the primary query
    console.log('Executing fallback search query');
    const query = buildBoundingBoxQuery(searchParams);
    let { data, error } = await query;
    
    if (error) {
      console.error('Fallback search error:', error);
      
      // Handle timeout errors specifically with retry logic
      if (error.message.includes('timeout') || error.message.includes('canceling statement')) {
        console.log('Query timeout occurred, reducing search area');
        
        // Try a more restricted search area
        try {
          const reducedQuery = buildReducedAreaQuery(searchParams);
          const { data: reducedData, error: reducedError } = await reducedQuery;
          
          if (reducedError) {
            console.error('Reduced area search also failed:', reducedError);
            
            // Last resort - try an even smaller area with minimal filters
            try {
              const lastResortQuery = buildLastResortQuery(searchParams);
              const { data: lastResortData, error: lastResortError } = await lastResortQuery;
              
              if (lastResortError || !lastResortData || lastResortData.length === 0) {
                throw createFallbackSearchError(
                  'Search failed after multiple retries', 
                  lastResortError || reducedError, 
                  { searchParams },
                  ErrorType.TIMEOUT
                );
              }
              
              console.log(`Last resort search found ${lastResortData.length} results`);
              data = lastResortData;
            } catch (finalError) {
              throw createFallbackSearchError(
                'All search attempts failed', 
                finalError, 
                { searchParams },
                ErrorType.TIMEOUT
              );
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
          throw createFallbackSearchError(
            'Search failed after retry with reduced area', 
            retryError, 
            { 
              lat, lng, 
              originalRadius: radiusKm, 
              reducedRadius: radiusKm * 0.3
            },
            ErrorType.TIMEOUT
          );
        }
      } else {
        // For non-timeout errors, provide a specific error
        throw createFallbackSearchError(
          'Database search failed', 
          error, 
          { lat, lng, radiusKm, errorCode: error.code }
        );
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
    
    // Process and return the results
    const results = processApplicationResults(data, lat, lng);
    
    console.log(`Returning ${results.length} filtered and sorted results`);
    return results;
  } catch (error) {
    console.error('Error in fallback search:', error);
    
    // If it's already an AppError, rethrow it
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AppError') {
      throw error;
    }
    
    // Wrap other errors
    throw createFallbackSearchError(
      `Failed to perform fallback search: ${error instanceof Error ? error.message : 'Unknown error'}`, 
      error, 
      { lat, lng, radiusKm, filters }
    );
  }
}
