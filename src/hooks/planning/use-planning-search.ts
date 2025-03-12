
import { usePlanningSearchCore } from './search/use-planning-search-core';
export type { SearchFilters } from './search/types';

/**
 * Hook for searching planning applications based on coordinates
 * This is the main entry point that internally uses multiple specialized hooks
 */
export const usePlanningSearch = (coordinates: [number, number] | null) => {
  return usePlanningSearchCore(coordinates);
};
