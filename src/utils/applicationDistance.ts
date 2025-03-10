
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
        distance: 'Unknown distance'
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
  
  // First add distance information if not already present
  const appsWithDistance = applications.every(app => 'distanceValue' in app) 
    ? applications 
    : addDistanceToApplications(applications, searchCoordinates);
  
  // Sort by distance, handling applications without coordinates
  return [...appsWithDistance].sort((a, b) => {
    // Handle missing distance values
    if (!a.coordinates && !b.coordinates) return 0;
    if (!a.coordinates) return 1; // Push items without coordinates to the end
    if (!b.coordinates) return -1;
    
    // Sort by numeric distance value
    const distanceA = 'distanceValue' in a ? (a.distanceValue as number) : 
      calculateDistance(searchCoordinates, a.coordinates) * 0.621371;
    
    const distanceB = 'distanceValue' in b ? (b.distanceValue as number) : 
      calculateDistance(searchCoordinates, b.coordinates) * 0.621371;
    
    return distanceA - distanceB;
  });
};
