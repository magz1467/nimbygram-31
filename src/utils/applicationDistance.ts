
import { Application } from "@/types/planning";
import { calculateDistance } from "./distance";

/**
 * Sorts applications by distance from the provided coordinates
 * @param applications Applications to sort
 * @param coordinates Center coordinates to measure distance from
 * @returns Sorted array of applications
 */
export const sortApplicationsByDistance = (
  applications: Application[],
  coordinates: [number, number]
): Application[] => {
  if (!applications || applications.length === 0 || !coordinates) {
    return applications || [];
  }
  
  console.log('📏 Sorting applications by distance from:', coordinates);
  
  // First calculate distances and create an array with distance information
  const applicationsWithDistance = applications.map(app => {
    let distance = Number.MAX_SAFE_INTEGER;
    
    // If app already has distanceValue, use it (avoid recalculating)
    if ('distanceValue' in app && typeof app.distanceValue === 'number') {
      return app;
    }
    
    if (app.coordinates) {
      try {
        distance = calculateDistance(coordinates, app.coordinates);
        
        // Update the distance display in the application
        const distanceInMiles = distance * 0.621371;
        
        // Store both the formatted string and raw value
        app.distance = `${distanceInMiles.toFixed(1)} mi`;
        (app as any).distanceValue = distance;
        
      } catch (err) {
        console.warn(`Could not calculate distance for application ${app.id}:`, err);
      }
    } else {
      console.warn(`Application ${app.id} has no coordinates, setting maximum distance`);
    }
    
    return app;
  });
  
  // Then sort by the raw distance value - lower distance values come first
  return [...applicationsWithDistance].sort((a, b) => {
    const distanceA = (a as any).distanceValue ?? Number.MAX_SAFE_INTEGER;
    const distanceB = (b as any).distanceValue ?? Number.MAX_SAFE_INTEGER;
    return distanceA - distanceB;
  });
};

/**
 * Adds distance information to applications based on coordinates
 * @param applications Applications to add distance to
 * @param coordinates Center coordinates to measure distance from
 * @returns Applications with distance information added
 */
export const addDistanceToApplications = (
  applications: Application[],
  coordinates: [number, number]
): Application[] => {
  if (!applications || applications.length === 0 || !coordinates) {
    return applications || [];
  }
  
  console.log('📏 Adding distance information to applications from:', coordinates);
  
  return applications.map(app => {
    // Create a new object to avoid mutating the original
    const appWithDistance = { ...app };
    
    if (appWithDistance.coordinates) {
      try {
        const distance = calculateDistance(coordinates, appWithDistance.coordinates);
        
        // Store the raw distance value for sorting
        (appWithDistance as any).distanceValue = distance;
        
        // Format the distance for display (convert km to miles)
        const distanceInMiles = distance * 0.621371;
        appWithDistance.distance = `${distanceInMiles.toFixed(1)} mi`;
        
        if (distance > 50) {
          console.warn(`Application ${app.id} is very far: ${distance.toFixed(2)}km / ${distanceInMiles.toFixed(1)} miles`);
        }
      } catch (err) {
        console.warn(`Could not calculate distance for application ${app.id}:`, err);
        (appWithDistance as any).distanceValue = Number.MAX_SAFE_INTEGER;
      }
    } else {
      console.warn(`Could not calculate distance for application ${app.id}: missing coordinates`);
      (appWithDistance as any).distanceValue = Number.MAX_SAFE_INTEGER;
    }
    
    return appWithDistance;
  });
};
