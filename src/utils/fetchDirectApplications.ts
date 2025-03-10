
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { withTimeout } from "./promiseUtils";
import { transformApplicationData } from "./applicationTransforms";
import { calculateDistance } from "./distance";

/**
 * Fetches applications directly from the database
 * @param coordinates Search coordinates [lat, lng]
 * @returns Transformed applications or throws an error
 */
export const fetchDirectApplications = async (
  coordinates: [number, number]
): Promise<Application[]> => {
  console.log('📊 Fetching applications directly from database');
  
  // Create a proper Promise wrapper for the Supabase query
  const queryPromise = new Promise<any[]>((resolve, reject) => {
    supabase
      .from('crystal_roof')
      .select('*')
      .then(result => {
        if (result.error) {
          console.error('Supabase query error:', result.error);
          reject(result.error);
        } else {
          console.log(`Raw query returned ${result.data?.length || 0} results`);
          resolve(result.data || []);
        }
      })
      .catch(error => {
        console.error('Unexpected query error:', error);
        reject(error);
      });
  });
  
  // Apply timeout to the query
  const data = await withTimeout(
    queryPromise,
    40000, // 40 second timeout
    "Database query timed out. This area may have too many results."
  );
  
  console.log(`✅ Raw data from supabase: ${data?.length || 0} results`);

  if (!data || data.length === 0) {
    console.log('No applications found in the database');
    return [];
  }

  // Log storybook values for debugging
  console.log('Storybook values in raw data:', data.slice(0, 10).map(app => ({
    id: app.id,
    storybook: app.storybook
  })));

  // Transform all application data
  const transformedApplications = data
    .map(app => transformApplicationData(app, coordinates))
    .filter((app): app is Application => app !== null);
  
  console.log(`✅ Total transformed applications: ${transformedApplications.length}`);
  
  // Debug raw data sample
  if (data.length > 0) {
    console.log('Sample raw application data:', data.slice(0, 1));
    console.log('Sample transformed application:', transformedApplications.slice(0, 1));
    console.log('Storybook field sample:', data.slice(0, 5).map(app => app.storybook));
  }
  
  // Return all applications sorted by distance
  return sortApplicationsByDistance(transformedApplications, coordinates);
};

/**
 * Sorts applications by distance from the search coordinates
 */
const sortApplicationsByDistance = (applications: Application[], coordinates: [number, number]): Application[] => {
  return applications.sort((a, b) => {
    if (!a.coordinates || !b.coordinates) return 0;
    const distanceA = calculateDistance(coordinates, a.coordinates);
    const distanceB = calculateDistance(coordinates, b.coordinates);
    return distanceA - distanceB;
  });
};
