
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
    
    if (app.coordinates) {
      distance = calculateDistance(coordinates, app.coordinates);
      console.log(`Application ${app.id} is ${distance.toFixed(2)}km from search location`);
      
      // Update the distance display in the application
      const distanceInMiles = distance * 0.621371;
      app.distance = `${distanceInMiles.toFixed(1)} mi`;
    } else {
      console.warn(`Application ${app.id} has no coordinates, setting maximum distance`);
    }
    
    return {
      application: app,
      distanceKm: distance
    };
  });
  
  // Then sort by distance - lower distance values come first
  const sortedApplications = applicationsWithDistance
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .map(item => item.application);
    
  console.log(`✅ Sorted ${sortedApplications.length} applications by distance. First 3 distances:`, 
    sortedApplications.slice(0, 3).map(app => app.distance));
  
  return sortedApplications;
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
      const distance = calculateDistance(coordinates, appWithDistance.coordinates);
      
      // Store the raw distance value for sorting
      (appWithDistance as any).distanceValue = distance;
      
      // Format the distance for display (convert km to miles)
      const distanceInMiles = distance * 0.621371;
      appWithDistance.distance = `${distanceInMiles.toFixed(1)} mi`;
      
      if (distance > 50) {
        console.warn(`Application ${app.id} is very far: ${distance.toFixed(2)}km / ${distanceInMiles.toFixed(1)} miles`);
      }
    } else {
      console.warn(`Could not calculate distance for application ${app.id}: missing coordinates`);
    }
    
    return appWithDistance;
  });
};
