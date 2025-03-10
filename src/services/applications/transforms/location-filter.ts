
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
  
  // Simply pass through all applications without any text relevance filtering
  // Distance sorting will be handled separately by transformAndSortApplications
  return applications;
};
