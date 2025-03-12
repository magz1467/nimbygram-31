
/**
 * Calculates the distance between two points on Earth using the Haversine formula
 * @param point1 First point [lat, lng] or lat, lng as separate parameters
 * @param point2 Second point [lat, lng] or lat, lng as separate parameters
 * @returns Distance in kilometers
 */
export function calculateDistance(
  point1: [number, number] | number,
  point2?: [number, number] | number,
  lat2?: number,
  lon2?: number
): number {
  let lat1: number, lon1: number;
  
  // Handle different parameter formats
  if (Array.isArray(point1)) {
    [lat1, lon1] = point1;
    if (Array.isArray(point2)) {
      [lat2, lon2] = point2;
    }
  } else {
    lat1 = point1;
    lon1 = point2 as number;
  }
  
  // Validation
  if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || 
      typeof lat2 !== 'number' || typeof lon2 !== 'number' ||
      isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    console.error('Invalid coordinates in distance calculation:', { lat1, lon1, lat2, lon2 });
    return Number.MAX_SAFE_INTEGER; // Return a large value for invalid inputs
  }
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}

/**
 * Formats a distance value to a user-friendly string in miles
 * @param distanceKm Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distanceKm: number): string {
  if (typeof distanceKm !== 'number' || isNaN(distanceKm)) {
    return "Unknown";
  }
  const distanceMiles = distanceKm * 0.621371;
  return `${distanceMiles.toFixed(1)} mi`;
}
