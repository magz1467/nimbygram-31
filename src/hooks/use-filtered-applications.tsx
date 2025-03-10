
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

interface FilteredApplicationsResult {
  applications: Application[];
  totalCount: number;
}

export const useFilteredApplications = (
  applications: Application[],
  activeFilters: ActiveFilters,
  activeSort?: SortType,
  searchCoordinates?: [number, number] | null,
  searchTerm?: string,
  page: number = 0,
  pageSize: number = 25
): FilteredApplicationsResult => {
  return useMemo(() => {
    console.log('useFilteredApplications - Input applications:', applications?.length);
    console.log('useFilteredApplications - Active filters:', activeFilters);
    console.log('useFilteredApplications - Active sort:', activeSort);
    console.log('useFilteredApplications - Search coordinates:', searchCoordinates);
    console.log('useFilteredApplications - Search term:', searchTerm);
    console.log('useFilteredApplications - Page:', page, 'Page size:', pageSize);
    
    if (!applications || applications.length === 0) {
      return { applications: [], totalCount: 0 };
    }
    
    // Apply all generic filters first (status, type, etc.)
    const filteredApplications = applyAllFilters(applications, activeFilters);
    console.log('After applying filters:', filteredApplications.length);
    
    // Process through the location filter (which just passes applications through)
    const processedApplications = filterByLocationRelevance(filteredApplications, searchTerm || '');
    console.log('After processing location filters:', processedApplications.length);
    
    // Initialize our array before sorting
    let applicationsFinal = [...processedApplications];
    
    // Apply sorting based on sort type and coordinates
    if (searchCoordinates && (activeSort === 'distance' || activeSort === 'nearest')) {
      console.log('Sorting by distance');
      applicationsFinal = transformAndSortApplications(processedApplications, searchCoordinates);
    } else if (activeSort) {
      console.log('Applying explicit sorting by:', activeSort);
      applicationsFinal = useApplicationSorting({
        type: activeSort,
        applications: processedApplications
      });
    }

    // Store the total count before pagination
    const totalCount = applicationsFinal.length;
    console.log('Total applications before pagination:', totalCount);
    
    // Apply pagination
    const startIndex = page * pageSize;
    const paginatedApplications = applicationsFinal.slice(startIndex, startIndex + pageSize);
    
    console.log('useFilteredApplications - Paginated applications:', paginatedApplications?.length);
    
    // Log the final closest applications for debugging
    if (paginatedApplications.length > 0) {
      const topApps = paginatedApplications.slice(0, 3).map(app => ({
        id: app.id,
        distance: app.distance,
        distanceValue: (app as any).distanceValue,
        address: app.address
      }));
      console.log('Top applications in final result:', topApps);
    }
    
    return { applications: paginatedApplications, totalCount };
  }, [applications, activeFilters, activeSort, searchCoordinates, searchTerm, page, pageSize]);
};
