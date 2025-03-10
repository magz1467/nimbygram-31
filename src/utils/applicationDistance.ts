
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
