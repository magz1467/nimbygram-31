
import { useMemo } from 'react';
import { Application } from "@/types/planning";
import { SortType } from "@/types/application-types";
import { applyAllFilters } from "@/utils/applicationFilters";
import { useApplicationSorting } from './use-application-sorting';
import { filterByLocationRelevance, transformAndSortApplications } from '@/services/applications/transforms';

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
    
    // Process through the location filter (which now just passes applications through)
    // This is kept for extensibility but no longer affects sorting
    const processedApplications = filterByLocationRelevance(filteredApplications, searchTerm || '');
    
    console.log('After processing location filters:', processedApplications.length);
    
    // If search coordinates available, sort by distance only
    let applicationsFinal = processedApplications;
    if (searchCoordinates) {
      console.log('Sorting by distance only');
      applicationsFinal = transformAndSortApplications(processedApplications, searchCoordinates);
    }
    
    // Apply explicit sorting based on active sort type, if different from default
    // Only do this if not using distance sorting
    if (activeSort && activeSort !== 'distance') {
      console.log('Applying explicit sorting by:', activeSort);
      applicationsFinal = useApplicationSorting({
        type: activeSort,
        applications: applicationsFinal
      });
    }

    console.log('useFilteredApplications - Final applications:', applicationsFinal?.length);
    
    // Log the final closest applications for debugging
    if (applicationsFinal.length > 0) {
      const topApps = applicationsFinal.slice(0, 3).map(app => ({
        id: app.id,
        distance: app.distance,
        address: app.address
      }));
      console.log('Top applications in final result:', topApps);
    }
    
    return applicationsFinal;
  }, [applications, activeFilters, activeSort, searchCoordinates, searchTerm]);
};
