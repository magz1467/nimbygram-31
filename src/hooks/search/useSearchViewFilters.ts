
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
  // Use the filtered applications hook with coordinates and search term
  const displayApplications = useFilteredApplications(
    applications || [],
    activeFilters,
    activeSort,
    coordinates,
    searchTerm // Pass search term for location relevance
  );

  return {
    displayApplications
  };
};
