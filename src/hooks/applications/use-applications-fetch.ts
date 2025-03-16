
import { Application } from '@/types/planning';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errors/centralized-handler';
import { transformApplicationData } from '@/utils/transforms/application-transformer';

/**
 * Fetches planning applications within a specified radius of coordinates
 */
export const fetchApplicationsInRadius = async (
  coordinates: [number, number], 
  radius: number = 5
): Promise<Application[]> => {
  try {
    const [lat, lng] = coordinates;
    
    console.log(`🔍 Fetching applications near [${lat}, ${lng}] with radius ${radius}km`);
    
    // Calculate bounding box (simple approximation)
    const kmPerDegree = 111.32;
    const latDiff = radius / kmPerDegree;
    const lngDiff = radius / (kmPerDegree * Math.cos(lat * Math.PI / 180));
    
    // Query with geographic bounds - explicitly selecting storybook field
    const { data, error } = await supabase
      .from('crystal_roof')
      .select('*')  // Using * to select all fields including storybook
      .gte('latitude', lat - latDiff)
      .lte('latitude', lat + latDiff)
      .gte('longitude', lng - lngDiff)
      .lte('longitude', lng + lngDiff)
      .limit(500);
      
    if (error) throw error;

    console.log(`Found ${data?.length || 0} applications`);
    if (data && data.length > 0) {
      console.log('First application data:', {
        id: data[0].id,
        hasStorybook: Boolean(data[0].storybook),
        storybookLength: data[0].storybook ? data[0].storybook.length : 0
      });
      if (data[0].storybook) {
        console.log(`Storybook preview: ${data[0].storybook.substring(0, 100)}...`);
      }
    }

    // Transform to Application type using our transformer
    const transformedData = data ? data.map(item => transformApplicationData(item)) : [];
    
    // Verify storybook content was preserved after transformation
    if (transformedData.length > 0 && data && data[0].storybook) {
      const firstTransformed = transformedData[0];
      console.log('Verifying storybook content preservation:', {
        beforeTransform: Boolean(data[0].storybook),
        afterTransform: Boolean(firstTransformed.storybook)
      });
    }
    
    return transformedData;
  } catch (err) {
    console.error('Error fetching applications in radius:', err);
    handleError(err, { context: 'fetchApplicationsInRadius' });
    return []; // Return empty array on error
  }
};
