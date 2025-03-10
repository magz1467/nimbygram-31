
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
    console.log('No properties to transform');
    return [];
  }

  console.log(`Starting to transform ${properties.length} properties`);
  
  // Log a sample property to see what data we're working with
  if (properties.length > 0) {
    console.log('Sample property data:', properties[0]);
  }

  // Transform the application data using our shared transformer
  const transformedData = properties.map((item: any) => 
    transformApplicationData(item, coordinates)
  ).filter((app): app is Application => app !== null);
  
  console.log(`✅ Total transformed applications: ${transformedData.length}`);
  
  // Debug why applications might be getting filtered out
  if (transformedData.length === 0 && properties.length > 0) {
    console.warn('⚠️ All applications were filtered out during transformation');
    // Check if any properties have a storybook field
    const hasStorybook = properties.some(prop => prop.storybook);
    console.log(`Do any properties have storybook field? ${hasStorybook ? 'Yes' : 'No'}`);
  }
  
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
