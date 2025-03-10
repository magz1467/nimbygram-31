
import { Application } from "@/types/planning";
import { SearchCoordinates } from "../types/search-types";
import { calculateRelevance } from "./relevance-scorer";

export const transformAndSortResults = (
  results: Application[], 
  coordinates: SearchCoordinates,
  searchTerm?: string
): Application[] => {
  console.log('🔄 Transforming and sorting results:', { 
    resultCount: results.length, 
    hasCoordinates: !!coordinates, 
    searchTerm 
  });
  
  // Filter results if we have a search term and no coordinates
  let filteredResults = results;
  
  if (searchTerm && !coordinates) {
    const searchTermLower = searchTerm.toLowerCase();
    console.log('🔍 Filtering by search term without coordinates:', searchTermLower);
    
    filteredResults = results.filter(app => {
      const addressMatch = app.address?.toLowerCase().includes(searchTermLower);
      const wardMatch = app.ward?.toLowerCase().includes(searchTermLower);
      const districtMatch = app.local_authority_district_name?.toLowerCase().includes(searchTermLower);
      const descriptionMatch = app.description?.toLowerCase().includes(searchTermLower);
      
      return addressMatch || wardMatch || districtMatch || descriptionMatch;
    });
    
    console.log(`🔍 Filtered from ${results.length} to ${filteredResults.length} results by text`);
  }

  if (coordinates) {
    // Sort by distance if we have coordinates
    console.log('🔄 Sorting by distance from coordinates');
    return filteredResults.sort((a, b) => {
      if (!a.distanceValue || !b.distanceValue) return 0;
      return a.distanceValue - b.distanceValue;
    });
  } else if (searchTerm) {
    // Sort by relevance for text searches
    console.log('🔄 Sorting by relevance to:', searchTerm);
    return filteredResults.sort((a, b) => {
      const relevanceA = calculateRelevance(a, searchTerm);
      const relevanceB = calculateRelevance(b, searchTerm);
      return relevanceB - relevanceA;
    });
  }
  
  // Default: sort by most recent
  console.log('🔄 Using default sort by submission date');
  return filteredResults.sort((a, b) => {
    const dateA = a.submittedDate || a.submissionDate || a.received_date || '';
    const dateB = b.submittedDate || b.submissionDate || b.received_date || '';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
};
