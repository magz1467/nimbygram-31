
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
  
  // Filter out applications with null storybook values
  const filteredApplications = transformedData.filter(app => 
    app.storybook !== null && app.storybook !== undefined && app.storybook !== ''
  );
  
  console.log(`Filtered out ${transformedData.length - filteredApplications.length} applications with null storybook values`);
  
  // Sort by distance
  return filteredApplications.sort((a, b) => {
    if (!a.coordinates || !b.coordinates) return 0;
    const distanceA = calculateDistance(coordinates, a.coordinates);
    const distanceB = calculateDistance(coordinates, b.coordinates);
    return distanceA - distanceB;
  });
};
