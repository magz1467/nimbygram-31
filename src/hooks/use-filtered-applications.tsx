
import { useMemo } from 'react';
import { Application } from "@/types/planning";
import { SortType } from "@/types/application-types";
import { applyAllFilters } from "@/utils/applicationFilters";
import { addDistanceToApplications } from "@/utils/applicationDistance";
import { useApplicationSorting } from './use-application-sorting';
import { filterByLocationRelevance } from '@/services/applications/transform-applications';

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
  searchCoordinates?: [number, number] | null,
  searchTerm?: string
) => {
  return useMemo(() => {
    console.log('useFilteredApplications - Input applications:', applications?.length);
    console.log('useFilteredApplications - Active filters:', activeFilters);
    console.log('useFilteredApplications - Active sort:', activeSort);
    console.log('useFilteredApplications - Search coordinates:', searchCoordinates);
    console.log('useFilteredApplications - Search term:', searchTerm);
    
    if (!applications || applications.length === 0) {
      return [];
    }
    
    // Apply all generic filters first (status, type, etc.)
    const filteredApplications = applyAllFilters(applications, activeFilters);
    console.log('After applying filters:', filteredApplications.length);
    
    // Apply location relevance filtering if we have a search term
    const locationFilteredApplications = searchTerm 
      ? filterByLocationRelevance(filteredApplications, searchTerm)
      : filteredApplications;
    console.log('After location relevance filtering:', locationFilteredApplications.length);
    
    // Add distance information if search coordinates are available
    const applicationsWithDistance = searchCoordinates
      ? addDistanceToApplications(locationFilteredApplications, searchCoordinates)
      : locationFilteredApplications;
    console.log('After adding distance:', applicationsWithDistance.length);
    
    // Apply sorting based on active sort type or default to distance sort if coordinates available
    let finalSortedApplications = applicationsWithDistance;
    
    if (activeSort) {
      finalSortedApplications = useApplicationSorting({
        type: activeSort,
        applications: applicationsWithDistance
      });
    } else if (searchCoordinates) {
      // If no sort specified but we have coordinates, default to distance sort
      finalSortedApplications = useApplicationSorting({
        type: 'distance',
        applications: applicationsWithDistance
      });
    }

    console.log('useFilteredApplications - Final sorted applications:', finalSortedApplications?.length);
    return finalSortedApplications;
  }, [applications, activeFilters, activeSort, searchCoordinates, searchTerm]);
};
