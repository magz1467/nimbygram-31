
import { useEffect } from 'react';
import { Application } from "@/types/planning";
import { useFilteredApplications } from "@/hooks/use-filtered-applications";

interface UseSearchViewFiltersProps {
  applications: Application[] | undefined;
  activeFilters: {
    status?: string;
    type?: string;
    classification?: string;
  };
  activeSort: string;
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
