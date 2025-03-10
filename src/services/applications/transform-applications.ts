
/**
 * Filters applications by location relevance to the search term
 * @param applications List of applications to filter
 * @param searchTerm The search term (postcode, location)
 * @returns Filtered list of applications
 */
export const filterByLocationRelevance = (
  applications: any[],
  searchTerm: string
): any[] => {
  if (!searchTerm || !applications?.length) {
    return applications;
  }

  console.log('Filtering by location relevance for:', searchTerm);
  
  // Normalize the search term for comparison
  const normalizedSearchTerm = searchTerm.toLowerCase().replace(/\s+/g, '');
  
  // Score each application based on how closely its address matches the search term
  const scoredApplications = applications.map(app => {
    let score = 0;
    
    if (!app.address) {
      return { ...app, score };
    }
    
    const normalizedAddress = app.address.toLowerCase().replace(/\s+/g, '');
    
    // Check for exact postcode match first (highest priority)
    // This ensures exact matches take precedence over partial matches
    if (normalizedAddress.includes(normalizedSearchTerm)) {
      score += 5;
    } 
    // Check if the postcode portion matches only (for UK postcodes like "XX1 2YY")
    else if (normalizedSearchTerm.length >= 6) {
      // Try to match the postcode area and district (e.g., "HP22" in "HP22 6JJ")
      const postcodePrefix = normalizedSearchTerm.substring(0, 4);
      if (normalizedAddress.includes(postcodePrefix)) {
        score += 3;
      }
    }
    
    return { ...app, score };
  });
  
  // Filter to only include applications with a positive score
  // or all applications if no relevant ones were found
  const relevantApplications = scoredApplications.filter(app => app.score > 0);
  
  // If we find relevant applications, return them sorted by score
  if (relevantApplications.length > 0) {
    // Sort by score (highest first)
    relevantApplications.sort((a, b) => b.score - a.score);
    
    // Log the top scoring applications
    console.log('Top scoring applications:', relevantApplications.slice(0, 5).map(app => ({
      id: app.id,
      address: app.address,
      score: app.score
    })));
    
    console.log(`Found ${relevantApplications.length} location-relevant applications out of ${applications.length}`);
    return relevantApplications;
  }
  
  // If no relevant applications, return all applications
  return applications;
};

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
    // Skip if app doesn't have coordinates
    if (!app.coordinates || !Array.isArray(app.coordinates) || app.coordinates.length !== 2) {
      console.log(`Missing or invalid coordinates for application ${app.id}`);
      return { ...app, distance: Number.MAX_SAFE_INTEGER };
    }
    
    try {
      // Calculate distance using the utilities from applicationDistance
      const [lat1, lng1] = coordinates;
      const [lat2, lng2] = app.coordinates;
      
      // Basic validation
      if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
        console.log(`Invalid coordinates for distance calculation: [${lat1},${lng1}] to [${lat2},${lng2}]`);
        return { ...app, distance: Number.MAX_SAFE_INTEGER };
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
      
      return { ...app, distance };
    } catch (error) {
      console.error(`Error calculating distance for application ${app.id}:`, error);
      return { ...app, distance: Number.MAX_SAFE_INTEGER };
    }
  });
  
  // Sort by distance (closest first)
  const sortedApps = [...appsWithDistance].sort((a, b) => 
    (a.distance || Number.MAX_SAFE_INTEGER) - (b.distance || Number.MAX_SAFE_INTEGER)
  );
  
  // Log the closest applications for debugging
  console.log('Closest applications after sorting:');
  sortedApps.slice(0, 5).forEach(app => {
    console.log(`App ${app.id}: ${app.distance?.toFixed(2)}km - ${app.address || 'No address'}`);
  });
  
  return sortedApps;
};
