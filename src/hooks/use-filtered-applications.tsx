
import { useMemo } from 'react';
import { Application } from "@/types/planning";
import { useApplicationFiltering } from './use-application-filtering';
import { useApplicationSorting } from './use-application-sorting';
import { SortType } from "@/types/application-types";
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

    // If there are search coordinates, add distance to each application
    let applicationsWithDistance = [...filteredApplications];
    
    if (searchCoordinates) {
      applicationsWithDistance = applicationsWithDistance.map(app => {
        if (!app.coordinates) return app;
        
        const distanceInKm = calculateDistance(searchCoordinates, app.coordinates);
        const distanceInMiles = distanceInKm * 0.621371;
        return {
          ...app,
          distance: `${distanceInMiles.toFixed(1)} mi`
        };
      });
    }

    // Then apply sorting based on the active sort type
    // If activeSort is 'distance', it will use the distance property added above
    const finalSortedApplications = activeSort ? 
      useApplicationSorting({
        type: activeSort,
        applications: applicationsWithDistance
      }) : 
      // If no sort specified but we have coordinates, default to distance sort
      (searchCoordinates ? 
        useApplicationSorting({
          type: 'distance',
          applications: applicationsWithDistance
        }) : 
        applicationsWithDistance);

    console.log('useFilteredApplications - Final sorted applications:', finalSortedApplications?.length);
    return finalSortedApplications;
  }, [applications, activeFilters, activeSort, searchCoordinates]);
};
