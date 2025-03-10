
import { LatLngTuple } from "leaflet";
import { Application } from "@/types/planning";

/**
 * Calculate distance between two points using the Haversine formula
 */
export const calculateDistance = (point1: LatLngTuple, point2: LatLngTuple): number => {
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  
  // Validate coordinates
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

/**
 * Find the closest application to a point
 */
export const findClosestApplication = (
  applications: Application[],
  coordinates: LatLngTuple
): number => {
  if (!applications.length || !coordinates) {
    return -1;
  }
  
  let closestDistance = Infinity;
  let closestId = -1;

  applications.forEach(app => {
    if (app.coordinates) {
      const distance = calculateDistance(coordinates, app.coordinates);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestId = app.id;
      }
    }
  });

  return closestId;
};

/**
 * Format distance in miles
 */
export const formatDistance = (distanceKm: number): string => {
  const distanceMiles = distanceKm * 0.621371;
  return `${distanceMiles.toFixed(1)} mi`;
};
