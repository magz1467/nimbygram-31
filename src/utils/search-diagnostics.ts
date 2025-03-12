
import { executeSearch } from "@/hooks/planning/search/search-executor";
import { performSpatialSearch } from "@/hooks/planning/search/spatial-search";
import type { SearchMethod, SearchParams, SearchFilters } from "@/hooks/planning/search/types";
import { usePlanningSearch } from "@/hooks/planning/use-planning-search";
import { useSearchStateManager } from "@/hooks/planning/search/use-search-state-manager";
import { useCoordinates } from "@/hooks/use-coordinates";

// Export all search-related functionality for diagnostics
export const searchDiagnostics = {
  // Core search functionality
  executeSearch,
  performSpatialSearch,
  
  // Hooks
  usePlanningSearch,
  useSearchStateManager,
  useCoordinates,
  
  // Diagnostic functions
  logSearchState: (params: SearchParams) => {
    console.log('Search Parameters:', {
      coordinates: params.coordinates,
      radius: params.radius,
      filters: params.filters,
      timestamp: new Date().toISOString()
    });
  },

  logSearchProgress: (stage: string, progress: number) => {
    console.log('Search Progress:', {
      stage,
      progress,
      timestamp: new Date().toISOString()
    });
  },

  logSearchResults: (results: any[], method: SearchMethod) => {
    console.log('Search Results:', {
      count: results.length,
      method,
      timestamp: new Date().toISOString(),
      firstResult: results[0],
      lastResult: results[results.length - 1]
    });
  },

  logSearchError: (error: Error) => {
    console.error('Search Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
};

export type { SearchParams, SearchFilters };
