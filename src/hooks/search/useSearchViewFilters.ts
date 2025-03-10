
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
  
  console.log('🔍 useSearchViewFilters - Inputs:', {
    applicationsCount: applications?.length || 0,
    filters: activeFilters,
    sort: effectiveSort,
    coordinates,
    searchTerm
  });
  
  // Make sure we have valid inputs
  const safeApplications = Array.isArray(applications) ? applications : [];
  const safeFilters = activeFilters || {};
  
  // Use the filtered applications hook with coordinates and search term
  const result = useFilteredApplications(
    safeApplications,
    safeFilters,
    effectiveSort,
    coordinates,
    searchTerm // Pass search term for location relevance
  );

  // Ensure we have valid results
  const displayApplications = result && Array.isArray(result.applications) ? result.applications : [];
  const totalCount = result && typeof result.totalCount === 'number' ? result.totalCount : 0;

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
    } else if (coordinates) {
      console.log('🌍 Search location coordinates:', coordinates, 'but no applications found');
    }
  }, [coordinates, displayApplications]);

  return {
    displayApplications,
    totalCount
  };
};
