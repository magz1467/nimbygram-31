
import { useEffect } from 'react';
import { Application } from "@/types/planning";
import { useFilteredApplications } from "@/hooks/use-filtered-applications";
import { SortType } from "@/types/application-types";
import { calculateDistance } from "@/utils/distance";

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
  const result = useFilteredApplications(
    applications || [],
    activeFilters,
    activeSort,
    coordinates,
    searchTerm // Pass search term for location relevance
  );

  const displayApplications = result.applications;

  // Log the location search coordinates and closest applications
  useEffect(() => {
    if (coordinates && displayApplications.length > 0) {
      console.log('🌍 Search location coordinates:', coordinates);
      
      // Log the 3 closest applications to help with debugging
      const closestApps = [...displayApplications]
        .sort((a, b) => {
          if (!a.coordinates || !b.coordinates || !coordinates) return 0;
          
          const distanceA = calculateDistance(coordinates, a.coordinates);
          const distanceB = calculateDistance(coordinates, b.coordinates);
          
          return distanceA - distanceB;
        })
        .slice(0, 3);
      
      console.log('📍 3 closest applications:', closestApps.map(app => ({
        id: app.id,
        address: app.address,
        coordinates: app.coordinates,
        distance: app.coordinates ? calculateDistance(coordinates, app.coordinates).toFixed(2) + 'km' : 'unknown'
      })));
    }
  }, [coordinates, displayApplications]);

  return {
    displayApplications,
    totalCount: result.totalCount
  };
};
