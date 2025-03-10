
import { useEffect } from 'react';
import { Application } from "@/types/planning";
import { useFilteredApplications } from "@/hooks/use-filtered-applications";
import { SortType } from "@/types/application-types";

interface UseSearchViewFiltersProps {
  applications: Application[] | undefined;
  activeFilters: {
    status?: string;
    type?: string;
    classification?: string;
  };
  activeSort: SortType;
  coordinates: [number, number] | null;
  searchTerm?: string;
}

export const useSearchViewFilters = ({
  applications,
  activeFilters,
  activeSort,
  coordinates,
  searchTerm
}: UseSearchViewFiltersProps) => {
  // Default to distance sort when coordinates are available
  const effectiveSort = coordinates && !activeSort ? 'distance' : activeSort;
  
  // Use the filtered applications hook with coordinates and search term
  const result = useFilteredApplications(
    applications || [],
    activeFilters,
    effectiveSort,
    coordinates,
    searchTerm // Pass search term for location relevance
  );

  const displayApplications = result.applications || [];

  // Log the location search coordinates and closest applications
  useEffect(() => {
    if (coordinates && displayApplications.length > 0) {
      console.log('🌍 Search location coordinates:', coordinates);
      
      // Log the 3 closest applications
      console.log('📍 Top applications in search results:', 
        displayApplications.slice(0, 3).map(app => ({
          id: app.id,
          address: app.address,
          coordinates: app.coordinates,
          distance: app.distance || 'unknown'
        }))
      );
    }
  }, [coordinates, displayApplications]);

  return {
    displayApplications,
    totalCount: result.totalCount || 0
  };
};
