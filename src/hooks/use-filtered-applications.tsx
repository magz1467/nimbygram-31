
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

    // Calculate distances and add distance string to each application if we have search coordinates
    let appsWithDistance = [...filteredApplications];
    
    if (searchCoordinates) {
      appsWithDistance = appsWithDistance.map(app => {
        if (!app.coordinates) return app;
        
        const distanceInKm = calculateDistance(searchCoordinates, app.coordinates);
        const distanceInMiles = distanceInKm * 0.621371;
        return {
          ...app,
          distance: `${distanceInMiles.toFixed(1)} mi`
        };
      });
    }

    // Determine which sort to use (default to distance when coordinates available)
    const effectiveSort = activeSort || (searchCoordinates ? 'distance' : null);
    
    // Apply sorting
    const finalSortedApplications = effectiveSort ? 
      useApplicationSorting({
        type: effectiveSort,
        applications: appsWithDistance
      }) : 
      appsWithDistance;

    console.log('useFilteredApplications - Final sorted applications:', finalSortedApplications?.length);
    return finalSortedApplications;
  }, [applications, activeFilters, activeSort, searchCoordinates]);
};
