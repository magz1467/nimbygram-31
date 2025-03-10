
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
  activeFilters: ActiveFilters = {},
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
    
    // Guard against empty applications array
    const safeApplications = Array.isArray(applications) ? applications : [];
    if (safeApplications.length === 0) {
      console.log('No applications provided to filter');
      return { applications: [], totalCount: 0 };
    }
    
    // Apply all generic filters first (status, type, etc.)
    const safeFilters = activeFilters || {};
    const filteredApplications = applyAllFilters(safeApplications, safeFilters);
    console.log('After applying filters:', filteredApplications?.length || 0);
    
    // Process through the location filter
    const locationFilterInput = filteredApplications || [];
    const processedApplications = typeof filterByLocationRelevance === 'function' ? 
      filterByLocationRelevance(locationFilterInput, searchTerm || '') : 
      locationFilterInput;
    console.log('After processing location filters:', processedApplications?.length || 0);
    
    // Apply sorting based on sort type and coordinates
    let applicationsFinal = processedApplications || [];
    
    try {
      // If we have coordinates and sort type is distance, or no sort is specified, sort by distance
      if (searchCoordinates && Array.isArray(searchCoordinates) && searchCoordinates.length === 2 && 
          (activeSort === 'distance' || !activeSort)) {
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
    } catch (error) {
      console.error('Error during sorting:', error);
      // Fall back to unsorted applications
      applicationsFinal = processedApplications || [];
    }

    // Store the total count before pagination
    const totalCount = applicationsFinal?.length || 0;
    console.log('Total applications before pagination:', totalCount);
    
    // Apply pagination with safe defaults
    const safePage = typeof page === 'number' ? page : 0;
    const safePageSize = typeof pageSize === 'number' ? pageSize : 25;
    const safeApplicationsFinal = Array.isArray(applicationsFinal) ? applicationsFinal : [];
    const startIndex = safePage * safePageSize;
    const paginatedApplications = safeApplicationsFinal.slice(startIndex, startIndex + safePageSize);
    
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
