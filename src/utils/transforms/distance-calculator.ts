
import { LatLngTuple } from 'leaflet';
import { calculateDistance } from '../distance';

/**
 * Calculates and formats distance between two points
 * @param center Center coordinates
 * @param coordinates Target coordinates
 * @returns Formatted distance string
 */
export const calculateFormattedDistance = (
  center: LatLngTuple, 
  coordinates: [number, number]
): string => {
  // Calculate distance if we have coordinates
  let formattedDistance = 'Unknown';
  
  if (coordinates) {
    const distanceInKm = calculateDistance(center, coordinates);
    const distanceInMiles = distanceInKm * 0.621371;
    formattedDistance = `${distanceInMiles.toFixed(1)} mi`;
  }
  
  return formattedDistance;
};
