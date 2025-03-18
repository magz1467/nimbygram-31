
/**
 * Utility functions for calculating distance between coordinates
 */

import { Application } from '@/types/planning';

/**
 * Calculate distance between two points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Earth's radius in kilometers
  const R = 6371;
  
  // Convert degrees to radians
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  // Haversine formula
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

/**
 * Sort applications by distance from a reference point
 * @param applications Array of applications
 * @param coordinates Reference coordinates [lat, lng]
 * @returns Sorted applications array
 */
export function sortApplicationsByDistance(applications: Application[], coordinates: [number, number]): Application[] {
  if (!applications?.length || !coordinates) {
    return applications || [];
  }

  const [refLat, refLng] = coordinates;

  return [...applications].sort((a, b) => {
    // Calculate distance for application A
    let distanceA = Infinity;
    if (a.coordinates && a.coordinates.length === 2) {
      distanceA = calculateDistance(refLat, refLng, a.coordinates[0], a.coordinates[1]);
    } else if (typeof a.latitude === 'number' && typeof a.longitude === 'number') {
      distanceA = calculateDistance(refLat, refLng, a.latitude, a.longitude);
    }

    // Calculate distance for application B
    let distanceB = Infinity;
    if (b.coordinates && b.coordinates.length === 2) {
      distanceB = calculateDistance(refLat, refLng, b.coordinates[0], b.coordinates[1]);
    } else if (typeof b.latitude === 'number' && typeof b.longitude === 'number') {
      distanceB = calculateDistance(refLat, refLng, b.latitude, b.longitude);
    }

    return distanceA - distanceB;
  });
}

/**
 * Calculate and format the distance between an application and a set of coordinates
 */
export function getFormattedDistanceToCoordinates(application: Application, coordinates: [number, number]): string {
  if (!application.coordinates && (!application.latitude || !application.longitude)) {
    return 'Unknown distance';
  }
  
  const distance = getDistanceToApplication(coordinates[0], coordinates[1], application);
  return formatDistance(distance);
}

/**
 * Calculate distance between a coordinate and an application
 * @param lat Latitude
 * @param lng Longitude
 * @param application Application to calculate distance to
 * @returns Distance in kilometers
 */
export function getDistanceToApplication(lat: number, lng: number, application: Application): number {
  // Try to use coordinates first
  if (application.coordinates && application.coordinates.length === 2) {
    return calculateDistance(lat, lng, application.coordinates[0], application.coordinates[1]);
  }
  
  // Fall back to latitude/longitude properties if available
  if (typeof application.latitude === 'number' && typeof application.longitude === 'number') {
    return calculateDistance(lat, lng, application.latitude, application.longitude);
  }
  
  return Infinity;
}

/**
 * Format a distance in kilometers to a readable string
 * @param distanceKm Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distanceKm: number): string {
  // Convert to miles (1 km = 0.621371 miles)
  const distanceMiles = distanceKm * 0.621371;
  
  if (distanceMiles < 0.1) {
    return 'Very close';
  } else if (distanceMiles < 1) {
    return `${(distanceMiles * 1000).toFixed(0)} yards`;
  } else {
    return `${distanceMiles.toFixed(1)} miles`;
  }
}
