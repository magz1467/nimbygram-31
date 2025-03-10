
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
    if (!app.coordinates) {
      // If application has no coordinates, mark with 'Unknown distance'
      return {
        ...app,
        distance: 'Unknown distance'
      };
    }
    
    try {
      // Calculate and format distance
      const distanceInKm = calculateDistance(searchCoordinates, app.coordinates);
      const distanceInMiles = distanceInKm * 0.621371;
      
      // Add formatted distance
      return {
        ...app,
        distance: `${distanceInMiles.toFixed(1)} mi`
      };
    } catch (err) {
      console.error('Error calculating distance for application:', app.id, err);
      return {
        ...app,
        distance: 'Unknown distance'
      };
    }
  });
};

/**
 * Groups applications by distance ranges for better organization
 */
export const groupApplicationsByDistance = (
  applications: Application[]
): Record<string, Application[]> => {
  const result: Record<string, Application[]> = {
    'Under 1 mile': [],
    '1-5 miles': [],
    '5-10 miles': [],
    'Over 10 miles': [],
    'Unknown': []
  };
  
  applications.forEach(app => {
    // Extract numeric distance if possible
    let distanceValue: number | null = null;
    if (app.distance) {
      const match = app.distance.match(/^([\d.]+)/);
      if (match) {
        distanceValue = parseFloat(match[1]);
      }
    }
    
    // Place in appropriate group
    if (distanceValue === null) {
      result['Unknown'].push(app);
    } else if (distanceValue < 1) {
      result['Under 1 mile'].push(app);
    } else if (distanceValue < 5) {
      result['1-5 miles'].push(app);
    } else if (distanceValue < 10) {
      result['5-10 miles'].push(app);
    } else {
      result['Over 10 miles'].push(app);
    }
  });
  
  return result;
};
