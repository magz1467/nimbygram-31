
import { useMemo } from 'react';
import { Application } from "@/types/planning";
import { SortType } from "@/types/application-types";
import { applyAllFilters } from "@/utils/applicationFilters";
import { addDistanceToApplications } from "@/utils/applicationDistance";
import { useApplicationSorting } from './use-application-sorting';

interface ActiveFilters {
  status?: string;
  type?: string;
  search?: string;
  classification?: string;
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
    
    if (!applications || applications.length === 0) {
      return [];
    }
    
    // Apply all filters first
    const filteredApplications = applyAllFilters(applications, activeFilters);
    
    // Add distance information if search coordinates are available
    const applicationsWithDistance = addDistanceToApplications(filteredApplications, searchCoordinates);
    
    // Apply sorting based on active sort type or default to distance sort if coordinates available
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
