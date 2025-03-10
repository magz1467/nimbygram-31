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
    if (!applications || !Array.isArray(applications)) {
      console.log('No valid applications array provided to filter');
      return { applications: [], totalCount: 0 };
    }
    
    const safeApplications = applications;
    if (safeApplications.length === 0) {
      console.log('Empty applications array provided to filter');
      return { applications: [], totalCount: 0 };
    }
    
    // Apply all generic filters first (status, type, etc.)
    const safeFilters = activeFilters || {};
    const filteredApplications = applyAllFilters(safeApplications, safeFilters);
    console.log('After applying filters:', filteredApplications?.length || 0);
    
    // Process through the location filter with explicit function check
    const locationFilterInput = Array.isArray(filteredApplications) ? filteredApplications : [];
    let processedApplications = locationFilterInput;
    
    if (typeof filterByLocationRelevance === 'function' && searchTerm) {
      try {
        processedApplications = filterByLocationRelevance(locationFilterInput, searchTerm);
      } catch (error) {
        console.error('Error in location relevance filtering:', error);
        processedApplications = locationFilterInput;
      }
    }
    
    console.log('After processing location filters:', processedApplications?.length || 0);
    
    // Apply sorting based on sort type and coordinates - with strong validation
    let applicationsFinal = Array.isArray(processedApplications) ? processedApplications : [];
    
    try {
      const validCoordinates = searchCoordinates && 
                               Array.isArray(searchCoordinates) && 
                               searchCoordinates.length === 2 && 
                               typeof searchCoordinates[0] === 'number' && 
                               typeof searchCoordinates[1] === 'number';
      
      // If we have coordinates and sort type is distance, or no sort is specified, sort by distance
      if (validCoordinates && (activeSort === 'distance' || !activeSort)) {
        console.log('🌍 Sorting by distance using coordinates:', searchCoordinates);
        applicationsFinal = useApplicationSorting({
          type: 'distance',
          applications: processedApplications,
          coordinates: searchCoordinates
        });
      } 
      // Otherwise, use the specified sort type
      else if (activeSort) {
        console.log('🔄 Applying explicit sorting by:', activeSort);
        applicationsFinal = useApplicationSorting({
          type: activeSort,
          applications: processedApplications
        });
      }
    } catch (error) {
      console.error('Error during sorting:', error);
      // Fall back to unsorted applications - ensure it's a valid array
      applicationsFinal = Array.isArray(processedApplications) ? processedApplications : [];
    }

    // Store the total count before pagination - with validation
    const totalCount = Array.isArray(applicationsFinal) ? applicationsFinal.length : 0;
    console.log('Total applications before pagination:', totalCount);
    
    // Apply pagination with safe defaults and strong type checking
    const safePage = typeof page === 'number' && !isNaN(page) ? Math.max(0, page) : 0;
    const safePageSize = typeof pageSize === 'number' && !isNaN(pageSize) ? Math.max(1, pageSize) : 25;
    const safeApplicationsFinal = Array.isArray(applicationsFinal) ? applicationsFinal : [];
    
    const startIndex = safePage * safePageSize;
    let paginatedApplications = [];
    
    try {
      paginatedApplications = safeApplicationsFinal.slice(startIndex, startIndex + safePageSize);
    } catch (error) {
      console.error('Error during pagination:', error);
      paginatedApplications = [];
    }
    
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
      applications: Array.isArray(paginatedApplications) ? paginatedApplications : [], 
      totalCount 
    };
  }, [applications, activeFilters, activeSort, searchCoordinates, searchTerm, page, pageSize]);
};
