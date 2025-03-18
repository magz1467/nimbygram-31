
import { Application } from '@/types/planning';
import { supabase } from '@/integrations/supabase/client';

export interface SearchParams {
  query: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export async function searchApplications(params: SearchParams): Promise<{
  applications: Application[];
  count: number;
}> {
  try {
    // Default values
    const limit = params.limit || 20;
    const page = params.page || 0;
    const radius = params.radius || 5; // in kilometers
    
    // If we have coordinates, do a spatial search
    if (params.latitude && params.longitude) {
      // Calculate bounding box (simple approach)
      const kmPerDegree = 111.32;
      const latDiff = radius / kmPerDegree;
      const lngDiff = radius / (kmPerDegree * Math.cos(params.latitude * Math.PI / 180));
      
      // Query with geographic bounds
      const { data, error, count } = await supabase
        .from('crystal_roof')
        .select('*', { count: 'exact' })
        .gte('latitude', params.latitude - latDiff)
        .lte('latitude', params.latitude + latDiff)
        .gte('longitude', params.longitude - lngDiff)
        .lte('longitude', params.longitude + lngDiff)
        .range(page * limit, (page + 1) * limit - 1);
        
      if (error) throw error;
      
      // Transform to Application type
      const applications = (data || []).map(item => transformSearchResult(item, params.latitude, params.longitude));
      
      return {
        applications,
        count: count || 0,
      };
    } else {
      // Text-based search
      const { data, error, count } = await supabase
        .from('crystal_roof')
        .select('*', { count: 'exact' })
        .or(`description.ilike.%${params.query}%,address.ilike.%${params.query}%,postcode.ilike.%${params.query}%`)
        .range(page * limit, (page + 1) * limit - 1);
      
      if (error) throw error;
      
      // Transform to Application type
      const applications = (data || []).map(item => transformSearchResult(item));
      
      return {
        applications,
        count: count || 0,
      };
    }
  } catch (error) {
    console.error('Error in searchApplications:', error);
    return {
      applications: [],
      count: 0,
    };
  }
}

// Helper to transform raw data to Application type
function transformSearchResult(item: any, lat?: number, lng?: number): Application {
  // Calculate distance if coordinates are provided
  let distance: string | undefined;
  if (lat && lng && item.latitude && item.longitude) {
    const distanceInKm = calculateDistance(lat, lng, item.latitude, item.longitude);
    distance = `${(distanceInKm * 0.621371).toFixed(1)} mi`; // Convert km to miles
  }
  
  return {
    id: item.id,
    title: item.ai_title || item.description || `Application ${item.id}`,
    address: item.address || '',
    status: item.status || 'Under Review',
    coordinates: item.latitude && item.longitude ? [Number(item.latitude), Number(item.longitude)] : undefined,
    distance,
    description: item.description || '',
    reference: item.reference || '',
    application_type_full: item.application_type_full,
    type: item.type || item.application_type || '',
    postcode: item.postcode,
    received_date: item.received_date,
    image_map_url: item.image_map_url,
    storybook: item.storybook,
    location: item.address // Ensure required field is set
  };
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
