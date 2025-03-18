
import { LatLngTuple } from 'leaflet';
import { calculateDistance, formatDistance } from '../distance';

/**
 * Calculates and formats distance between two points
 */
export const calculateFormattedDistance = (
  center: LatLngTuple, 
  coordinates: [number, number] | null
): string => {
  if (!center || !coordinates) {
    return 'Unknown';
  }
  
  // Log the input coordinates for debugging
  console.log(`Calculating distance from [${center[0].toFixed(6)}, ${center[1].toFixed(6)}] to [${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}]`);
  
  // Validate coordinates are in correct format [lat, lng]
  if (Math.abs(center[0]) > 90 || Math.abs(coordinates[0]) > 90) {
    console.error('Invalid latitude detected in coordinates', { center, coordinates });
    return 'Invalid coords';
  }
  
  const distanceInKm = calculateDistance(center[0], center[1], coordinates[0], coordinates[1]);
  return formatDistance(distanceInKm);
};
