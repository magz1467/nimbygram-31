
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

  console.log('Processing location search term:', searchTerm);
  
  // For location searches, we're simply passing through the applications
  // without any text relevance scoring - sorting will be handled by 
  // pure distance calculations
  
  return applications;
};
