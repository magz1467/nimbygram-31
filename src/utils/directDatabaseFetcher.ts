
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationData } from "./transforms/application-transformer";
import { calculateDistance, sortApplicationsByDistance } from "./distance";
import { toast } from "@/hooks/use-toast";

export const fetchApplicationsFromDatabase = async (
  coordinates: [number, number],
  page: number = 0,
  pageSize: number = 25
): Promise<Application[]> => {
  console.log(`📊 Fetching page ${page} with ${pageSize} applications from database`);
  console.log('🌍 Search coordinates for distance calculation:', coordinates);
  
  try {
    // Build the query with pagination
    let query = supabase
      .from('crystal_roof')
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order('id', { ascending: true });
    
    const result = await query;
    
    if (result.error) {
      console.error('❌ Supabase query error:', result.error);
      return [];
    }
    
    const records = result.data || [];
    console.log(`✅ Retrieved ${records.length} records for page ${page}`);
    
    // Transform the applications with coordinates
    const transformedApps = records
      .map(app => transformApplicationData(app, coordinates))
      .filter((app): app is Application => app !== null);
    
    // Sort by distance
    const sortedApplications = sortApplicationsByDistance(transformedApps, coordinates);
    
    // Log sorted results for debugging
    if (sortedApplications.length > 0) {
      console.log(`Top applications for page ${page}:`);
      sortedApplications.slice(0, 5).forEach((app, idx) => {
        if (app.coordinates) {
          const dist = calculateDistance(coordinates, app.coordinates);
          console.log(`${idx+1}. ID: ${app.id}, Distance: ${dist.toFixed(2)}km, Address: ${app.address}`);
        }
      });
    }
    
    return sortedApplications;
    
  } catch (error) {
    console.error('❌ Error fetching applications:', error);
    return [];
  }
};
