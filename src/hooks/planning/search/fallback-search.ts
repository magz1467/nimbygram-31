
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { SearchFilters } from "../use-planning-search";
import { calculateDistance } from "../utils/distance-calculator";

// Performance and error tracking
let globalQueryTimes: number[] = [];
let globalErrorCounts = {
  timeout: 0,
  database: 0,
  network: 0,
  unknown: 0
};

/**
 * Log search metrics to console for analysis
 */
function logSearchMetrics() {
  const avgTime = globalQueryTimes.reduce((sum, time) => sum + time, 0) / 
                 (globalQueryTimes.length || 1);
                 
  console.log('📊 Fallback Search Metrics:');
  console.log(`Average query time: ${avgTime.toFixed(2)}ms`);
  console.log(`Query time samples: ${globalQueryTimes.length}`);
  console.log('Error counts:', globalErrorCounts);
}

/**
 * Performs a manual bounding box search as a fallback when spatial search is unavailable
 * With significantly improved performance through query optimization and detailed diagnostics
 */
export async function performFallbackSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: SearchFilters
): Promise<Application[]> {
  console.group('🔍 Fallback Search - DETAILED DIAGNOSTICS');
  const startTime = Date.now();
  
  console.log('Starting fallback search with params:', { lat, lng, radiusKm, filters });
  
  // For large cities like Bath, reduce the initial search radius to improve performance
  // We'll determine if the location is likely a city by checking for common indicators
  const isMajorLocation = radiusKm >= 5; // Consider any 5km+ radius search as potentially a city
  
  // Use a smaller radius for the initial search if this appears to be a city
  const searchRadiusKm = isMajorLocation ? Math.min(radiusKm, 2) : radiusKm;
  
  console.log(`Adjusted radius: ${searchRadiusKm}km (originally ${radiusKm}km)`);
  console.log('Major location detection:', isMajorLocation);
  
  // Calculate bounding box (with more precise calculations)
  const latDegPerKm = 1 / 111;
  const lngDegPerKm = 1 / (111 * Math.cos(lat * Math.PI / 180));
  
  const latMin = lat - (searchRadiusKm * latDegPerKm);
  const latMax = lat + (searchRadiusKm * latDegPerKm);
  const lngMin = lng - (searchRadiusKm * lngDegPerKm);
  const lngMax = lng + (searchRadiusKm * lngDegPerKm);
  
  console.log('Bounding box parameters:', { latMin, latMax, lngMin, lngMax });
  
  // Log database info
  console.log('Connection status before query:', navigator.onLine ? 'online' : 'offline');
  
  // Create base query
  let query = supabase
    .from('crystal_roof')
    .select('*', { count: 'exact' })
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .gte('latitude', latMin)
    .lte('latitude', latMax)
    .gte('longitude', lngMin)
    .lte('longitude', lngMax);
  
  console.log('Starting with base query');
  
  // Add optional filters
  if (filters.status) {
    console.log('Adding status filter:', filters.status);
    query = query.ilike('status', `%${filters.status}%`);
  }
  
  if (filters.type) {
    console.log('Adding type filter:', filters.type);
    query = query.or(`type.ilike.%${filters.type}%`);
  }
  
  if (filters.classification) {
    console.log('Adding classification filter:', filters.classification);
    query = query.ilike('class_3', `%${filters.classification}%`);
  }
  
  try {
    // Add strict limit to prevent timeouts
    const queryLimit = 35; // Further reduced limit for reliability
    console.log(`Executing fallback search query with limit ${queryLimit}`);
    
    // Log the SQL query if possible
    try {
      const queryObject = query.limit(queryLimit);
      console.log('Query SQL (if available):', (queryObject as any)?.query?.toString() || 'Not available');
    } catch (e) {
      console.log('Could not extract SQL query');
    }
    
    const queryStartTime = Date.now();
    console.log(`Query started at: ${new Date(queryStartTime).toISOString()}`);
    
    const { data, error, count } = await query.limit(queryLimit).timeout(15);
    
    const queryEndTime = Date.now();
    const queryDuration = queryEndTime - queryStartTime;
    console.log(`Query execution time: ${queryDuration}ms`);
    console.log(`Query completed at: ${new Date(queryEndTime).toISOString()}`);
    
    // Track query times for metrics
    globalQueryTimes.push(queryDuration);
    if (globalQueryTimes.length > 50) globalQueryTimes.shift(); // Keep last 50 only
    
    if (error) {
      console.error('Supabase query error details:', {
        code: error.code,
        message: error.message,
        hint: error.hint,
        details: error.details,
        queryTime: `${queryDuration}ms`
      });
      
      // Track error types
      if (error.code === '57014' || (error.message && error.message.includes('timeout'))) {
        globalErrorCounts.timeout++;
      } else if (error.code?.startsWith('5') || error.code?.startsWith('53')) {
        globalErrorCounts.database++;
      } else {
        globalErrorCounts.unknown++;
      }
      
      // Log error metrics
      logSearchMetrics();
      
      // Handle timeout errors with a more specific error
      if (error.code === '57014' || (error.message && error.message.includes('timeout'))) {
        const timeoutError = new Error('The search took too long to complete. Please try a more specific location or different filters.');
        timeoutError.name = 'SearchTimeoutError';
        (timeoutError as any).code = error.code || 'TIMEOUT';
        (timeoutError as any).originalError = error;
        throw timeoutError;
      }
      
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No results found for the search criteria', { lat, lng, radiusKm, filters });
      console.log('Exact record count:', count);
      console.groupEnd();
      return [];
    }
    
    // Calculate distance for each application and sort by distance
    console.log(`Processing ${data.length} results from fallback search`);
    const processingStartTime = Date.now();
    
    const results = data.map(app => {
      if (!app.latitude || !app.longitude) {
        console.warn('Application missing coordinates:', app.id);
        return { ...app, distance: Number.MAX_SAFE_INTEGER };
      }
      
      const distance = calculateDistance(
        lat,
        lng,
        Number(app.latitude),
        Number(app.longitude)
      );
      return { ...app, distance };
    }).sort((a, b) => a.distance - b.distance);
    
    const processingEndTime = Date.now();
    console.log(`Results processing time: ${processingEndTime - processingStartTime}ms`);
    
    console.log(`✅ Found ${results.length} planning applications with fallback query`);
    if (results.length > 0) {
      console.log('First result:', {
        id: results[0].id,
        distance: results[0].distance,
        coordinates: [results[0].latitude, results[0].longitude]
      });
      console.log('Last result:', {
        id: results[results.length-1].id,
        distance: results[results.length-1].distance,
        coordinates: [results[results.length-1].latitude, results[results.length-1].longitude]
      });
    }
    
    // If we got close to the limit and used a reduced radius, warn the user
    if (results.length >= queryLimit-5 && isMajorLocation) {
      console.log('Results limited for performance. Consider a more specific search location.');
    }
    
    const endTime = Date.now();
    console.log(`Total fallback search time: ${endTime - startTime}ms`);
    
    // Log search metrics periodically
    if (globalQueryTimes.length % 5 === 0) {
      logSearchMetrics();
    }
    
    console.groupEnd();
    return results;
  } catch (error) {
    console.error('Detailed error in fallback search:', {
      error,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      searchParams: { lat, lng, radiusKm, filters },
      timestamp: new Date().toISOString()
    });
    
    if (navigator.onLine === false) {
      globalErrorCounts.network++;
      console.error('Browser is offline - likely network error');
    } else {
      globalErrorCounts.unknown++;
    }
    
    // Log metrics on error
    logSearchMetrics();
    
    // Provide better error messages for common issues
    if (error.message?.includes('timeout') || error.message?.includes('too long')) {
      console.groupEnd();
      throw new Error('The search took too long to complete. Please try a more specific location or different filters.');
    }
    
    console.groupEnd();
    throw new Error(`Fallback search failed: ${error.message}`);
  }
}
