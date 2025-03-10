
import { LatLngTuple } from "leaflet";
import { Application } from "@/types/planning";

/**
 * Calculate distance between two points using the Haversine formula
 * This is the canonical implementation that should be used throughout the app
 */
export const calculateDistance = (point1: LatLngTuple, point2: LatLngTuple): number => {
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  
  // Validate coordinates
  if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || 
      typeof lat2 !== 'number' || typeof lon2 !== 'number' ||
      isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    console.warn('Invalid coordinates:', { point1, point2 });
    return Number.MAX_SAFE_INTEGER;
  }
  
  // Haversine formula - more accurate for Earth's curvature
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  // Debug log the distance calculation details with 6 decimal precision for coordinates
  console.log(`Distance calculation: [${lat1.toFixed(6)}, ${lon1.toFixed(6)}] to [${lat2.toFixed(6)}, ${lon2.toFixed(6)}] = ${distance.toFixed(3)}km`);

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

  // Sort all applications by distance first
  const sortedApps = applications
    .filter(app => app.coordinates)
    .map(app => {
      const distance = calculateDistance(coordinates, app.coordinates!);
      return { app, distance };
    })
    .sort((a, b) => a.distance - b.distance);
  
  // Log the top 5 closest applications for debugging
  if (sortedApps.length > 0) {
    console.log("Top 5 closest applications:");
    sortedApps.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ID: ${item.app.id}, Distance: ${item.distance.toFixed(3)}km, Address: ${item.app.address}`);
    });
    
    // Return the closest ID
    closestId = sortedApps[0].app.id;
  }

  return closestId;
};

/**
 * Format distance in miles
 */
export const formatDistance = (distanceKm: number): string => {
  if (typeof distanceKm !== 'number' || isNaN(distanceKm)) {
    return "Unknown";
  }
  
  const distanceMiles = distanceKm * 0.621371;
  return `${distanceMiles.toFixed(1)} mi`;
};

/**
 * Sort applications by distance from search coordinates
 * This is the canonical implementation that should be used throughout the app
 */
export const sortApplicationsByDistance = (
  applications: Application[],
  coordinates: [number, number]
): Application[] => {
  if (!applications || !coordinates) {
    return [...applications];
  }
  
  // Add detailed logging for debugging the sorting process
  console.log(`Sorting ${applications.length} applications by distance from [${coordinates[0]}, ${coordinates[1]}]`);
  
  // First add distance information to each application
  const appsWithDistance = applications.map(app => {
    const appCopy = { ...app };
    
    if (app.coordinates) {
      try {
        // Use our canonical distance calculation function
        const distance = calculateDistance(coordinates, app.coordinates);
        
        // Store raw distance value for sorting (in kilometers)
        (appCopy as any).distanceValue = distance;
        
        // Format for display (in miles)
        const distanceInMiles = distance * 0.621371;
        appCopy.distance = `${distanceInMiles.toFixed(1)} mi`;
      } catch (error) {
        console.warn(`Error calculating distance for app ${app.id}:`, error);
        (appCopy as any).distanceValue = Number.MAX_SAFE_INTEGER;
      }
    } else {
      console.warn(`Application ${app.id} has no coordinates, setting max distance`);
      (appCopy as any).distanceValue = Number.MAX_SAFE_INTEGER;
    }
    
    return appCopy;
  });
  
  // Then sort by the calculated distance value
  const sortedApps = [...appsWithDistance].sort((a, b) => {
    const distanceA = (a as any).distanceValue ?? Number.MAX_SAFE_INTEGER;
    const distanceB = (b as any).distanceValue ?? Number.MAX_SAFE_INTEGER;
    
    // Ensure we're comparing numbers
    const numA = typeof distanceA === 'number' && !isNaN(distanceA) ? distanceA : Number.MAX_SAFE_INTEGER;
    const numB = typeof distanceB === 'number' && !isNaN(distanceB) ? distanceB : Number.MAX_SAFE_INTEGER;
    
    return numA - numB;
  });
  
  // Log the first few sorted applications for debugging
  if (sortedApps.length > 0) {
    console.log("🔍 Applications sorted by distance:");
    sortedApps.slice(0, 5).forEach((app, index) => {
      console.log(`${index + 1}. ID: ${app.id}, Address: ${app.address}, Distance: ${(app as any).distanceValue?.toFixed(3) || 'unknown'}km (${app.distance})`);
    });
  }
  
  return sortedApps;
};
