
/**
 * Transforms and sorts applications by distance from search coordinates
 */
export const transformAndSortApplications = (
  applications: any[],
  coordinates: [number, number]
): any[] => {
  console.log(`🔍 Transforming and sorting ${applications?.length || 0} applications by distance from`, coordinates);
  
  // Guard clauses for invalid inputs
  if (!applications || !Array.isArray(applications) || applications.length === 0) {
    console.log('No valid applications array provided for distance sorting');
    return [];
  }
  
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    console.log('Invalid coordinates provided for distance sorting:', coordinates);
    return [...applications]; // Return a copy of the original array
  }
  
  // Make sure coordinates are valid numbers
  const [searchLat, searchLng] = coordinates;
  if (isNaN(searchLat) || isNaN(searchLng)) {
    console.warn('Invalid coordinate values:', coordinates);
    return [...applications]; // Return a copy of the original array
  }
  
  try {
    // Add distance to each application
    const appsWithDistance = applications.map(app => {
      // Skip if app doesn't have coordinates
      if (!app || !app.coordinates || !Array.isArray(app.coordinates)) {
        console.log(`Missing or invalid coordinates for application ${app?.id || 'unknown'}`);
        return { ...app, distance: "Unknown", distanceValue: Number.MAX_SAFE_INTEGER };
      }
      
      try {
        // IMPORTANT: Coordinates should be in [latitude, longitude] format
        let appLat, appLng;
        
        if (app.coordinates.length >= 2) {
          [appLat, appLng] = app.coordinates;
        } else {
          console.warn(`Invalid coordinates format for app ${app.id}:`, app.coordinates);
          return { ...app, distance: "Unknown", distanceValue: Number.MAX_SAFE_INTEGER };
        }
        
        // Basic validation
        if (isNaN(appLat) || isNaN(appLng)) {
          console.warn(`Invalid coordinates for distance calculation:`, {
            search: [searchLat, searchLng],
            app: [appLat, appLng],
            appId: app.id
          });
          return { ...app, distance: "Unknown", distanceValue: Number.MAX_SAFE_INTEGER };
        }
        
        // Using the Haversine formula to calculate distance
        const R = 6371; // Earth's radius in kilometers
        const dLat = (appLat - searchLat) * Math.PI / 180;
        const dLon = (appLng - searchLng) * Math.PI / 180;
        
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(searchLat * Math.PI / 180) * Math.cos(appLat * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        // Store both the raw distance value and formatted string
        const distanceInMiles = distance * 0.621371;
        
        // Create a new object to avoid mutating original
        return { 
          ...app, 
          distance: `${distanceInMiles.toFixed(1)} mi`,
          distanceValue: distance // Store raw distance in km for consistent sorting
        };
      } catch (error) {
        console.error(`Error calculating distance for application ${app?.id || 'unknown'}:`, error);
        return { ...app, distance: "Unknown", distanceValue: Number.MAX_SAFE_INTEGER };
      }
    });
    
    // Create a copy before sorting to avoid mutation
    const sortedApps = [...appsWithDistance].sort((a, b) => {
      const distanceA = typeof a?.distanceValue === 'number' ? a.distanceValue : Number.MAX_SAFE_INTEGER;
      const distanceB = typeof b?.distanceValue === 'number' ? b.distanceValue : Number.MAX_SAFE_INTEGER;
      return distanceA - distanceB;
    });
    
    // Log the closest applications for debugging
    if (sortedApps.length > 0) {
      console.log('🏆 Top 5 closest applications after sorting:');
      sortedApps.slice(0, 5).forEach(app => {
        console.log(`App ${app.id}: ${app.distance} - ${app.address || 'No address'} - Coordinates: ${JSON.stringify(app.coordinates)}`);
      });
    } else {
      console.log('No applications found after sorting');
    }
    
    return sortedApps;
  } catch (error) {
    console.error('Error in transformAndSortApplications:', error);
    return [...applications]; // Return a copy of the original array as fallback
  }
};
