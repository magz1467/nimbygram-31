/**
 * Transforms and sorts applications by distance from search coordinates
 * @param applications List of applications to transform and sort
 * @param coordinates Search coordinates [lat, lng]
 * @returns Sorted applications with distance information
 */
export const transformAndSortApplications = (
  applications: any[],
  coordinates: [number, number]
): any[] => {
  console.log(`Transforming and sorting ${applications.length} applications by distance`);
  
  if (!applications?.length || !coordinates) {
    return applications;
  }
  
  // Add distance to each application
  const appsWithDistance = applications.map(app => {
    // Preserve any existing score from location relevance filtering
    const score = app.score || 0;
    
    // Skip if app doesn't have coordinates
    if (!app.coordinates || !Array.isArray(app.coordinates) || app.coordinates.length !== 2) {
      console.log(`Missing or invalid coordinates for application ${app.id}`);
      return { ...app, distance: Number.MAX_SAFE_INTEGER, score };
    }
    
    try {
      // Calculate distance using the Haversine formula
      const [lat1, lng1] = coordinates;
      const [lat2, lng2] = app.coordinates;
      
      // Basic validation
      if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
        console.log(`Invalid coordinates for distance calculation: [${lat1},${lng1}] to [${lat2},${lng2}]`);
        return { ...app, distance: Number.MAX_SAFE_INTEGER, score };
      }
      
      // Using the Haversine formula to calculate distance
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lng2 - lng1) * Math.PI / 180;
      
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return { ...app, distance, score };
    } catch (error) {
      console.error(`Error calculating distance for application ${app.id}:`, error);
      return { ...app, distance: Number.MAX_SAFE_INTEGER, score };
    }
  });
  
  // Sort by score first (from filterByLocationRelevance), then by distance
  const sortedApps = [...appsWithDistance].sort((a, b) => {
    // If both have scores and they're different, sort by score first
    if (a.score > 0 || b.score > 0) {
      return (b.score || 0) - (a.score || 0); // Higher scores first
    }
    // Otherwise sort by distance
    return (a.distance || Number.MAX_SAFE_INTEGER) - (b.distance || Number.MAX_SAFE_INTEGER);
  });
  
  // Log the closest applications for debugging
  console.log('Top applications after sorting by relevance and distance:');
  sortedApps.slice(0, 5).forEach(app => {
    console.log(`App ${app.id}: score=${app.score || 0}, distance=${app.distance?.toFixed(2)}km - ${app.address || 'No address'}`);
  });
  
  return sortedApps;
};
