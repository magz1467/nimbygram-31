
import { Application } from "@/types/planning";
import { calculateDistance } from "./distance";

/**
 * Re-export the distance calculation function as a different name
 * to avoid naming conflicts
 */
export const calculateDistanceBetween = (
  point1: [number, number], 
  point2: [number, number]
): number => {
  return calculateDistance(point1, point2);
};

/**
 * Sort applications by distance from search coordinates
 * This is just aliasing the functionality for backward compatibility
 */
export const sortApplicationsByDistance = (
  applications: Application[],
  coordinates: [number, number]
): Application[] => {
  if (!applications || !coordinates) {
    return [...applications];
  }
  
  // First add distance information to each application
  const appsWithDistance = applications.map(app => {
    const appCopy = { ...app };
    
    if (app.coordinates) {
      try {
        // Use our canonical distance calculation function
        const distance = calculateDistance(coordinates, app.coordinates);
        
        // Store raw distance value for sorting (in kilometers)
        (appCopy as any).distanceValue = distance;
        
        // Format for display (in miles)
        const distanceInMiles = distance * 0.621371;
        appCopy.distance = `${distanceInMiles.toFixed(1)} mi`;
      } catch (error) {
        console.warn(`Error calculating distance for app ${app.id}:`, error);
        (appCopy as any).distanceValue = Number.MAX_SAFE_INTEGER;
      }
    } else {
      console.warn(`Application ${app.id} has no coordinates, setting max distance`);
      (appCopy as any).distanceValue = Number.MAX_SAFE_INTEGER;
    }
    
    return appCopy;
  });
  
  // Then sort by the calculated distance value
  const sortedApps = [...appsWithDistance].sort((a, b) => {
    const distanceA = (a as any).distanceValue ?? Number.MAX_SAFE_INTEGER;
    const distanceB = (b as any).distanceValue ?? Number.MAX_SAFE_INTEGER;
    
    // Ensure we're comparing numbers
    const numA = typeof distanceA === 'number' && !isNaN(distanceA) ? distanceA : Number.MAX_SAFE_INTEGER;
    const numB = typeof distanceB === 'number' && !isNaN(distanceB) ? distanceB : Number.MAX_SAFE_INTEGER;
    
    return numA - numB;
  });
  
  return sortedApps;
};
