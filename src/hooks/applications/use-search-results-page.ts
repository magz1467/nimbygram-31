import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useCoordinates } from "@/hooks/use-coordinates";
import { usePlanningSearch, SearchFilters } from "@/hooks/planning/use-planning-search";
import { SortType } from "@/types/application-types";

export const useSearchResultsPage = () => {
  const location = useLocation();
  const [error, setError] = useState<Error | null>(null);
  const searchState = location.state;
  
  const { coordinates, isLoading: isLoadingCoords } = useCoordinates(
    searchState?.searchTerm || ''
  );

  const { 
    applications, 
    isLoading: isLoadingResults,
    error: searchError,
    filters,
    setFilters
  } = usePlanningSearch(coordinates);

  useEffect(() => {
    if (searchError) {
      setError(searchError);
    }
  }, [searchError]);

  const isLoading = isLoadingCoords || isLoadingResults;

  return {
    searchState,
    applications,
    isLoading,
    error,
    setError,
    filters,
    setFilters
  };
};
