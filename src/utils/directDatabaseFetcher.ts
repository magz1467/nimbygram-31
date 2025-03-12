import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationData } from "./transforms/application-transformer";
import { calculateDistance, sortApplicationsByDistance } from "./distance";
import { toast } from "@/hooks/use-toast";

/**
 * Fetches applications directly from the database with pagination to prevent timeouts
 */
export const fetchApplicationsFromDatabase = async (
  coordinates: [number, number],
  maxDistanceKm: number = 20 // Add a max distance parameter (20km default)
): Promise<Application[]> => {
  console.log('📊 Fetching applications directly from database with pagination');
  console.log('🌍 Search coordinates for distance calculation:', coordinates);
  console.log('🔍 Using max search radius of', maxDistanceKm, 'km');
  
  const pageSize = 250; // Smaller batch size for better performance
  const allApplications: Application[] = [];
  let hasMore = true;
  let page = 0;
  let lastId: number | null = null;
  
  try {
    while (hasMore && page < 20) { // Limit to 20 pages maximum
      console.log(`Fetching page ${page} with ${pageSize} records, starting after ID ${lastId || 'start'}`);
      
      // Build the query with cursor-based pagination
      let query = supabase
        .from('crystal_roof')
        .select('*')
        .order('id', { ascending: true });
        
      // Add cursor condition if we have a last ID
      if (lastId) {
        query = query.gt('id', lastId);
      }
      
      // Limit the number of records
      query = query.limit(pageSize);
      
      const result = await query;
      
      if (result.error) {
        console.error('❌ Supabase query error on page', page, result.error);
        break;
      }
      
      const records = result.data || [];
      console.log(`✅ Retrieved ${records.length} records for page ${page}`);
      
      // Update the last ID for the next query
      if (records.length > 0) {
        lastId = records[records.length - 1].id;
      }
      
      // If we got fewer records than requested, we've reached the end
      if (records.length < pageSize) {
        hasMore = false;
      }
      
      // Transform the applications with coordinates
      const transformedApps = records
        .filter(app => app != null)
        .map(app => transformApplicationData(app, coordinates))
        .filter((app): app is Application => app !== null);
      
      // Filter by maximum distance (important to avoid returning distant results)
      const nearbyApps = transformedApps.filter(app => {
        if (!app.coordinates) return false;
        const distKm = calculateDistance(coordinates, app.coordinates);
        // Store the raw distance value as a formatted string
        app.distance = `${distKm.toFixed(1)} km`;
        // Only keep applications within the max distance
        return distKm <= maxDistanceKm;
      });
      
      // Log distance information for debugging
      if (transformedApps.length > 0) {
        console.log(`Found ${transformedApps.length} applications with coordinates, ${nearbyApps.length} within ${maxDistanceKm}km`);
        
        // Log a few examples of distances
        const samples = Math.min(5, transformedApps.length);
        console.log(`Distance samples of ${samples} applications:`);
        transformedApps.slice(0, samples).forEach(app => {
          if (app.coordinates) {
            const dist = calculateDistance(coordinates, app.coordinates);
            console.log(`ID: ${app.id}, Distance: ${dist.toFixed(2)}km, Address: ${app.address}`);
          }
        });
      }
      
      // Add to our results array - only include nearby applications
      allApplications.push(...nearbyApps);
      
      // Increment page counter
      page++;
      
      // If we have enough nearby results already, break the loop
      if (allApplications.length >= 100) {
        console.log(`Have ${allApplications.length} nearby applications, breaking pagination loop early`);
        break;
      }
    }
    
    // Sort all applications by distance
    const sortedApplications = sortApplicationsByDistance(allApplications, coordinates);
    
    console.log(`✅ Total transformed and sorted applications within ${maxDistanceKm}km: ${sortedApplications.length}`);
    
    // Log sorted results for debugging
    if (sortedApplications.length > 0) {
      console.log(`Top 10 closest applications to [${coordinates[0]}, ${coordinates[1]}]:`);
      sortedApplications.slice(0, 10).forEach((app, idx) => {
        if (app.coordinates) {
          const dist = calculateDistance(coordinates, app.coordinates);
          console.log(`${idx+1}. ID: ${app.id}, Distance: ${dist.toFixed(2)}km, Address: ${app.address}`);
        }
      });
    }
    
    return sortedApplications;
    
  } catch (error) {
    console.error('❌ Error fetching applications with pagination:', error);
    
    // If we have some results already, return them instead of showing an error
    if (allApplications.length > 0) {
      console.log(`Returning ${allApplications.length} applications retrieved before the error`);
      return sortApplicationsByDistance(allApplications, coordinates);
    }
    
    toast({
      title: "Search Error",
      description: error instanceof Error ? error.message : "We're having trouble loading all results. Please try again.",
      variant: "destructive",
    });
    return [];
  }
};
