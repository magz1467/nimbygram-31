
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationData } from "./transforms/application-transformer";
import { calculateDistance, sortApplicationsByDistance } from "./distance";
import { toast } from "@/hooks/use-toast";

/**
 * Fetches ALL applications directly from the database without geographic filtering
 */
export const fetchApplicationsFromDatabase = async (
  coordinates: [number, number]
): Promise<Application[]> => {
  console.log('📊 Fetching ALL applications directly from database without geographic filtering');
  console.log('🌍 Search coordinates for distance calculation:', coordinates);
  
  try {
    console.log('Executing unrestricted query to get ALL records');
    
    // Execute the Supabase query without any filtering to get ALL records
    const result = await supabase
      .from('crystal_roof')
      .select('*');
    
    if (result.error) {
      console.error('❌ Supabase query error:', result.error);
      throw result.error;
    }
    
    const allRecords = result.data || [];
    console.log(`✅ Retrieved ${allRecords.length} total records from database`);

    if (allRecords.length === 0) {
      console.log('No applications found in the database');
      return [];
    }

    // Transform ALL application data with coordinates
    console.log('Transforming ALL application data with coordinates:', coordinates);
    const transformedApplications = allRecords
      .map(app => transformApplicationData(app, coordinates))
      .filter((app): app is Application => app !== null);
    
    console.log(`✅ Total transformed applications: ${transformedApplications.length}`);
    
    // Sort ALL applications by distance - this is critical for accurate results
    const sortedApplications = sortApplicationsByDistance(transformedApplications, coordinates);
    
    // Log sorted results for debugging
    console.log(`Top 10 closest applications to [${coordinates[0]}, ${coordinates[1]}]:`);
    sortedApplications.slice(0, 10).forEach((app, idx) => {
      if (app.coordinates) {
        const dist = calculateDistance(coordinates, app.coordinates);
        console.log(`${idx+1}. ID: ${app.id}, Location: [${app.coordinates[0]}, ${app.coordinates[1]}], Distance: ${dist.toFixed(2)}km, Address: ${app.address}`);
      }
    });
    
    return sortedApplications;
  } catch (error) {
    console.error('❌ Error fetching ALL applications:', error);
    toast({
      title: "Search Error",
      description: error instanceof Error ? error.message : "We're having trouble loading all results. Please try again.",
      variant: "destructive",
    });
    return [];
  }
};
