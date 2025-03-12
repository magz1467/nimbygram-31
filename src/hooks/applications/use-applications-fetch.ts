
import { supabase } from '@/integrations/supabase/client';

export async function fetchApplicationsInArea(
  latitude: number, 
  longitude: number, 
  radius: number = 1,
  filters: Record<string, string> = {}
): Promise<any[]> {
  try {
    const filtersObj = { ...filters };
    
    let query = supabase
      .from('crystal_roof')
      .select('*')
      .order('application_id', { ascending: false })
      .limit(200);
    
    // Apply basic filters if provided
    for (const key in filtersObj) {
      if (Object.prototype.hasOwnProperty.call(filtersObj, key) && filtersObj[key]) {
        query = query.eq(key, filtersObj[key]);
      }
    }
    
    // For spatial queries, we need to use a more complex approach
    // But for now, let's just do a basic distance filter
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
    
    if (!data || !Array.isArray(data)) {
      console.error('Invalid response format:', data);
      return [];
    }
    
    // Filter by distance manually
    const distanceFiltered = data.filter(app => {
      if (!app.centroid) return false;
      
      try {
        // Simple distance calculation
        const coords = typeof app.centroid === 'string' 
          ? JSON.parse(app.centroid) 
          : app.centroid;
          
        if (!coords || !coords.coordinates) return false;
        
        const [appLng, appLat] = coords.coordinates;
        const distance = calculateDistance(latitude, longitude, appLat, appLng);
        
        return distance <= radius;
      } catch (e) {
        console.error('Error parsing coordinates:', e);
        return false;
      }
    });
    
    return distanceFiltered;
  } catch (error) {
    console.error('Error fetching applications by area:', error);
    throw error;
  }
}

// Simple distance calculation function (haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}
