
import { Application } from "@/types/planning";
import { transformApplicationData } from "@/utils/transforms/application-transformer";
import { calculateDistance } from "@/utils/distance";

export const transformAndSortApplications = (
  applications: any[],
  coordinates: [number, number]
): Application[] => {
  if (!applications || !Array.isArray(applications) || applications.length === 0) {
    return [];
  }
  
  // Transform the applications
  const transformedApplications = applications
    .map(app => transformApplicationData(app, coordinates))
    .filter((app): app is Application => app !== null);
  
  // Add distance to each application
  const appsWithDistance = transformedApplications.map(app => {
    const appCopy = { ...app };
    
    if (app.coordinates) {
      try {
        // Calculate distance in kilometers
        const distance = calculateDistance(coordinates, app.coordinates);
        
        // Store the raw distance value for sorting (in kilometers)
        (appCopy as any).distanceValue = distance;
        
        // Convert to miles for display only
        const distanceInMiles = distance * 0.621371;
        appCopy.distance = `${distanceInMiles.toFixed(1)} mi`;
        
        console.log(`📍 App ${app.id} distance: ${distance.toFixed(3)}km (${distanceInMiles.toFixed(3)} mi)`);
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
  
  // Sort by the raw distance value - ensure we're using numeric values
  const sortedApps = [...appsWithDistance].sort((a, b) => {
    // Extract the distance values, checking for undefined/null
    const distanceA = (a as any).distanceValue;
    const distanceB = (b as any).distanceValue;
    
    // Convert to numeric values, with fallbacks for any NaN or invalid values
    const numA = typeof distanceA === 'number' && !isNaN(distanceA) ? distanceA : Number.MAX_SAFE_INTEGER;
    const numB = typeof distanceB === 'number' && !isNaN(distanceB) ? distanceB : Number.MAX_SAFE_INTEGER;
    
    return numA - numB;
  });
  
  // Log the first few sorted applications
  console.log("\n🔍 First 5 applications sorted by distance:");
  sortedApps.slice(0, 5).forEach((app, index) => {
    const distVal = (app as any).distanceValue;
    console.log(`${index + 1}. ID: ${app.id}, Distance: ${typeof distVal === 'number' ? distVal.toFixed(3) : 'unknown'}km (${app.distance})`);
  });
  
  return sortedApps;
};
