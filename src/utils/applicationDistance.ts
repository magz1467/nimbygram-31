
import { Application } from "@/types/planning";
import { calculateDistance } from "@/utils/distance";

/**
 * Adds distance information to applications based on search coordinates
 */
export const addDistanceToApplications = (
  applications: Application[],
  searchCoordinates: [number, number] | null | undefined
): Application[] => {
  if (!searchCoordinates) {
    console.log('No search coordinates provided for distance calculation');
    return applications;
  }
  
  console.log(`Adding distance information to ${applications.length} applications`);
  
  return applications.map(app => {
    if (!app.coordinates) {
      // If application has no coordinates, mark with 'Unknown distance'
      return {
        ...app,
        distance: 'Unknown distance',
        distanceValue: Number.MAX_VALUE // Add a high value for sorting
      };
    }
    
    try {
      // Calculate and format distance
      const distanceInKm = calculateDistance(searchCoordinates, app.coordinates);
      const distanceInMiles = distanceInKm * 0.621371;
      
      // Add formatted distance and raw distance for sorting
      return {
        ...app,
        distance: `${distanceInMiles.toFixed(1)} mi`,
        distanceValue: distanceInMiles // Add raw value for sorting
      };
    } catch (err) {
      console.error('Error calculating distance for application:', app.id, err);
      return {
        ...app,
        distance: 'Unknown distance',
        distanceValue: Number.MAX_VALUE
      };
    }
  });
};

/**
 * Sorts applications by distance from search coordinates
 */
export const sortApplicationsByDistance = (
  applications: Application[],
  searchCoordinates: [number, number] | null | undefined
): Application[] => {
  if (!searchCoordinates) {
    console.log('No search coordinates provided for distance sorting');
    return applications;
  }
  
  console.log(`Sorting ${applications.length} applications by distance`);
  
  // First add distance information if not already present
  const appsWithDistance = applications.every(app => 'distanceValue' in app) 
    ? applications 
    : addDistanceToApplications(applications, searchCoordinates);
  
  // Sort by distance, handling applications without coordinates
  return [...appsWithDistance].sort((a, b) => {
    // First sort by distanceValue if available
    if ('distanceValue' in a && 'distanceValue' in b) {
      return (a.distanceValue as number) - (b.distanceValue as number);
    }
    
    // Handle missing coordinates
    if (!a.coordinates && !b.coordinates) return 0;
    if (!a.coordinates) return 1; // Push items without coordinates to the end
    if (!b.coordinates) return -1;
    
    // Calculate distance if distanceValue not available
    const distanceA = calculateDistance(searchCoordinates, a.coordinates) * 0.621371;
    const distanceB = calculateDistance(searchCoordinates, b.coordinates) * 0.621371;
    
    return distanceA - distanceB;
  });
};
