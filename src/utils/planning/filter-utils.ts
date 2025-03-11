
import { Application } from "@/types/planning";
import { SearchFilters } from "@/hooks/planning/use-planning-search-types";

/**
 * Apply in-memory filters to applications based on search criteria
 * @param applications List of applications to filter
 * @param filters Filter criteria to apply
 * @returns Filtered list of applications
 */
export const applyFilters = (applications: Application[], filters: SearchFilters): Application[] => {
  if (!applications || applications.length === 0) {
    return [];
  }
  
  let filteredResults = [...applications];
  
  if (filters.status) {
    filteredResults = filteredResults.filter(app => 
      app.status?.toLowerCase().includes(filters.status?.toLowerCase() || '')
    );
  }
  
  if (filters.type) {
    filteredResults = filteredResults.filter(app => 
      app.type?.toLowerCase().includes(filters.type?.toLowerCase() || '') ||
      app.application_type_full?.toLowerCase().includes(filters.type?.toLowerCase() || '')
    );
  }
  
  if (filters.classification) {
    filteredResults = filteredResults.filter(app => 
      app.class_3?.toLowerCase().includes(filters.classification?.toLowerCase() || '')
    );
  }
  
  return filteredResults;
};
