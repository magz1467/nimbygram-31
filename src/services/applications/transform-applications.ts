
// Note: I'm assuming this file exists based on imports. 
// If it doesn't, we'll need to create it with proper content.

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
