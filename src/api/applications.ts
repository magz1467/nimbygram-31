
import { Application } from '@/types/planning';
import { supabase } from '@/integrations/supabase/client';
import { calculateDistance } from '@/utils/distance';

export async function fetchApplicationById(id: number): Promise<Application | null> {
  try {
    const { data, error } = await supabase
      .from('crystal_roof')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!data) return null;
    
    return transformApplication(data);
  } catch (error) {
    console.error('Error fetching application:', error);
    return null;
  }
}

export async function fetchApplicationsByPostcode(postcode: string, radius = 5): Promise<Application[]> {
  try {
    // First get coordinates from postcode
    const coordinates = await fetchCoordinatesFromPostcode(postcode);
    if (!coordinates) {
      throw new Error('Invalid postcode');
    }
    
    return fetchApplicationsByCoordinates(coordinates, radius);
  } catch (error) {
    console.error('Error fetching applications by postcode:', error);
    return [];
  }
}

export async function fetchApplicationsByCoordinates(
  coordinates: [number, number], 
  radiusKm = 5
): Promise<Application[]> {
  try {
    const [lat, lng] = coordinates;
    
    // Calculate bounding box for the search area
    const kmPerDegree = 111.32;
    const latDiff = radiusKm / kmPerDegree;
    const lngDiff = radiusKm / (kmPerDegree * Math.cos(lat * Math.PI / 180));
    
    // Query with geographic bounds
    const { data, error } = await supabase
      .from('crystal_roof')
      .select('*')
      .gte('latitude', lat - latDiff)
      .lte('latitude', lat + latDiff)
      .gte('longitude', lng - lngDiff)
      .lte('longitude', lng + lngDiff)
      .limit(100);
      
    if (error) throw error;
    
    // Transform and sort by distance
    const applications = (data || []).map(item => {
      const app = transformApplication(item);
      
      // Calculate distance if coordinates exist
      if (app.coordinates) {
        const distanceKm = calculateDistance(
          lat, lng, 
          app.coordinates[0], app.coordinates[1]
        );
        app.distance = `${(distanceKm * 0.621371).toFixed(1)} mi`; // Convert km to miles
      }
      
      return app;
    });
    
    // Sort by distance
    return applications.sort((a, b) => {
      const distA = a.distance ? parseFloat(a.distance) : Infinity;
      const distB = b.distance ? parseFloat(b.distance) : Infinity;
      return distA - distB;
    });
  } catch (error) {
    console.error('Error fetching applications by coordinates:', error);
    return [];
  }
}

// Helper function to transform raw data to Application type
function transformApplication(item: any): Application {
  return {
    id: item.id,
    title: item.ai_title || item.description || `Application ${item.id}`,
    address: item.address || '',
    location: item.address || '',
    status: item.status || 'Under Review',
    coordinates: item.latitude && item.longitude ? [Number(item.latitude), Number(item.longitude)] : undefined,
    description: item.description || '',
    reference: item.reference || '',
    type: item.type || item.application_type || '',
    application_type_full: item.application_type_full,
    ward: item.ward || '',
    postcode: item.postcode || '',
    received_date: item.received_date || null,
    image_map_url: item.image_map_url || null,
    streetview_url: item.streetview_url || null,
    image: item.image || null,
    storybook: item.storybook || null,
    impact_score: item.impact_score || null,
    impact_score_details: item.impact_score_details || null,
    final_impact_score: item.final_impact_score || null,
    feedback_stats: item.feedback_stats || null
  };
}

// Helper function to get coordinates from postcode
async function fetchCoordinatesFromPostcode(postcode: string): Promise<[number, number] | null> {
  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
    const data = await response.json();
    
    if (!data.result) {
      return null;
    }
    
    return [data.result.latitude, data.result.longitude];
  } catch (error) {
    console.error('Error fetching coordinates from postcode:', error);
    return null;
  }
}
