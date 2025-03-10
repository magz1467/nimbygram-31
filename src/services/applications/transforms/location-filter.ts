
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
    
    // Check for exact place name/postcode match first (highest priority)
    if (normalizedAddress.includes(normalizedSearchTerm)) {
      score += 10; // Increase score for exact matches
      
      // Boost score for word boundary matches to prioritize exact place names
      const placeNamePattern = new RegExp(`\\b${normalizedSearchTerm}\\b`, 'i');
      if (placeNamePattern.test(app.address)) {
        score += 5; // Additional points for exact word match
      }
    } 
    // For postcodes, check if the postcode portion matches
    else if (normalizedSearchTerm.length >= 6 && normalizedSearchTerm.match(/[a-z]{1,2}[0-9][0-9a-z]?\s*[0-9][a-z]{2}/i)) {
      // Try to match the postcode area and district (e.g., "HP22" in "HP22 6JJ")
      const postcodePrefix = normalizedSearchTerm.substring(0, 4);
      if (normalizedAddress.includes(postcodePrefix)) {
        score += 5;
      }
    }
    // For place names (like "Wendover"), check for word boundaries
    else {
      // Look for the place name as a whole word, not just part of another word
      // This helps distinguish "Wendover" from places that might contain it as a substring
      const placeNamePattern = new RegExp(`\\b${normalizedSearchTerm}\\b`, 'i');
      if (placeNamePattern.test(app.address)) {
        score += 15; // Higher score for exact place name matches
      }
    }
    
    return { ...app, score };
  });
  
  // With our new sorting approach, we'll return ALL applications with scores attached
  // rather than filtering, so that distance sorting can be combined with text relevance
  console.log(`Added text relevance scores to ${applications.length} applications`);
  
  // Log highly scoring applications
  const highScoringApps = scoredApplications
    .filter(app => app.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
    
  if (highScoringApps.length > 0) {
    console.log('Top text-matching applications:', highScoringApps.map(app => ({
      id: app.id,
      address: app.address,
      score: app.score
    })));
  }
  
  return scoredApplications;
};
