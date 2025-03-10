
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
  
  // First calculate distances
  const applicationsWithDistance = applications.map(app => {
    let distance = Number.MAX_SAFE_INTEGER;
    
    if (app.coordinates) {
      distance = calculateDistance(coordinates, app.coordinates);
      
      // Update the distance display in the application
      const distanceInMiles = distance * 0.621371;
      app.distance = `${distanceInMiles.toFixed(1)} mi`;
    }
    
    return {
      application: app,
      distanceKm: distance
    };
  });
  
  // Then sort by distance
  return applicationsWithDistance
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .map(item => item.application);
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
  
  return applications.map(app => {
    // Create a new object to avoid mutating the original
    const appWithDistance = { ...app };
    
    if (appWithDistance.coordinates) {
      const distance = calculateDistance(coordinates, appWithDistance.coordinates);
      
      // Store the raw distance value for sorting
      (appWithDistance as any).distanceValue = distance;
      
      // Format the distance for display (convert km to miles)
      const distanceInMiles = distance * 0.621371;
      appWithDistance.distance = `${distanceInMiles.toFixed(1)} mi`;
    }
    
    return appWithDistance;
  });
};
