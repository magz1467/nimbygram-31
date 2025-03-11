
/**
 * Type definitions for the usePlanningSearch hook
 */

// Simple filter type definition
export interface SearchFilters {
  status?: string;
  type?: string;
  classification?: string;
}

export interface PlanningSearchResult {
  applications: any[];
  isLoading: boolean;
  error: Error | null;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
}
