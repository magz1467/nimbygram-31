
// Types for planning search functionality
export interface SearchFilters {
  status?: string;
  type?: string;
}

export interface PlanningSearchResult {
  applications: any[];
  isLoading: boolean;
  isSearchInProgress: boolean;
  hasPartialResults: boolean;
  error: Error | null;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  searchRadius: number;
  setSearchRadius: (radius: number) => void;
}
