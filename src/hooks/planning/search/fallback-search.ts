
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "../utils/distance-calculator";
import { SearchFilters } from "../use-planning-search";

/**
 * Fallback search with manual bounding box for when the spatial function isn't available
 */
export const performFallbackSearch = async (
  lat: number,
  lng: number,
  radius: number,
  filters: SearchFilters = {}
): Promise<Application[]> => {
  // Calculate bounding box
  const kmPerDegree = 111.32; // Approximate km per degree at the equator
  const latDiff = radius / kmPerDegree;
  
  // Longitude degrees per km varies with latitude
  const lngDiff = radius / (kmPerDegree * Math.cos(lat * Math.PI / 180));
  
  const minLat = lat - latDiff;
  const maxLat = lat + latDiff;
  const minLng = lng - lngDiff;
  const maxLng = lng + lngDiff;
  
  // Build query
  let query = supabase
    .from('crystal_roof')
    .select('*')
    .gte('latitude', minLat)
    .lte('latitude', maxLat)
    .gte('longitude', minLng)
    .lte('longitude', maxLng)
    .limit(500); // Limit to 500 results for performance
  
  // Add filters if provided
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  
  if (filters.type && filters.type !== 'all') {
    query = query.eq('application_type', filters.type);
  }
  
  if (filters.classification && filters.classification !== 'all') {
    query = query.eq('class_3', filters.classification);
  }
  
  // Set a request timeout using AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
  
  try {
    // Track query performance
    const startTime = Date.now();
    
    // Use fetch with AbortController for timeout
    const { data, error } = await query;
    
    // Clear timeout
    clearTimeout(timeoutId);
    
    // Handle errors
    if (error) {
      console.error('Fallback search error:', error);
      throw error;
    }
    
    // Calculate execution time
    const executionTime = Date.now() - startTime;
    console.log(`Fallback search executed in ${executionTime}ms, returned ${data?.length || 0} results`);
    
    // No results
    if (!data || data.length === 0) {
      return [];
    }
    
    // Calculate distances and transform to Application objects
    return data.map((item: any) => {
      // Calculate distance (if coordinates exist)
      const distance = item.latitude && item.longitude
        ? calculateDistance(lat, lng, Number(item.latitude), Number(item.longitude))
        : Number.MAX_SAFE_INTEGER;
      
      const distanceMiles = distance * 0.621371; // Convert to miles
      
      // Return application with distance
      return {
        id: item.id,
        address: item.address || 'Unknown location',
        title: item.description || `Application ${item.reference || item.id}`,
        description: item.description,
        status: item.status || 'Unknown',
        reference: item.reference,
        type: item.application_type,
        submissionDate: item.submitted_date,
        submittedDate: item.submitted_date,
        decisionDue: item.decision_due,
        officer: item.officer,
        consultationEnd: item.consultation_end,
        coordinates: item.latitude && item.longitude ? [Number(item.latitude), Number(item.longitude)] : undefined,
        distance: `${distanceMiles.toFixed(1)} mi`,
        category: item.class_3,
        postcode: item.postcode,
        ward: item.ward,
        // Include any other fields needed
      } as Application;
    })
    .sort((a: Application, b: Application) => {
      // Sort by distance (ascending)
      const distA = parseFloat(a.distance?.replace(' mi', '') || '9999');
      const distB = parseFloat(b.distance?.replace(' mi', '') || '9999');
      return distA - distB;
    });
  } catch (error) {
    // Clear timeout
    clearTimeout(timeoutId);
    
    // Handle abort errors separately
    if (error.name === 'AbortError') {
      throw new Error('Search timed out after 15 seconds. Please try again with more specific criteria.');
    }
    
    throw error;
  }
}
