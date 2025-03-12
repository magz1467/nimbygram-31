
import { useSpatialSearch } from '../use-spatial-search';
export type { SearchCoordinates } from '@/types/search';

/**
 * Hook for searching planning applications based on coordinates
 * This is the main entry point that internally uses specialized hooks
 */
export const usePlanningSearch = (coordinates: [number, number] | null) => {
  const formattedCoordinates = coordinates ? { lat: coordinates[0], lng: coordinates[1] } : null;
  return useSpatialSearch(formattedCoordinates);
};
