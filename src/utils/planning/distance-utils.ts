
/**
 * Utility functions for distance calculations in planning application search
 */

/**
 * Calculate distance between two points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Calculate geographic bounds for a radius search around a point
 * @param lat Center latitude
 * @param lng Center longitude
 * @param radiusKm Radius in kilometers
 * @returns Bounding box coordinates as [minLat, maxLat, minLng, maxLng]
 */
export const calculateGeographicBounds = (lat: number, lng: number, radiusKm: number): [number, number, number, number] => {
  const kmPerDegree = 111.32;
  const latDiff = radiusKm / kmPerDegree;
  const lngDiff = radiusKm / (kmPerDegree * Math.cos(lat * Math.PI / 180));
  
  return [
    lat - latDiff,  // minLat
    lat + latDiff,  // maxLat
    lng - lngDiff,  // minLng
    lng + lngDiff   // maxLng
  ];
};
