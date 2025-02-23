
import { useMemo } from 'react';
import { Application } from "@/types/planning";
import { useApplicationFiltering } from './use-application-filtering';
import { useApplicationSorting, SortType } from './use-application-sorting';
import { calculateDistance } from "@/utils/distance";

interface ActiveFilters {
  status?: string;
  type?: string;
  search?: string;
}

export const useFilteredApplications = (
  applications: Application[],
  activeFilters: ActiveFilters,
  activeSort?: SortType,
  searchCoordinates?: [number, number] | null
) => {
  return useMemo(() => {
    console.log('useFilteredApplications - Input applications:', applications?.length);
    console.log('useFilteredApplications - Active filters:', activeFilters);
    console.log('useFilteredApplications - Active sort:', activeSort);
    console.log('useFilteredApplications - Search coordinates:', searchCoordinates);
    
    // First apply filters
    const filteredApplications = useApplicationFiltering(applications, activeFilters);

    // Then calculate distances and sort by distance if we have search coordinates
    let sortedApplications = [...filteredApplications];
    
    if (searchCoordinates) {
      sortedApplications.sort((a, b) => {
        if (!a.coordinates || !b.coordinates) return 0;
        
        const distanceA = calculateDistance(searchCoordinates, a.coordinates);
        const distanceB = calculateDistance(searchCoordinates, b.coordinates);
        
        return distanceA - distanceB;
      });

      // Add distance string to each application
      sortedApplications = sortedApplications.map(app => {
        if (!app.coordinates) return app;
        
        const distanceInKm = calculateDistance(searchCoordinates, app.coordinates);
        const distanceInMiles = distanceInKm * 0.621371;
        return {
          ...app,
          distance: `${distanceInMiles.toFixed(1)} mi`
        };
      });
    }

    // Then apply any other sorting if specified
    const finalSortedApplications = activeSort ? 
      useApplicationSorting({
        type: activeSort,
        applications: sortedApplications
      }) : 
      sortedApplications;

    console.log('useFilteredApplications - Final sorted applications:', finalSortedApplications?.length);
    return finalSortedApplications;
  }, [applications, activeFilters, activeSort, searchCoordinates]);
};
