
import { Application } from "@/types/planning";
import { calculateDistance } from "@/utils/distance";

/**
 * Adds distance information to applications based on search coordinates
 */
export const addDistanceToApplications = (
  applications: Application[],
  searchCoordinates: [number, number] | null | undefined
): Application[] => {
  if (!searchCoordinates) return applications;
  
  return applications.map(app => {
    if (!app.coordinates) return app;
    
    const distanceInKm = calculateDistance(searchCoordinates, app.coordinates);
    const distanceInMiles = distanceInKm * 0.621371;
    
    return {
      ...app,
      distance: `${distanceInMiles.toFixed(1)} mi`
    };
  });
};
