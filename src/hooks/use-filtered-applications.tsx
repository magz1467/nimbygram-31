
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
    const applicationsWithDistance = searchCoordinates 
      ? addDistanceToApplications(filteredApplications, searchCoordinates)
      : filteredApplications;
    
    // Determine which sort type to use
    // If coordinates are available, prioritize distance sort
    const effectiveSort = searchCoordinates 
      ? (activeSort || 'distance') 
      : activeSort;
    
    console.log('Using effective sort type:', effectiveSort);
    
    // Apply sorting based on determined sort type
    const finalSortedApplications = effectiveSort
      ? useApplicationSorting({
          type: effectiveSort,
          applications: applicationsWithDistance
        }) 
      : applicationsWithDistance;

    console.log('useFilteredApplications - Final sorted applications:', finalSortedApplications?.length);
    
    // Log the first few results to verify distance sorting
    if (finalSortedApplications.length > 0 && searchCoordinates) {
      console.log('First 5 sorted applications distances:');
      finalSortedApplications.slice(0, 5).forEach((app, i) => {
        console.log(`[${i}] ${app.id}: ${app.address || 'No address'} - ${app.distance} (${app.distanceValue?.toFixed(2)}km)`);
      });
    }
    
    return finalSortedApplications;
  }, [applications, activeFilters, activeSort, searchCoordinates]);
};
