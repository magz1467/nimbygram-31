
/**
 * Calculates a bounding box around a coordinate point based on a radius
 * @param lat Center latitude
 * @param lng Center longitude
 * @param radius Radius in kilometers
 * @returns Bounding box coordinates as {minLat, maxLat, minLng, maxLng}
 */
export const calculateBoundingBox = (lat: number, lng: number, radius: number) => {
  // 1 degree of latitude is approximately 111km
  const degreesLat = radius / 111.0;
  
  // 1 degree of longitude varies with latitude, roughly 111km * cos(latitude)
  const degreesLng = radius / (111.0 * Math.cos(lat * (Math.PI / 180)));

  return {
    minLat: lat - degreesLat,
    maxLat: lat + degreesLat,
    minLng: lng - degreesLng,
    maxLng: lng + degreesLng
  };
};
