
import { LatLngTuple } from 'leaflet';
import { calculateDistance, formatDistance } from '../distance';

/**
 * Calculates and formats distance between two points
 */
export const calculateFormattedDistance = (
  center: LatLngTuple, 
  coordinates: [number, number]
): string => {
  if (!center || !coordinates) {
    return 'Unknown';
  }
  
  const distanceInKm = calculateDistance(center, coordinates);
  return formatDistance(distanceInKm);
};
