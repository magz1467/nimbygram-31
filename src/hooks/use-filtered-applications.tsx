
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
    // Guard against empty applications array
    if (!applications || !Array.isArray(applications) || applications.length === 0) {
      return { applications: [], totalCount: 0 };
    }
    
    // Apply all generic filters first (status, type, etc.)
    const filteredApplications = applyAllFilters(applications, activeFilters);
    
    // Process through the location filter if needed
    let processedApplications = filteredApplications;
    if (searchTerm) {
      try {
        processedApplications = filterByLocationRelevance(filteredApplications, searchTerm);
      } catch (error) {
        console.error('Error in location relevance filtering:', error);
      }
    }
    
    // Apply sorting using our simplified hook
    const sortedApplications = useApplicationSorting(
      processedApplications,
      activeSort,
      searchCoordinates
    );

    // Store the total count before pagination
    const totalCount = sortedApplications.length;
    
    // Apply pagination
    const startIndex = page * pageSize;
    const paginatedApplications = sortedApplications.slice(startIndex, startIndex + pageSize);
    
    return { 
      applications: paginatedApplications, 
      totalCount 
    };
  }, [applications, activeFilters, activeSort, searchCoordinates, searchTerm, page, pageSize]);
};
