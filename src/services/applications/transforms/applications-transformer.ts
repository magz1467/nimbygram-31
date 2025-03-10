
import { Application } from "@/types/planning";
import { transformApplicationData } from "@/utils/transforms/application-transformer";
import { calculateDistance } from "@/utils/distance";

/**
 * Transform raw application data and sort by distance
 */
export const transformAndSortApplications = (
  applications: any[],
  coordinates: [number, number]
): Application[] => {
  if (!applications || !Array.isArray(applications) || applications.length === 0) {
    return [];
  }
  
  // Transform the applications
  const transformedApplications = applications
    .map(app => transformApplicationData(app, coordinates))
    .filter((app): app is Application => app !== null);
  
  // Add distance to each application
  const appsWithDistance = transformedApplications.map(app => {
    const appCopy = { ...app };
    
    if (app.coordinates) {
      try {
        // Calculate distance
        const distance = calculateDistance(coordinates, app.coordinates);
        
        // Store both raw value and formatted string for display
        const distanceInMiles = distance * 0.621371; // Convert km to miles
        appCopy.distance = `${distanceInMiles.toFixed(1)} mi`;
        (appCopy as any).distanceValue = distance;
      } catch (error) {
        console.warn(`Error calculating distance for app ${app.id}:`, error);
        (appCopy as any).distanceValue = Number.MAX_SAFE_INTEGER;
      }
    } else {
      (appCopy as any).distanceValue = Number.MAX_SAFE_INTEGER;
    }
    
    return appCopy;
  });
  
  // Sort by the calculated distance value
  return [...appsWithDistance].sort((a, b) => {
    const distanceA = (a as any).distanceValue ?? Number.MAX_SAFE_INTEGER;
    const distanceB = (b as any).distanceValue ?? Number.MAX_SAFE_INTEGER;
    return distanceA - distanceB;
  });
};
