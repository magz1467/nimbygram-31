
import { LatLngTuple } from "leaflet";
import { Application } from "@/types/planning";

/**
 * Calculate distance between two points using Haversine formula
 * All coordinates must be in [latitude, longitude] format
 */
export const calculateDistance = (point1: LatLngTuple, point2: LatLngTuple): number => {
  // Verify coordinates are in correct order [lat, lng]
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  
  // Early validation to prevent NaN results
  if (!isValidCoordinate(lat1) || !isValidCoordinate(lon1) || 
      !isValidCoordinate(lat2) || !isValidCoordinate(lon2)) {
    console.warn('Invalid coordinates:', { point1, point2 });
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

  // Log for debugging
  console.log(`Distance calculation:
    From: [${lat1}, ${lon1}]
    To: [${lat2}, ${lon2}]
    Result: ${distance.toFixed(2)}km`);
  
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
    console.warn('Missing data for distance sorting:', { 
      hasApplications: !!applications, 
      coordinates 
    });
    return [...applications];
  }

  console.log(`Sorting ${applications.length} applications from [${coordinates}]`);
  
  return [...applications].sort((a, b) => {
    if (!a.coordinates || !b.coordinates) {
      console.warn('Missing coordinates for application:', { 
        aId: a.id, 
        bId: b.id,
        aCoords: a.coordinates,
        bCoords: b.coordinates
      });
      return 0;
    }

    const distanceA = calculateDistance(coordinates, a.coordinates);
    const distanceB = calculateDistance(coordinates, b.coordinates);
    
    return distanceA - distanceB;
  });
};
