
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { sortApplicationsByDistance } from "@/utils/distance";
import { calculateDistance } from "../utils/distance-calculator";

/**
 * Performs a fallback search for applications when the spatial search is not available
 * @param lat Latitude of search point
 * @param lng Longitude of search point
 * @param radiusKm Radius to search in kilometers
 * @param filters Optional filters to apply
 * @returns Array of applications
 */
export async function performFallbackSearch(
  lat: number,
  lng: number,
  radiusKm: number,
  filters: any = {}
): Promise<Application[]> {
  console.log(`🔍 Performing fallback search at [${lat}, ${lng}] with radius ${radiusKm}km`);
  
  try {
    // Calculate bounding box for more efficient querying
    const kmToDeg = 0.01; // Rough approximation: 0.01 degree is about 1.1km at equator
    const latRange = radiusKm * kmToDeg;
    const lngRange = radiusKm * kmToDeg;
    
    const latMin = lat - latRange;
    const latMax = lat + latRange;
    const lngMin = lng - lngRange;
    const lngMax = lng + lngRange;
    
    console.log(`Searching in bounding box: [${latMin},${lngMin}] to [${latMax},${lngMax}]`);
    
    let query = supabase
      .from('crystal_roof')
      .select('*')
      .gte('latitude', latMin)
      .lte('latitude', latMax)
      .gte('longitude', lngMin)
      .lte('longitude', lngMax)
      .limit(300); // Set a reasonable limit
    
    // Apply any filters
    if (filters.status) {
      query = query.ilike('status', `%${filters.status}%`);
    }
    
    if (filters.type) {
      query = query.or(`type.ilike.%${filters.type}%,application_type_full.ilike.%${filters.type}%`);
    }
    
    if (filters.classification) {
      query = query.ilike('class_3', `%${filters.classification}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Fallback search error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No results found in bounding box, trying increased radius');
      // If no results, try with a larger radius
      return performFallbackSearchLargerRadius(lat, lng, radiusKm * 3, filters);
    }
    
    console.log(`Found ${data.length} results in bounding box`);
    
    // Convert database records to Application objects
    const applications = data.map(item => {
      // Calculate distance from search point
      const distanceInKm = calculateDistance(
        lat,
        lng,
        Number(item.latitude),
        Number(item.longitude)
      );
      
      // Convert to formatted string for display
      const distanceFormatted = typeof distanceInKm === 'number' 
        ? `${(distanceInKm * 0.621371).toFixed(1)} mi` 
        : 'Unknown';
      
      return {
        id: item.id,
        reference: item.reference || item.lpa_app_no,
        title: item.description || `Application ${item.id}`,
        description: item.description || '',
        status: item.status || 'Unknown',
        address: item.address || '',
        postcode: item.postcode || '',
        coordinates: [Number(item.latitude), Number(item.longitude)] as [number, number],
        distance: distanceFormatted, // Use string format for distance as expected by the interface
        application_type: item.application_type || '',
        application_type_full: item.type || '',
        decision: item.decision || '',
        appeal_status: item.appeal_status || '',
        lpa_code: item.lpa_code || '',
        documents_url: item.documents_url || '',
        comment_url: item.comment_url || '',
        published_date: item.date_published || null,
        received_date: item.valid_date || item.date_received || null,
        decision_date: item.decision_date || null,
        class_3: item.class_3 || '',
        consultationEnd: item.consultation_end || null,
        type: item.type || '',
        image: item.image || null,
        image_map_url: item.image_map_url || null,
        streetview_url: item.streetview_url || null,
      } as Application;
    });
    
    // Log the first few sorted applications for debugging
    console.log('\nSorted applications (first 10):');
    applications
      .sort((a, b) => {
        // Parse distance from strings like "1.2 mi" to get numeric values for sorting
        const getDistanceValue = (distStr: string | undefined): number => {
          if (!distStr) return Infinity;
          const match = distStr.match(/^(\d+(\.\d+)?)/);
          return match ? parseFloat(match[1]) : Infinity;
        };
        
        return getDistanceValue(a.distance) - getDistanceValue(b.distance);
      })
      .slice(0, 10)
      .forEach((app, i) => {
        console.log(`${i+1}. ID: ${app.id}, Distance: ${app.distance} (${app.type}), Address: ${app.address}, Coordinates: ${app.coordinates}`);
      });
    
    // Return applications sorted by distance
    return applications.sort((a, b) => {
      // Parse distance from strings like "1.2 mi" to get numeric values for sorting
      const getDistanceValue = (distStr: string | undefined): number => {
        if (!distStr) return Infinity;
        const match = distStr.match(/^(\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : Infinity;
      };
      
      return getDistanceValue(a.distance) - getDistanceValue(b.distance);
    });
    
  } catch (error) {
    console.error('Error in fallback search:', error);
    throw error;
  }
}

/**
 * Try searching with a larger radius as a last resort
 */
async function performFallbackSearchLargerRadius(
  lat: number,
  lng: number,
  radiusKm: number,
  filters: any = {}
): Promise<Application[]> {
  console.log(`🔄 Trying larger radius search: ${radiusKm}km`);
  
  try {
    // For larger radius, just get the most recent applications
    const { data, error } = await supabase
      .from('crystal_roof')
      .select('*')
      .order('id', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error('Larger radius search error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No results found even with larger radius');
      return [];
    }
    
    console.log(`Found ${data.length} applications as fallback with larger radius`);
    
    // Convert and sort by distance
    const applications = data.map(item => {
      // Calculate distance from search point
      const distanceInKm = calculateDistance(
        lat,
        lng,
        Number(item.latitude),
        Number(item.longitude)
      );
      
      // Convert to formatted string for display
      const distanceFormatted = typeof distanceInKm === 'number' 
        ? `${(distanceInKm * 0.621371).toFixed(1)} mi` 
        : 'Unknown';
      
      return {
        id: item.id,
        reference: item.reference || item.lpa_app_no,
        title: item.description || `Application ${item.id}`,
        description: item.description || '',
        status: item.status || 'Unknown',
        address: item.address || '',
        postcode: item.postcode || '',
        coordinates: [Number(item.latitude), Number(item.longitude)] as [number, number],
        distance: distanceFormatted, // Use string format for distance as expected
        application_type: item.application_type || '',
        application_type_full: item.type || '',
        decision: item.decision || '',
        appeal_status: item.appeal_status || '',
        lpa_code: item.lpa_code || '',
        documents_url: item.documents_url || '',
        comment_url: item.comment_url || '',
        published_date: item.date_published || null,
        received_date: item.valid_date || item.date_received || null,
        decision_date: item.decision_date || null,
        class_3: item.class_3 || '',
        consultationEnd: item.consultation_end || null,
        type: item.type || '',
        image: item.image || null,
        image_map_url: item.image_map_url || null,
        streetview_url: item.streetview_url || null,
      } as Application;
    });
    
    console.log('Search complete');
    
    // Return applications sorted by distance
    return applications.sort((a, b) => {
      // Parse distance from strings like "1.2 mi" to get numeric values for sorting
      const getDistanceValue = (distStr: string | undefined): number => {
        if (!distStr) return Infinity;
        const match = distStr.match(/^(\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : Infinity;
      };
      
      return getDistanceValue(a.distance) - getDistanceValue(b.distance);
    });
    
  } catch (error) {
    console.error('Error in larger radius fallback search:', error);
    throw error;
  }
}
