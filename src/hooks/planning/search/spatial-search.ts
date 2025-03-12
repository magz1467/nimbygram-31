
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { SearchFilters } from "../use-planning-search";
import { calculateDistance } from "../utils/distance-calculator";

// Performance tracking
const spatialPerformanceMetrics = {
  successCount: 0,
  failureCount: 0,
  totalDuration: 0,
  maxDuration: 0,
  lastErrorTimestamp: 0,
  errors: [] as string[]
};

/**
 * Log spatial search metrics
 */
function logSpatialSearchMetrics() {
  const avgDuration = spatialPerformanceMetrics.successCount > 0 
    ? spatialPerformanceMetrics.totalDuration / spatialPerformanceMetrics.successCount 
    : 0;
    
  console.log('📊 Spatial Search Metrics:');
  console.log(`Success rate: ${spatialPerformanceMetrics.successCount}/${spatialPerformanceMetrics.successCount + spatialPerformanceMetrics.failureCount} (${Math.round(spatialPerformanceMetrics.successCount * 100 / (spatialPerformanceMetrics.successCount + spatialPerformanceMetrics.failureCount || 1))}%)`);
  console.log(`Average duration: ${avgDuration.toFixed(2)}ms`);
  console.log(`Max duration: ${spatialPerformanceMetrics.maxDuration}ms`);
  
  if (spatialPerformanceMetrics.errors.length > 0) {
    console.log('Recent errors:');
    spatialPerformanceMetrics.errors.slice(-3).forEach((err, i) => 
      console.log(`${i+1}. ${err}`)
    );
  }
}

/**
 * Attempts to use the optimized PostGIS spatial search function with improved error handling,
 * timeout management, and detailed diagnostics
 */
export async function performSpatialSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: SearchFilters
): Promise<Application[] | null> {
  console.group('🔍 Spatial Search - DETAILED DIAGNOSTICS');
  const overallStartTime = Date.now();
  
  console.log('Starting PostGIS spatial search with params:', { lat, lng, radiusKm, filters });
  console.log('Connection status:', navigator.onLine ? 'online' : 'offline');
  console.log('Current performance metrics:', {
    successRate: `${spatialPerformanceMetrics.successCount}/${spatialPerformanceMetrics.successCount + spatialPerformanceMetrics.failureCount}`,
    lastError: spatialPerformanceMetrics.lastErrorTimestamp > 0 
      ? new Date(spatialPerformanceMetrics.lastErrorTimestamp).toISOString() 
      : 'none'
  });
  
  try {
    // Add a timeout to the spatial search (increased to 15 seconds for simple postcode searches)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log('⏱️ Spatial search timeout reached (15 seconds)');
    }, 15000); // 15 second timeout for better reliability
    
    console.log('Starting spatial search with RPC call');
    const startTime = Date.now();
    console.log(`RPC call started at: ${new Date(startTime).toISOString()}`);
    
    // Execute the spatial function with proper timeout handling
    const { data: spatialData, error: spatialError } = await supabase
      .rpc('get_nearby_applications', { 
        center_lat: lat,
        center_lng: lng,
        radius_km: radiusKm,
        result_limit: 100 // Reasonable limit for better performance
      })
      .abortSignal(controller.signal);
    
    // Clear timeout
    clearTimeout(timeoutId);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Spatial query execution time: ${duration}ms`);
    console.log(`RPC call completed at: ${new Date(endTime).toISOString()}`);
    
    // Track performance metrics
    if (!spatialError) {
      spatialPerformanceMetrics.successCount++;
      spatialPerformanceMetrics.totalDuration += duration;
      if (duration > spatialPerformanceMetrics.maxDuration) {
        spatialPerformanceMetrics.maxDuration = duration;
      }
    }
      
    if (spatialError) {
      spatialPerformanceMetrics.failureCount++;
      spatialPerformanceMetrics.lastErrorTimestamp = Date.now();
      
      // Limit error history to last 10 errors
      if (spatialPerformanceMetrics.errors.length >= 10) {
        spatialPerformanceMetrics.errors.shift();
      }
      spatialPerformanceMetrics.errors.push(`${spatialError.code || 'unknown'}: ${spatialError.message}`);
      
      console.error('PostGIS function detailed error:', {
        error: spatialError,
        code: spatialError.code,
        message: spatialError.message,
        details: spatialError.details,
        hint: spatialError.hint,
        queryTime: `${duration}ms`,
        searchParams: { lat, lng, radiusKm },
        timestamp: new Date().toISOString()
      });
      
      // Log performance metrics on error
      logSpatialSearchMetrics();
      console.groupEnd();
      return null;
    }
    
    if (!spatialData || spatialData.length === 0) {
      console.log('No results from spatial search', { lat, lng, radiusKm });
      console.groupEnd();
      return [];
    }
    
    console.log(`✅ Found ${spatialData.length} planning applications using spatial query`);
    
    // Apply filters after getting the data
    let filteredData = spatialData;
    const preFilterCount = filteredData.length;
    
    if (filters.status && filters.status !== 'all') {
      console.log('Filtering by status:', filters.status);
      filteredData = filteredData.filter(app => 
        app.status && app.status.toLowerCase().includes(filters.status!.toLowerCase())
      );
    }
    
    if (filters.type && filters.type !== 'all') {
      console.log('Filtering by type:', filters.type);
      filteredData = filteredData.filter(app => 
        (app.type && app.type.toLowerCase().includes(filters.type!.toLowerCase())) ||
        (app.application_type_full && app.application_type_full.toLowerCase().includes(filters.type!.toLowerCase())) ||
        (app.application_type && app.application_type.toLowerCase().includes(filters.type!.toLowerCase()))
      );
    }
    
    if (filters.classification && filters.classification !== 'all') {
      console.log('Filtering by classification:', filters.classification);
      filteredData = filteredData.filter(app => 
        app.class_3 && app.class_3.toLowerCase().includes(filters.classification!.toLowerCase())
      );
    }
    
    console.log(`After filtering: ${filteredData.length} applications remain (filtered out ${preFilterCount - filteredData.length})`);
    
    // Calculate distance and add it to the results
    const processingStartTime = Date.now();
    
    const results = filteredData.map(app => {
      const distance = calculateDistance(
        lat,
        lng,
        Number(app.latitude),
        Number(app.longitude)
      );
      
      // Convert to miles with proper formatting
      const distanceMiles = distance * 0.621371;
      
      return { 
        ...app, 
        distance: `${distanceMiles.toFixed(1)} mi`
      };
    });
    
    const processingEndTime = Date.now();
    console.log(`Results processing time: ${processingEndTime - processingStartTime}ms`);
    
    if (results.length > 0) {
      console.log('First result:', {
        id: results[0].id,
        distance: results[0].distance,
        coordinates: [results[0].latitude, results[0].longitude]
      });
      
      if (results.length > 1) {
        console.log('Last result:', {
          id: results[results.length-1].id,
          distance: results[results.length-1].distance,
          coordinates: [results[results.length-1].latitude, results[results.length-1].longitude]
        });
      }
    }
    
    const overallEndTime = Date.now();
    console.log(`Total spatial search time: ${overallEndTime - overallStartTime}ms`);
    
    // Log metrics periodically
    if (spatialPerformanceMetrics.successCount % 5 === 0) {
      logSpatialSearchMetrics();
    }
    
    console.groupEnd();
    return results;
  } catch (error: any) {
    spatialPerformanceMetrics.failureCount++;
    spatialPerformanceMetrics.lastErrorTimestamp = Date.now();
    
    // Limit error history to last 10 errors
    if (spatialPerformanceMetrics.errors.length >= 10) {
      spatialPerformanceMetrics.errors.shift();
    }
    spatialPerformanceMetrics.errors.push(`${error.name || 'unknown'}: ${error.message}`);
    
    // Handle AbortError specially
    if (error.name === 'AbortError') {
      console.log('Spatial search was aborted due to timeout');
      error.message = 'Spatial search timeout. The area might have too many applications.';
    }
    
    console.error('Detailed error in spatial search:', {
      error,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      searchParams: { lat, lng, radiusKm, filters },
      timestamp: new Date().toISOString(),
      navigator: {
        onLine: navigator.onLine,
        userAgent: navigator.userAgent,
        language: navigator.language
      }
    });
    
    // Log performance metrics
    logSpatialSearchMetrics();
    console.groupEnd();
    return null;
  }
}
