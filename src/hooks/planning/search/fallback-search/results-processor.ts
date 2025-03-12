
import { Application } from "@/types/planning";
import { calculateDistance } from "../../utils/distance-calculator";

// Filter results to ensure they have valid coordinates
export function filterValidCoordinates(applications: any[]): any[] {
  return applications.filter((app) => {
    const hasValidCoordinates = 
      typeof app.latitude === 'number' && 
      typeof app.longitude === 'number' && 
      !isNaN(app.latitude) && 
      !isNaN(app.longitude);
    
    if (!hasValidCoordinates) {
      console.log('Filtering out application with invalid coordinates:', app.id);
    }
    
    return hasValidCoordinates;
  });
}

// Add distance information to each application
export function addDistanceInfo(applications: any[], searchLat: number, searchLng: number): Application[] {
  return applications.map((app) => {
    try {
      const distanceKm = calculateDistance(searchLat, searchLng, Number(app.latitude), Number(app.longitude));
      const distanceMiles = distanceKm * 0.621371;
      
      return {
        ...app,
        distance: `${distanceMiles.toFixed(1)} mi`,
        coordinates: [Number(app.latitude), Number(app.longitude)] as [number, number]
      };
    } catch (err) {
      console.error('Error calculating distance for application:', app.id, err);
      // Return the application without distance info if calculation fails
      return {
        ...app,
        distance: 'Unknown',
        coordinates: [Number(app.latitude), Number(app.longitude)] as [number, number]
      };
    }
  });
}

// Sort applications by distance from search point
export function sortByDistance(applications: Application[], searchLat: number, searchLng: number): Application[] {
  return [...applications].sort((a, b) => {
    try {
      const distA = calculateDistance(searchLat, searchLng, Number(a.latitude), Number(a.longitude));
      const distB = calculateDistance(searchLat, searchLng, Number(b.latitude), Number(b.longitude));
      return distA - distB;
    } catch (err) {
      console.error('Error sorting applications by distance:', err);
      return 0; // Keep original order if comparison fails
    }
  });
}

// Process raw applications data with all necessary transformations
export function processApplicationResults(
  data: any[],
  searchLat: number,
  searchLng: number
): Application[] {
  if (!data || data.length === 0) {
    console.log('No results to process');
    return [];
  }
  
  console.log(`Processing ${data.length} application results`);
  
  const validApplications = filterValidCoordinates(data);
  const withDistance = addDistanceInfo(validApplications, searchLat, searchLng);
  return sortByDistance(withDistance, searchLat, searchLng);
}
