
import { LatLngTuple } from "leaflet";
import { Application } from "@/types/planning";

/**
 * Calculate distance between two points using Haversine formula
 * All coordinates must be in [latitude, longitude] format
 */
export const calculateDistance = (point1: LatLngTuple, point2: LatLngTuple): number => {
  // Ensure coordinates are in correct order [lat, lng]
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  
  // Early validation to prevent NaN results
  if (!isValidCoordinate(lat1) || !isValidCoordinate(lon1) || 
      !isValidCoordinate(lat2) || !isValidCoordinate(lon2)) {
    console.error('Invalid coordinates in distance calculation:', { point1, point2 });
    return Number.MAX_SAFE_INTEGER;
  }

  // Calculate great-circle distance using Haversine formula
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
           Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  console.log(`Distance calculation: From [${lat1.toFixed(6)}, ${lon1.toFixed(6)}] to [${lat2.toFixed(6)}, ${lon2.toFixed(6)}] = ${distance.toFixed(2)}km`);
  
  return distance;
};

function isValidCoordinate(coord: number): boolean {
  return typeof coord === 'number' && 
         !isNaN(coord) && 
         isFinite(coord) && 
         Math.abs(coord) <= 180; // Basic range check
}

function toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

export const formatDistance = (distanceKm: number): string => {
  if (typeof distanceKm !== 'number' || isNaN(distanceKm)) {
    return "Unknown";
  }
  const distanceMiles = distanceKm * 0.621371;
  return `${distanceMiles.toFixed(1)} mi`;
};

/**
 * Sort applications by distance using Haversine formula
 */
export const sortApplicationsByDistance = (
  applications: Application[],
  coordinates: [number, number]
): Application[] => {
  if (!applications || !coordinates) {
    console.error('Missing data for distance sorting:', { 
      hasApplications: !!applications, 
      coordinates 
    });
    return [...applications];
  }

  console.log(`Sorting ${applications.length} applications from [${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}]`);
  
  // Create a copy of applications with calculated distances
  const appsWithDistance = applications.map(app => {
    if (!app.coordinates) {
      console.warn(`Application ${app.id} missing coordinates`);
      return { ...app, _distanceValue: Number.MAX_SAFE_INTEGER };
    }
    
    // Calculate and store distance
    const distance = calculateDistance(coordinates, app.coordinates);
    return { ...app, _distanceValue: distance };
  });
  
  // Sort by the calculated distance
  const sortedApps = appsWithDistance.sort((a, b) => {
    // Safely access _distanceValue which we just added
    const distA = (a as any)._distanceValue;
    const distB = (b as any)._distanceValue;
    return distA - distB;
  });
  
  // Log the first few results for debugging
  console.log("\nSorted applications (first 5):");
  sortedApps.slice(0, 5).forEach((app, index) => {
    // Safely access _distanceValue which we just added
    const dist = (app as any)._distanceValue;
    console.log(`${index + 1}. ID: ${app.id}, Distance: ${dist.toFixed(2)}km (${app.distance}), Coordinates: ${app.coordinates?.[0].toFixed(6)},${app.coordinates?.[1].toFixed(6)}`);
  });
  
  // Return sorted applications without the temporary _distanceValue property
  return sortedApps.map(({ _distanceValue, ...app }: any) => app as Application);
};
