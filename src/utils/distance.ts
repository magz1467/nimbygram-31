
import { Application } from '@/types/planning';

// Constants for earth calculations
const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_MILES = 3958.8;

/**
 * Calculates the distance between two geographic points using the Haversine formula
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number, 
  unit: 'km' | 'miles' = 'km'
): number => {
  const radius = unit === 'km' ? EARTH_RADIUS_KM : EARTH_RADIUS_MILES;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = radius * c;
  
  return distance;
};

/**
 * Converts degrees to radians
 */
const toRad = (degrees: number): number => {
  return degrees * Math.PI / 180;
};

/**
 * Formats a distance value with appropriate units
 */
export const formatDistance = (distance: number, unit: 'km' | 'miles' = 'miles'): string => {
  if (distance < 1) {
    // Show in meters/feet for short distances
    if (unit === 'km') {
      return `${Math.round(distance * 1000)}m`;
    } else {
      return `${Math.round(distance * 5280)}ft`;
    }
  } 
  
  // Show in km/miles with decimal place for longer distances
  return `${distance.toFixed(1)}${unit === 'km' ? 'km' : 'mi'}`;
};

/**
 * Add distance information to an application based on reference coordinates
 */
export const addDistanceToApplication = (
  application: Application, 
  referenceCoords: [number, number]
): Application => {
  if (!application.coordinates || !application.coordinates[0] || !application.coordinates[1]) {
    return { ...application, distance: undefined };
  }
  
  const [refLat, refLng] = referenceCoords;
  const [appLat, appLng] = application.coordinates;
  
  const distanceValue = calculateDistance(refLat, refLng, appLat, appLng, 'miles');
  
  return {
    ...application,
    _distanceValue: distanceValue, // Keep raw value for sorting
    distance: formatDistance(distanceValue, 'miles')
  };
};

/**
 * Sort applications by distance from reference coordinates
 */
export const sortApplicationsByDistance = (
  applications: Application[], 
  referenceCoords: [number, number]
): Application[] => {
  return applications
    .map(app => {
      // Skip adding distance if already present
      if (app.distance) return app as Application & { _distanceValue?: number };
      return addDistanceToApplication(app, referenceCoords);
    })
    .sort((a, b) => {
      const distanceA = (a as any)._distanceValue || 0;
      const distanceB = (b as any)._distanceValue || 0;
      return distanceA - distanceB;
    });
};
