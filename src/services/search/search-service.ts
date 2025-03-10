
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { SearchCoordinates, SearchType } from "./types/search-types";
import { handleSearchError, withTimeout } from "./utils/error-handler";
import { transformAndSortResults } from "./utils/result-transformer";

export const searchApplications = async (
  coordinates: SearchCoordinates,
  searchTerm?: string
): Promise<Application[]> => {
  console.log('🔍 searchApplications called with:', { coordinates, searchTerm });
  
  if (!coordinates && !searchTerm) {
    console.log('❌ No search parameters provided to searchApplications');
    return [];
  }
  
  // Log search details to help with debugging
  if (searchTerm) {
    console.log(`🔍 Performing search with text: "${searchTerm}"`);
  }
  if (coordinates) {
    console.log(`🔍 Performing search with coordinates: [${coordinates[0]}, ${coordinates[1]}]`);
  }
  
  try {
    const results = await performSearch(coordinates, searchTerm);
    console.log(`✅ Search returned ${results.length} applications`);
    
    if (!coordinates && searchTerm && results.length > 0) {
      console.log('📊 Top 3 text search results:');
      results.slice(0, 3).forEach((app, i) => {
        console.log(`  [${i+1}] ID: ${app.id}, Address: ${app.address || 'No address'}, Ward: ${app.ward || 'No ward'}`);
      });
    }
    
    return transformAndSortResults(results, coordinates, searchTerm);
  } catch (error) {
    handleSearchError(error);
    throw error;
  }
};

const performSearch = async (
  coordinates: SearchCoordinates,
  searchTerm?: string
): Promise<Application[]> => {
  if (coordinates) {
    const [lat, lng] = coordinates;
    const { data, error } = await withTimeout(
      supabase.rpc('get_applications_within_radius', {
        center_lat: lat,
        center_lng: lng,
        radius_meters: 10000,
        page_size: 100,
        page_number: 0
      }),
      30000,
      "Search operation timed out"
    );

    if (error) throw error;
    return data || [];
  }

  if (searchTerm) {
    const searchConditions = [
      `address.ilike.%${searchTerm}%`,
      `description.ilike.%${searchTerm}%`,
      `ward_name.ilike.%${searchTerm}%`,
      `local_authority_district_name.ilike.%${searchTerm}%`
    ].join(',');

    const { data, error } = await withTimeout(
      supabase
        .from('crystal_roof')
        .select('*')
        .or(searchConditions)
        .limit(100),
      30000,
      "Search operation timed out"
    );

    if (error) throw error;
    return data || [];
  }

  return [];
};
