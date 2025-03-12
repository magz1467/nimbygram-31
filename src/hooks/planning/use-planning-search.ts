
import { useSpatialSearch } from "@/hooks/use-spatial-search";
import { SearchCoordinates } from "@/types/search";

// Simple re-export of useSpatialSearch to maintain compatibility
export const usePlanningSearch = (coordinates: SearchCoordinates | null) => {
  return useSpatialSearch(coordinates);
};
