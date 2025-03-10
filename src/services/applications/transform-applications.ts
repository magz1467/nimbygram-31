
import { Application } from "@/types/planning";
import { calculateDistance } from "@/utils/distance";
import { transformApplicationData } from "@/utils/applicationTransforms";

/**
 * Transforms raw application data into Application objects
 * @param properties - Raw application data from the database
 * @param coordinates - Search coordinates [lat, lng]
 * @returns Transformed and sorted Application objects
 */
export const transformAndSortApplications = (
  properties: any[] | null,
  coordinates: [number, number]
): Application[] => {
  if (!properties || properties.length === 0) {
    return [];
  }

  // Transform the application data using our shared transformer
  const transformedData = properties.map((item: any) => 
    transformApplicationData(item, coordinates)
  ).filter((app): app is Application => app !== null);
  
  console.log(`✅ Total transformed applications: ${transformedData.length}`);
  
  // Sort by distance - ensure all applications have proper distance calculations
  return transformedData
    .map(app => {
      // Ensure each application has coordinates
      if (!app.coordinates) {
        console.log(`⚠️ Application ${app.id} is missing coordinates`);
        return app;
      }
      
      // Calculate and add distance property directly
      const distanceKm = calculateDistance(coordinates, app.coordinates);
      const distanceMiles = distanceKm * 0.621371;
      
      return {
        ...app,
        distance: `${distanceMiles.toFixed(1)} mi`,
        distanceValue: distanceKm // Add numeric value for sorting
      };
    })
    .sort((a, b) => {
      // Use the numeric distance value for sorting
      const distanceA = a.distanceValue !== undefined ? a.distanceValue : Number.MAX_VALUE;
      const distanceB = b.distanceValue !== undefined ? b.distanceValue : Number.MAX_VALUE;
      
      return distanceA - distanceB;
    });
};
