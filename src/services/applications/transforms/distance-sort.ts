
/**
 * Transforms and sorts applications by distance from search coordinates
 */
export const transformAndSortApplications = (
  applications: any[],
  coordinates: [number, number]
): any[] => {
  console.log(`🔍 Transforming and sorting ${applications.length} applications by distance from`, coordinates);
  
  if (!applications?.length || !coordinates) {
    return applications;
  }
  
  // Add distance to each application
  const appsWithDistance = applications.map(app => {
    // Skip if app doesn't have coordinates
    if (!app.coordinates || !Array.isArray(app.coordinates) || app.coordinates.length !== 2) {
      console.log(`Missing or invalid coordinates for application ${app.id}`);
      return { ...app, distance: "Unknown", distanceValue: Number.MAX_SAFE_INTEGER };
    }
    
    try {
      // IMPORTANT: Coordinates should be in [latitude, longitude] format
      const [searchLat, searchLng] = coordinates;
      const [appLat, appLng] = app.coordinates;
      
      // Basic validation
      if (isNaN(searchLat) || isNaN(searchLng) || isNaN(appLat) || isNaN(appLng)) {
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
      
      console.log(`Distance for app ${app.id} (${app.address || 'No address'}): ${distanceInMiles.toFixed(1)} miles`, {
        appCoords: [appLat, appLng],
        searchCoords: [searchLat, searchLng]
      });
      
      return { 
        ...app, 
        distance: `${distanceInMiles.toFixed(1)} mi`,
        distanceValue: distance // Store raw distance in km for consistent sorting
      };
    } catch (error) {
      console.error(`Error calculating distance for application ${app.id}:`, error);
      return { ...app, distance: "Unknown", distanceValue: Number.MAX_SAFE_INTEGER };
    }
  });
  
  // Sort by the raw distance value
  const sortedApps = [...appsWithDistance].sort((a, b) => {
    const distanceA = a.distanceValue ?? Number.MAX_SAFE_INTEGER;
    const distanceB = b.distanceValue ?? Number.MAX_SAFE_INTEGER;
    return distanceA - distanceB;
  });
  
  // Log the closest applications for debugging
  console.log('🏆 Top 5 closest applications after sorting:');
  sortedApps.slice(0, 5).forEach(app => {
    console.log(`App ${app.id}: ${app.distance} - ${app.address || 'No address'} - Coordinates: ${JSON.stringify(app.coordinates)}`);
  });
  
  return sortedApps;
};
