
import { Application } from "@/types/planning";

/**
 * Sort applications by distance from search coordinates
 */
export const sortApplicationsByDistance = (
  applications: Application[],
  coordinates: [number, number]
): Application[] => {
  // First add distance information to each application
  const appsWithDistance = applications.map(app => {
    const appCopy = { ...app };
    
    if (app.coordinates) {
      try {
        // Calculate distance using the Haversine formula
        const [lat1, lon1] = coordinates;
        const [lat2, lon2] = app.coordinates;
        
        if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || 
            typeof lat2 !== 'number' || typeof lon2 !== 'number') {
          console.warn(`Invalid coordinates for app ${app.id}:`, { coordinates, appCoordinates: app.coordinates });
          (appCopy as any).distanceValue = Number.MAX_SAFE_INTEGER;
          return appCopy;
        }
        
        // Haversine formula
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        // Store both raw value and formatted string for display
        const distanceInMiles = distance * 0.621371;
        appCopy.distance = `${distanceInMiles.toFixed(1)} mi`;
        (appCopy as any).distanceValue = distance;
        
        console.log(`Distance for app ${app.id}: ${distance.toFixed(2)}km (${distanceInMiles.toFixed(2)} mi)`);
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
  
  // Then sort by the calculated distance value - ensure we're using numeric values
  return [...appsWithDistance].sort((a, b) => {
    const distanceA = (a as any).distanceValue;
    const distanceB = (b as any).distanceValue;
    
    // Ensure we're comparing numbers
    const numA = typeof distanceA === 'number' && !isNaN(distanceA) ? distanceA : Number.MAX_SAFE_INTEGER;
    const numB = typeof distanceB === 'number' && !isNaN(distanceB) ? distanceB : Number.MAX_SAFE_INTEGER;
    
    return numA - numB;
  });
};

// Export a standalone distance calculation function for reuse
export const calculateDistanceBetween = (
  point1: [number, number], 
  point2: [number, number]
): number => {
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  
  if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || 
      typeof lat2 !== 'number' || typeof lon2 !== 'number') {
    return Number.MAX_SAFE_INTEGER;
  }
  
  // Haversine formula
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance;
};
