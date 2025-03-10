import { useMemo } from 'react';
import { Application } from "@/types/planning";
import { SortType } from "@/types/application-types";
import { applyAllFilters } from "@/utils/applicationFilters";
import { useApplicationSorting } from './use-application-sorting';
import { filterByLocationRelevance } from '@/services/applications/transforms';

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
    console.log('📊 useFilteredApplications - Input applications:', applications?.length || 0);
    console.log('📊 useFilteredApplications - Active filters:', activeFilters || {});
    console.log('📊 useFilteredApplications - Active sort:', activeSort || 'none');
    console.log('📊 useFilteredApplications - Search coordinates:', searchCoordinates || 'none');
    console.log('📊 useFilteredApplications - Search term:', searchTerm || 'none');
    console.log('📊 useFilteredApplications - Page:', page, 'Page size:', pageSize);
    
    if (!applications || applications.length === 0) {
      console.log('No applications provided to filter');
      return { applications: [], totalCount: 0 };
    }
    
    // Apply all generic filters first (status, type, etc.)
    const safeApplications = applications || [];
    const safeFilters = activeFilters || {};
    const filteredApplications = applyAllFilters(safeApplications, safeFilters);
    console.log('After applying filters:', filteredApplications?.length || 0);
    
    // Process through the location filter (which just passes applications through)
    const locationFilterInput = filteredApplications || [];
    const processedApplications = filterByLocationRelevance(locationFilterInput, searchTerm || '');
    console.log('After processing location filters:', processedApplications?.length || 0);
    
    // Apply sorting based on sort type and coordinates
    let applicationsFinal = processedApplications || [];
    
    // If we have coordinates and sort type is distance, or no sort is specified, sort by distance
    if (searchCoordinates && (activeSort === 'distance' || !activeSort)) {
      console.log('🌍 Sorting by distance using coordinates:', searchCoordinates);
      applicationsFinal = useApplicationSorting({
        type: 'distance',
        applications: processedApplications || [],
        coordinates: searchCoordinates
      });
    } 
    // Otherwise, use the specified sort type
    else if (activeSort) {
      console.log('🔄 Applying explicit sorting by:', activeSort);
      applicationsFinal = useApplicationSorting({
        type: activeSort,
        applications: processedApplications || []
      });
    }

    // Store the total count before pagination
    const totalCount = applicationsFinal?.length || 0;
    console.log('Total applications before pagination:', totalCount);
    
    // Apply pagination
    const safeApplicationsFinal = applicationsFinal || [];
    const startIndex = page * pageSize;
    const paginatedApplications = safeApplicationsFinal.slice(startIndex, startIndex + pageSize);
    
    console.log('📊 useFilteredApplications - Paginated applications:', paginatedApplications?.length || 0);
    
    // Log the final closest applications for debugging
    if (paginatedApplications && paginatedApplications.length > 0) {
      const topApps = paginatedApplications.slice(0, 3).map(app => ({
        id: app.id,
        distance: app.distance,
        distanceValue: (app as any).distanceValue,
        address: app.address,
        coordinates: app.coordinates
      }));
      console.log('🏆 Top applications in final result:', topApps);
    } else {
      console.log('No applications in final paginated result');
    }
    
    return { 
      applications: paginatedApplications || [], 
      totalCount 
    };
  }, [applications, activeFilters, activeSort, searchCoordinates, searchTerm, page, pageSize]);
};
